# 技术深度解析：数据查询与多轮对话原理

本文档旨在深入剖析 Gemini E-Commerce Assistant 应用中两个核心功能的实现机制：**基于工具调用的数据查询**与**基于历史上下文的多轮对话**。

## 1. 数据查询实现原理 (Tool Use / Function Calling)

Gemini API 的 Function Calling 功能允许大语言模型连接外部工具和系统。在本应用中，我们利用这一特性实现了对本地模拟数据库的精确查询。

### 核心流程

整个数据查询过程可以分为四个步骤：**定义 (Definition)** -> **触发 (Trigger)** -> **执行 (Execution)** -> **生成 (Generation)**。

#### A. 工具定义 (`services/geminiService.ts`)

我们在代码中显式定义了模型可以使用的“工具”。每个工具都是一个 `FunctionDeclaration` 对象，包含函数名、描述和参数的 JSON Schema。

```typescript
// 示例：定义搜索产品的工具
const searchProductsTool: FunctionDeclaration = {
  name: 'searchProducts',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: '产品名称或类别' },
    },
    required: ['query'],
  },
};
```

这些定义在初始化请求时通过 `config.tools` 参数传给 Gemini。

#### B. 意图识别与触发

当用户输入“帮我查下订单 ORD-1001”时：
1. 模型分析语义，判断需要获取外部数据才能回答。
2. 模型匹配到 `getOrderStatus` 工具最符合需求。
3. 模型生成一个包含 **Function Call** 的响应，而不是普通文本。响应中包含函数名 `getOrderStatus` 和参数 `{ orderId: 'ORD-1001' }`。

#### C. 本地代码执行

应用端的 `GeminiAgent.handleConversation` 方法中有一个 `while` 循环专门处理这种交互：

1. **拦截调用**：检测到 `response.candidates[0].content.parts` 中包含 `functionCall`。
2. **路由执行**：`executeFunction` 方法根据函数名，在本地数据源（`MOCK_ORDERS` 或 `MOCK_PRODUCTS`）中查找数据。

```typescript
// 本地逻辑示例
case 'getOrderStatus':
  const order = MOCK_ORDERS.find(o => o.id === args.orderId);
  return order || "未找到订单";
```

#### D. 结果回传与生成

1. 应用将查询结果包装成 **Function Response** 格式。
2. 将这个响应作为一个新的 `user` 角色消息追加到对话历史中。
3. **再次调用 API**：将包含查询结果的最新历史再次发送给 Gemini。
4. 模型结合原始问题和刚刚收到的查询结果，生成最终的自然语言回复：“您的订单 ORD-1001 目前状态为已发货...”

---

## 2. 多轮对话原理 (Multi-turn Conversation)

大语言模型本身是无状态的（Stateless）。为了实现像人类一样的连续对话（例如理解“它多少钱？”中的“它”），客户端必须维护对话历史。

### 状态维护 (`history` 数组)

`GeminiAgent` 类中维护了一个私有变量 `history`：

```typescript
private history: any[] = [];
```

这个数组按时间顺序存储了对话中的所有交互片段。

### 上下文累积机制

每一次交互不仅仅是发送当前的一句话，而是发送整个历史链条。

**场景演示：**

1. **第一轮交互**
   - **用户**: “推荐几款耳机。”
   - **应用**: 将此消息存入 `history`。发送 `[User: 推荐耳机]` 给 API。
   - **模型**: 返回耳机列表。
   - **应用**: 将模型回复存入 `history`。
   - **当前历史**: `[User: 推荐耳机, Model: 耳机列表...]`

2. **第二轮交互**
   - **用户**: “第一款多少钱？”
   - **应用**: 将此消息存入 `history`。发送 **完整历史** 给 API：
     ```json
     [
       { "role": "user", "parts": [{ "text": "推荐几款耳机" }] },
       { "role": "model", "parts": [{ "text": "这里有 Ultra-Comfort 耳机..." }] },
       { "role": "user", "parts": [{ "text": "第一款多少钱？" }] }
     ]
     ```
   - **模型处理**: 模型读取历史，解析出“第一款”指的是上文提到的“Ultra-Comfort 耳机”，从而准确回答价格。

### 代码实现细节

在 `handleConversation` 方法中：

```typescript
// 1. 追加用户新输入
this.history.push({ role: 'user', parts: [{ text: userInput }] });

// 2. 发送完整历史
const response = await ai.models.generateContent({
  contents: this.history, // 关键点：传入整个数组
  // ...配置
});

// 3. 追加模型回复
this.history.push(candidate.content);
```

通过这种机制，只要 `GeminiAgent` 实例存在，对话的上下文就会一直被保留，从而实现连贯的多轮对话体验。
