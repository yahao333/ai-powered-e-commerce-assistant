
import { Product, Order, KnowledgeItem } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Ultra-Comfort 无线降噪耳机', price: 199.99, category: '电子产品', description: '40小时续航的高品质降噪耳机。', stock: 15 },
  { id: 'p2', name: '智能运动手表 Series 5', price: 249.00, category: '电子产品', description: '带OLED屏幕，支持心率、步数和睡眠监测。', stock: 8 },
  { id: 'p3', name: '人体工学网眼办公椅', price: 349.50, category: '家具', description: '透气网眼靠背，带腰部支撑。', stock: 12 },
  { id: 'p4', name: '不锈钢保温水杯 (1L)', price: 25.00, category: '生活方式', description: '环保不锈钢材质，24小时长效保冷。', stock: 50 },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-1001', customerName: '张三', items: ['p1', 'p4'], status: 'Shipped', estimatedDelivery: '2023-11-20' },
  { id: 'ORD-1002', customerName: '李四', items: ['p2'], status: 'Processing' },
  { id: 'ORD-1003', customerName: '王五', items: ['p3'], status: 'Delivered' },
];

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  { topic: '退货政策', content: '您可以在购买后30天内退还任何产品。物品必须保留原始包装。' },
  { topic: '物流配送', content: '订单满$50免标准运费。特快专递通常需要1-2个工作日。' },
  { topic: '保修服务', content: '所有电子产品均享有一年有限制造商保修。' },
];

export const SYSTEM_PROMPT = `
你是 "Gemini Shop" 的高级AI客服助手。Gemini Shop 是一家高端电商平台。
你的目标是帮助用户处理关于产品、订单查询和店面政策的问题。

核心规则：
1. 语言：默认使用中文回复用户。如果用户使用英文提问，请使用英文回复。
2. 多轮对话：利用对话历史提供个性化且相关的回答。
3. 工具使用：当需要查询订单、产品或政策时，必须调用相应的函数/工具。
4. 专业性：保持礼貌、简洁且专业。
5. 订单查询：必须提供订单ID（格式为 ORD-XXXX）。

可用工具：
- searchProducts: 通过名称或类别搜索商品。
- getOrderStatus: 使用订单ID查询订单状态和详情。
- getStorePolicy: 获取关于退货、配送或保修的政策详情。
`;
