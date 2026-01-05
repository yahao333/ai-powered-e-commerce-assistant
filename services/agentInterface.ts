
import { KnowledgeItem } from "../types";

/**
 * LLM Agent 通用接口
 * 所有模型服务（Gemini, DeepSeek, etc.）都必须实现此接口
 */
export interface LLMAgent {
  /**
   * 更新知识库/政策
   */
  updatePolicies(newPolicies: KnowledgeItem[]): void;

  /**
   * 处理对话核心逻辑
   * @param userInput 用户输入
   * @param onStatusUpdate 状态回调（用于显示"正在查询..."等）
   * @returns AI 的最终回复文本
   */
  handleConversation(userInput: string, onStatusUpdate?: (status: string) => void): Promise<string>;
}
