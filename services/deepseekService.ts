
import { SYSTEM_PROMPT } from "../constants";
import { KnowledgeItem } from "../types";
import { LLMAgent } from "./agentInterface";
import { DEEPSEEK_TOOLS, TOOL_DISPLAY_NAMES, executeToolLogic } from "./toolRegistry";

// DeepSeek 兼容 OpenAI 接口规范
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

export class DeepSeekAgent implements LLMAgent {
  private history: DeepSeekMessage[] = [];
  private policies: KnowledgeItem[];
  private apiKey: string;
  private baseUrl: string;

  constructor(initialPolicies: KnowledgeItem[], apiKey?: string) {
    this.policies = initialPolicies;
    // 优先使用传入的 Key，其次是环境变量中的 DeepSeek Key，最后尝试通用 Key
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || process.env.API_KEY || ''; 
    this.baseUrl = "https://api.deepseek.com/chat/completions"; 
    
    console.log(`[DeepSeek Service] 初始化完成。API Endpoint: ${this.baseUrl}`);
    console.log(`[DeepSeek Service] API Key 状态: ${this.apiKey ? '已配置 (长度: ' + this.apiKey.length + ')' : '未配置'}`);

    // 初始化系统提示词
    this.history.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }

  public updatePolicies(newPolicies: KnowledgeItem[]) {
    console.log(`[DeepSeek Service] 更新知识库策略，共 ${newPolicies.length} 条。`);
    this.policies = newPolicies;
  }

  async handleConversation(userInput: string, onStatusUpdate?: (status: string) => void): Promise<string> {
    console.log(`[DeepSeek Service] 开始处理新对话。用户输入长度: ${userInput.length}`);

    if (!this.apiKey) {
        console.error("[DeepSeek Service] 错误：缺少 API Key");
        return "配置错误：未找到 API Key。请在系统配置中输入模型 B 的 API Key，或在环境变量中配置 DEEPSEEK_API_KEY。";
    }

    // 1. 添加用户消息
    this.history.push({
      role: 'user',
      content: userInput
    });

    let isDone = false;
    let finalResponseText = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (!isDone && loopCount < MAX_LOOPS) {
      loopCount++;
      console.log(`[DeepSeek Service] --- 进入第 ${loopCount} 轮对话循环 ---`);

      const requestPayload = {
        model: 'deepseek-chat', // 使用 DeepSeek V3
        messages: this.history,
        tools: DEEPSEEK_TOOLS,
        stream: false
      };

      // 记录请求摘要（避免日志过长，仅打印消息角色序列）
      const messageRoles = this.history.map(m => m.role).join(' -> ');
      console.log(`[DeepSeek Service] 发送 API 请求。当前历史: [${messageRoles}]`);
      // 如果需要调试详细内容，可以取消下行注释
      // console.log(`[DeepSeek Service] 请求 Payload:`, JSON.stringify(requestPayload, null, 2));

      const startTime = Date.now();
      
      // 2. 调用 API
      let response;
      try {
        response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestPayload)
        });
      } catch (netError: any) {
         console.error(`[DeepSeek Service] 网络请求异常:`, netError);
         throw new Error(`网络连接失败: ${netError.message}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[DeepSeek Service] 收到 API 响应。状态码: ${response.status}, 耗时: ${duration}ms`);

      if (!response.ok) {
        const errText = await response.text();
        console.error('[DeepSeek Service] API 错误响应内容:', errText);
        throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      // 记录 API 使用量 (Token Usage)
      if (data.usage) {
          console.log(`[DeepSeek Service] Token 消耗: Prompt=${data.usage.prompt_tokens}, Completion=${data.usage.completion_tokens}, Total=${data.usage.total_tokens}`);
      }

      const message = data.choices[0].message;
      
      // 3. 将助手回复加入历史
      this.history.push(message);

      // 4. 检查是否有工具调用
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`[DeepSeek Service] 模型决定调用 ${message.tool_calls.length} 个工具`);

        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const argsStr = toolCall.function.arguments;
          
          console.log(`[DeepSeek Service] 正在执行工具: ${functionName}`);
          console.log(`[DeepSeek Service] 工具参数: ${argsStr}`);

          let args;
          try {
             args = JSON.parse(argsStr);
          } catch (e) {
             console.error(`[DeepSeek Service] 参数解析失败:`, e);
             args = {}; 
          }

          if (onStatusUpdate) {
             const displayName = TOOL_DISPLAY_NAMES[functionName] || '正在处理请求';
             onStatusUpdate(`${displayName}...`);
          }

          // 模拟处理延迟
          await new Promise(resolve => setTimeout(resolve, 500));

          // 执行工具
          let resultString = "";
          try {
             const result = await executeToolLogic(functionName, args, this.policies);
             resultString = typeof result === 'string' ? result : JSON.stringify(result);
             console.log(`[DeepSeek Service] 工具执行成功。结果长度: ${resultString.length} 字符`);
          } catch (e: any) {
             console.error(`[DeepSeek Service] 工具执行出错:`, e);
             resultString = `Error executing tool: ${e.message}`;
          }

          // 5. 将工具结果回传给模型 (Role: tool)
          this.history.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: resultString
          });
        }
        // 循环继续，将带有工具结果的历史再次发给模型
        console.log(`[DeepSeek Service] 工具结果已加入历史，准备进行下一轮推理`);

      } else {
        // 没有工具调用，这是最终回复
        console.log(`[DeepSeek Service] 收到最终文本回复，对话结束。`);
        finalResponseText = message.content || "无法生成回复";
        isDone = true;
      }
    }

    if (loopCount >= MAX_LOOPS) {
      console.warn("[DeepSeek Service] 警告：达到最大对话轮次限制 (5轮)，强制结束循环。");
    }

    return finalResponseText;
  }
}
