
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'error' | 'done';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: string[];
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Returned';
  estimatedDelivery?: string;
}

export interface KnowledgeItem {
  topic: string;
  content: string;
}
