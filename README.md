<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 驱动电商客服助手（Gemini / DeepSeek）

一个纯前端的电商客服演示项目：用大模型 + Function Calling（工具调用）实现“像真客服一样”的商品咨询、订单查询、政策答疑，并提供可编辑的“服务政策知识库”和长上下文压力测试入口。

## 你能用它做什么

- 作为电商客服聊天窗口：支持多轮对话、状态提示、错误提示
- 通过工具调用查询数据：
  - 商品搜索（按名称/类别匹配）
  - 订单状态查询（示例：`ORD-1001`）
  - 店铺政策查询（退货/物流/保修）
- 在线修改“服务政策知识库”：在配置页编辑并同步到 Agent
- 切换模型服务商：Google Gemini（GenAI SDK）/ DeepSeek（OpenAI 兼容接口）
- 做长上下文检索测试：内置 Needle In A Haystack 压力测试 + 自定义数据实验室

## 技术栈

- React 19
- Vite 6
- TypeScript
- Tailwind CSS（CDN）
- @google/genai（Gemini SDK）

## 在线预览

- AI Studio 应用： https://ai.studio/apps/drive/1mpy4dypfJv6L5Q8fqMlR2d4Shc-6C8Ty

## 快速开始（本地运行）

**前置要求：** Node.js（建议 18+）

1. 安装依赖

   ```bash
   pnpm install
   ```

2. 配置环境变量

   在项目根目录创建/修改 `.env.local`：

   ```bash
   GEMINI_API_KEY=你的_Gemini_API_Key
   ```

3. 启动开发服务器

   ```bash
   pnpm dev
   ```

4. 访问页面

   - http://localhost:3000

## 登录说明

这是一个演示用的“前端假登录”：

- 默认账号/密码：`admin` / `admin`
- 账号密码可通过环境变量覆盖（未配置时会回退到默认值）：
  - `ADMIN_USER`
  - `ADMIN_PASSWORD`

## 模型与 Key 配置

- Gemini
  - 使用 `.env.local` 中的 `GEMINI_API_KEY`
- DeepSeek
  - 推荐在“系统配置”页选择 DeepSeek 后，直接在页面里输入 Key
  - 代码也会尝试读取 `DEEPSEEK_API_KEY`（若你的构建方式把它注入到前端环境中）

## 目录结构（核心）

```
.
├── components/                 # UI 组件（聊天、配置、登录、侧边栏）
├── services/                   # Agent 与工具调用逻辑
│   ├── geminiService.ts         # Gemini Agent（工具调用循环）
│   ├── deepseekService.ts       # DeepSeek Agent（OpenAI 兼容工具调用）
│   └── toolRegistry.ts          # 工具定义 + 本地执行逻辑
├── utils/                      # 工具类（长上下文数据生成）
├── constants.ts                # Mock 商品/订单/政策 + System Prompt
├── App.tsx                     # 应用入口（状态管理、Provider 切换）
└── vite.config.ts              # 环境变量注入（GEMINI_API_KEY -> process.env.API_KEY）
```

## 安全提醒

- 这是“纯前端演示项目”，API Key 会在浏览器端使用。不要把真实生产 Key 直接暴露给不可信的终端用户。
- 生产环境建议把模型调用放到后端（或使用安全代理），并加上鉴权、限流与审计。
