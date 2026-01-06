
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { KnowledgeItem } from "../types";
import { LLMAgent } from "./agentInterface";
import { getGeminiTools, TOOL_DISPLAY_NAMES, executeToolLogic } from "./toolRegistry";

export class GeminiAgent implements LLMAgent {
  private history: any[] = [];
  private policies: KnowledgeItem[];

  constructor(initialPolicies: KnowledgeItem[]) {
    this.policies = initialPolicies;
  }

  public updatePolicies(newPolicies: KnowledgeItem[]) {
    this.policies = newPolicies;
  }

  async handleConversation(userInput: string, onStatusUpdate?: (status: string) => void): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    this.history.push({
      role: 'user',
      parts: [{ text: userInput }]
    });

    let isDone = false;
    let finalResponseText = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (!isDone && loopCount < MAX_LOOPS) {
      loopCount++;
      console.log(`[调试日志/Gemini] 对话轮次: ${loopCount}`);

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: this.history,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: getGeminiTools(this.policies) }],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate || !candidate.content) {
        throw new Error("AI 未返回有效响应。");
      }

      this.history.push(candidate.content);

      const functionCalls = candidate.content.parts.filter(p => p.functionCall).map(p => p.functionCall!);

      if (functionCalls.length > 0) {
        console.log(`[调试日志/Gemini] 模型请求调用 ${functionCalls.length} 个工具`);
        
        const functionResponses = await Promise.all(
          functionCalls.map(async (fc) => {
            if (onStatusUpdate) {
              const displayName = TOOL_DISPLAY_NAMES[fc.name] || '正在处理请求';
              onStatusUpdate(`${displayName}...`);
            }

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            // 使用通用工具执行逻辑
            const result = await executeToolLogic(fc.name, fc.args, this.policies);
            
            return {
              functionResponse: {
                name: fc.name,
                response: { result },
              }
            };
          })
        );

        this.history.push({
          role: 'user',
          parts: functionResponses
        });
      } else {
        finalResponseText = response.text || "已处理您的请求。";
        isDone = true;
      }
    }

    if (loopCount >= MAX_LOOPS) {
      console.warn("[警告/Gemini] 达到最大对话轮次限制");
    }

    return finalResponseText;
  }
}
