# Codebase Summary & Rules

## 1. 整体架构 (Overall Architecture)

本项目是一个 **单页应用 (SPA)**，完全基于前端技术栈构建，集成了 Google Gemini API 以提供智能对话功能。

*   **前端框架**: React 19 (通过 importmap 引入 ESM 模块)。
*   **构建工具**: 无需传统打包工具 (Webpack/Vite)，直接使用浏览器原生的 ES Modules (`type="module"`) 和 `importmap`。
*   **样式方案**: Tailwind CSS (通过 CDN 引入) + 自定义 CSS (Glassmorphism 效果)。
*   **核心服务层**: `services/geminiService.ts` 封装了所有与 LLM 交互的逻辑，充当 "Brain" 或 "Controller"。
*   **数据层**: `constants.ts` 充当 Mock 数据库 (Products, Orders, Policies)，没有实际的后端数据库连接。
*   **入口点**: `index.html` -> `index.tsx` -> `App.tsx`。

## 2. 关键模式 (Key Patterns)

### A. 代理模式 (Agent Pattern) with `geminiService.ts`
*   **封装性**: `GeminiAgent` 类将状态（对话历史 `history`）、知识（策略 `policies`）和行为（API 调用、工具执行）封装在一起。
*   **状态保持**: 使用 `this.history` 数组维护多轮对话的上下文。
*   **工具调用循环 (Tool Use / ReAct Loop)**: 在 `handleConversation` 中使用 `while` 循环。如果模型返回 `functionCall`，代理会在本地执行函数，将结果回传给模型，直到模型生成最终文本响应。这是实现“智能”查询的核心模式。

### B. React 状态与引用管理
*   **引用持久化 (`useRef`)**: 在 `App.tsx` 中，使用 `agentRef` 来保存 `GeminiAgent` 的实例。这避免了组件重新渲染导致对话历史丢失，同时也避免了将非 UI 状态放入 `useState` 导致的不必要渲染。
*   **状态提升 (State Lifting)**: `App.tsx` 作为单一数据源 (Single Source of Truth)，管理 `policies` (知识库) 和 `messages` (聊天记录)。子组件 (`ConfigPage`, `ChatInterface`) 通过 Props 接收数据和回调函数。

### C. 模拟异步操作
*   在 `ConfigPage` 和 `LoginPage` 中使用 `setTimeout` 模拟网络延迟，增强用户体验 (UX) 的真实感。

### D. 配置驱动的 UI
*   `KnowledgeBaseSidebar` 和 `geminiService` 中的工具执行逻辑都高度依赖 `types.ts` 和 `constants.ts` 中的数据结构定义。

## 3. 推断出的约束 (Inferred Constraints)

### A. 环境与依赖
*   **API Key 依赖**: 必须通过 `process.env.API_KEY` 提供有效的 Google GenAI API Key。
*   **浏览器环境**: 代码设计为在浏览器中直接运行，依赖 `window` 对象 (如 `alert`, `setTimeout`) 和 DOM 元素 (`root`)。
*   **Tailwind CDN**: 由于使用 CDN 版 Tailwind，不能使用 `@apply` 等构建时特性，只能使用 utility classes。

### B. 数据持久性
*   **易失性内存**: 所有的对话历史、登录状态和策略修改都存储在内存中 (React State 或 Class Instance Variable)。刷新页面后，所有数据重置为 `constants.ts` 中的初始值。
*   **无后端**: 所有“登录”和“数据查询”均为前端模拟，安全性仅限于演示层面（API Key 暴露在前端代码执行环境中）。

### C. 模型限制
*   **上下文窗口**: 虽然 `GeminiAgent` 维护历史记录，但代码中目前没有实现“历史记录修剪”或“滑动窗口”机制。如果对话过长，最终可能会超出模型的 Token 限制。
*   **单用户会话**: 系统设计为单用户模式，不区分不同用户的会话隔离（除非刷新页面）。

### D. SDK 使用规范
*   严格遵循 `@google/genai` 的最新规范，例如使用 `new GoogleGenAI({apiKey: ...})` 和直接访问 `.text` 属性，不使用已弃用的 `GoogleGenerativeAI` 类。
