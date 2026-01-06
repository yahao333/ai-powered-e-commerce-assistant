
import { Type, FunctionDeclaration } from "@google/genai";
import { KnowledgeItem, Product, Order } from "../types";

// --- 1. 工具定义 (Gemini Format) ---
export const getGeminiTools = (policies: KnowledgeItem[]): FunctionDeclaration[] => {
  const policyTopics = policies.map(p => p.topic).join(', ');
  return [
  {
    name: 'searchProducts',
    parameters: {
      type: Type.OBJECT,
      description: 'Find products available in the store.',
      properties: {
        query: { type: Type.STRING, description: 'The product name or category to search for.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getOrderStatus',
    parameters: {
      type: Type.OBJECT,
      description: 'Retrieve the status and details of an order using its ID.',
      properties: {
        orderId: { type: Type.STRING, description: 'The order ID (e.g., ORD-1001).' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'getStorePolicy',
    parameters: {
      type: Type.OBJECT,
      description: `Retrieve store policies. Available topics: ${policyTopics}.`,
      properties: {
        topic: { type: Type.STRING, description: `The policy topic (${policyTopics}).` },
      },
      required: ['topic'],
    },
  }
]};

// --- 2. 工具定义 (OpenAI/DeepSeek Format) ---
// DeepSeek 兼容 OpenAI 的 Function Calling 格式
export const getDeepSeekTools = (policies: KnowledgeItem[]) => {
  const policyTopics = policies.map(p => p.topic).join(', ');
  return [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Find products available in the store.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The product name or category to search for." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getOrderStatus",
      description: "Retrieve the status and details of an order using its ID.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID (e.g., ORD-1001)." }
        },
        required: ["orderId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getStorePolicy",
      description: `Retrieve store policies. Available topics: ${policyTopics}.`,
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: `The policy topic (${policyTopics}).` }
        },
        required: ["topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getEasterEgg",
      description: "Retrieve the hidden easter egg.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
]};

// --- 3. 工具显示名称映射 ---
export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'searchProducts': '正在搜索商品库',
  'getOrderStatus': '正在查询订单状态',
  'getStorePolicy': '正在检索服务政策',
  'getEasterEgg': '正在寻找彩蛋'
};

// --- 4. 通用工具执行逻辑 ---
/**
 * 执行具体的业务逻辑
 * @param name 工具函数名
 * @param args 参数对象
 * @param policies 当前的知识库策略
 * @param products 当前的商品列表
 * @param orders 当前的订单列表
 */
export async function executeToolLogic(name: string, args: any, policies: KnowledgeItem[], products: Product[], orders: Order[]) {
  console.log(`[调试日志/ToolRegistry] 执行工具: ${name}`, args);
  
  switch (name) {
    case 'searchProducts':
      const results = products.filter(p => 
        p.name.toLowerCase().includes(args.query.toLowerCase()) || 
        p.category.toLowerCase().includes(args.query.toLowerCase())
      );
      console.log(`[调试日志/ToolRegistry] 商品搜索结果: ${results.length} 条`);
      return results.length > 0 ? JSON.stringify(results) : "未找到匹配该查询的商品。";
    
    case 'getOrderStatus':
      const order = orders.find(o => o.id === args.orderId);
      console.log(`[调试日志/ToolRegistry] 订单查询:`, order ? '成功' : '失败');
      return order ? JSON.stringify(order) : `未找到订单 ${args.orderId}。请检查订单号是否正确。`;
    
    case 'getStorePolicy':
      const policy = policies.find(k => 
        k.topic.toLowerCase().includes(args.topic.toLowerCase()) ||
        args.topic.toLowerCase().includes(k.topic.toLowerCase())
      );
      console.log(`[调试日志/ToolRegistry] 政策检索:`, policy ? '成功' : '失败');
      return policy ? policy.content : `未找到该主题的政策详情。目前支持：${policies.map(p => p.topic).join('、')}。`;

    case 'getEasterEgg':
      console.log(`[调试日志/ToolRegistry] 彩蛋发现`);
      return "恭喜你发现了yanghao放置的隐藏彩蛋！";
    
    default:
      throw new Error(`未知函数: ${name}`);
  }
}
