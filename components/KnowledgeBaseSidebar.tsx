
import React from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { KnowledgeItem } from '../types';

interface SidebarProps {
  policies: KnowledgeItem[];
}

export const KnowledgeBaseSidebar: React.FC<SidebarProps> = ({ policies }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">服务中心</h2>
        <p className="text-sm text-slate-500 mt-1">自助资源与商品目录</p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {/* Help Topics */}
        <section className="p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">核心政策</h3>
          <div className="space-y-4">
            {policies.map((item, idx) => (
              <div key={idx} className="group cursor-help">
                <h4 className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  {item.topic}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="p-6 border-t border-slate-50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">精选商品</h3>
          <div className="space-y-4">
            {MOCK_PRODUCTS.slice(0, 3).map((product) => (
              <div key={product.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.name}</h4>
                  <span className="text-xs font-bold text-indigo-600">${product.price}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{product.category}</p>
                <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-grow bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(product.stock / 50) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">库存: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <div className="m-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-100">
           <h4 className="font-semibold text-sm">需要人工帮助？</h4>
           <p className="text-xs text-indigo-100 mt-1">我们的团队在周一至周五, 9am - 6pm 在线。</p>
           <button className="w-full mt-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
              转人工客服
           </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 text-center">
        <span className="text-[10px] text-slate-400">© 2024 Gemini Shop Inc. v2.3</span>
      </div>
    </div>
  );
};
