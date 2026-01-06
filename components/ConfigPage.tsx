import React, { useState, useRef } from 'react';
import { KnowledgeItem, Product } from '../types';

export type AIProvider = 'gemini' | 'deepseek';

interface ConfigPageProps {
  policies: KnowledgeItem[];
  products: Product[];
  currentProvider: AIProvider;
  deepseekKey: string;
  onUpdatePolicies: (policies: KnowledgeItem[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onRunLongContextTest?: () => void;
  onRunCustomTest?: (content: string, needle: string) => void;
  onProviderChange: (provider: AIProvider) => void;
  onDeepseekKeyChange?: (key: string) => void;
  onBack: () => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ 
  policies, 
  products,
  currentProvider,
  deepseekKey,
  onUpdatePolicies, 
  onUpdateProducts,
  onRunLongContextTest, 
  onRunCustomTest,
  onProviderChange,
  onDeepseekKeyChange,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'product' | 'settings'>('policy');
  
  // 政策管理状态
  const [localPolicies, setLocalPolicies] = useState<KnowledgeItem[]>(policies);
  const [policySaveStatus, setPolicySaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [policySearchTerm, setPolicySearchTerm] = useState('');

  // 商品管理状态
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [productSaveStatus, setProductSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // 自定义数据实验室状态
  const [customContent, setCustomContent] = useState<string>('');
  const [customNeedle, setCustomNeedle] = useState<string>('SECRET-KEY-999');
  const [fileStats, setFileStats] = useState<{name: string, size: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 政策管理处理函数 ---
  const handlePolicyContentChange = (index: number, newContent: string) => {
    const updated = [...localPolicies];
    updated[index] = { ...updated[index], content: newContent };
    setLocalPolicies(updated);
    if (policySaveStatus === 'saved') setPolicySaveStatus('idle');
  };

  const handlePolicyTopicChange = (index: number, newTopic: string) => {
    const updated = [...localPolicies];
    updated[index] = { ...updated[index], topic: newTopic };
    setLocalPolicies(updated);
    if (policySaveStatus === 'saved') setPolicySaveStatus('idle');
  };

  const handleAddPolicy = () => {
    const newPolicy: KnowledgeItem = { topic: "新政策主题", content: "" };
    setLocalPolicies([...localPolicies, newPolicy]);
    setPolicySearchTerm(''); // Clear search to show new item
    if (policySaveStatus === 'saved') setPolicySaveStatus('idle');
  };

  const handleDeletePolicy = (index: number) => {
    if (window.confirm("确定要删除此政策吗？")) {
      const updated = localPolicies.filter((_, i) => i !== index);
      setLocalPolicies(updated);
      if (policySaveStatus === 'saved') setPolicySaveStatus('idle');
    }
  };

  const handleSavePolicies = () => {
    setPolicySaveStatus('saving');
    setTimeout(() => {
      onUpdatePolicies(localPolicies);
      setPolicySaveStatus('saved');
    }, 600);
  };

  // --- 商品管理处理函数 ---
  const handleProductChange = (id: string, field: keyof Product, value: string | number) => {
    const updated = localProducts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setLocalProducts(updated);
    if (productSaveStatus === 'saved') setProductSaveStatus('idle');
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      name: "新商品",
      price: 0,
      category: "未分类",
      description: "请输入商品描述",
      stock: 0
    };
    setLocalProducts([newProduct, ...localProducts]);
    setProductSearchTerm('');
    if (productSaveStatus === 'saved') setProductSaveStatus('idle');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("确定要删除此商品吗？")) {
      const updated = localProducts.filter(p => p.id !== id);
      setLocalProducts(updated);
      if (productSaveStatus === 'saved') setProductSaveStatus('idle');
    }
  };

  const handleSaveProducts = () => {
    setProductSaveStatus('saving');
    setTimeout(() => {
      onUpdateProducts(localProducts);
      setProductSaveStatus('saved');
    }, 600);
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`[调试日志] 开始读取文件: ${file.name}, 大小: ${file.size} bytes`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCustomContent(text);
        setFileStats({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        });
        console.log(`[调试日志] 文件读取成功，字符数: ${text.length}`);
      }
    };
    reader.onerror = (err) => {
      console.error('[调试日志] 文件读取失败:', err);
      alert("文件读取失败，请重试。");
    };
    reader.readAsText(file);
  };

  const filteredPolicies = localPolicies.filter(p => 
    p.topic.toLowerCase().includes(policySearchTerm.toLowerCase()) || 
    p.content.toLowerCase().includes(policySearchTerm.toLowerCase())
  );

  const filteredProducts = localProducts.filter(p => 
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">系统配置</h1>
        </div>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'policy' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            政策管理
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'product' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            商品管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            模型设置
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        
        {/* --- 政策管理 Tab --- */}
        {activeTab === 'policy' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative w-96">
                <input 
                  type="text" 
                  placeholder="搜索政策主题或内容..." 
                  value={policySearchTerm}
                  onChange={(e) => setPolicySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleAddPolicy}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加政策
                </button>
                <button 
                  onClick={handleSavePolicies}
                  disabled={policySaveStatus === 'saving' || policySaveStatus === 'saved'}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
                    policySaveStatus === 'saved' ? 'bg-green-500 hover:bg-green-600' : 
                    policySaveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {policySaveStatus === 'saved' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      已保存
                    </>
                  ) : policySaveStatus === 'saving' ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredPolicies.map((policy, index) => {
                // Find original index in localPolicies for updating
                const originalIndex = localPolicies.indexOf(policy);
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                       <input
                        type="text"
                        value={policy.topic}
                        onChange={(e) => handlePolicyTopicChange(originalIndex, e.target.value)}
                        className="font-semibold text-gray-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                        placeholder="政策主题"
                      />
                      <button 
                        onClick={() => handleDeletePolicy(originalIndex)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="删除此政策"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6">
                      <textarea
                        value={policy.content}
                        onChange={(e) => handlePolicyContentChange(originalIndex, e.target.value)}
                        className="w-full h-32 p-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                        placeholder="在此输入政策的具体内容..."
                      />
                    </div>
                  </div>
                );
              })}
              {filteredPolicies.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">没有找到匹配的政策。</p>
                  <button onClick={handleAddPolicy} className="mt-2 text-blue-600 hover:underline">创建一个新政策</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 商品管理 Tab --- */}
        {activeTab === 'product' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative w-96">
                <input 
                  type="text" 
                  placeholder="搜索商品名称、ID或分类..." 
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加商品
                </button>
                <button 
                  onClick={handleSaveProducts}
                  disabled={productSaveStatus === 'saving' || productSaveStatus === 'saved'}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
                    productSaveStatus === 'saved' ? 'bg-green-500 hover:bg-green-600' : 
                    productSaveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {productSaveStatus === 'saved' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      已保存
                    </>
                  ) : productSaveStatus === 'saving' ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all group">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* ID & Name */}
                    <div className="col-span-3 space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">商品 ID</label>
                        <input 
                          type="text" 
                          value={product.id}
                          onChange={(e) => handleProductChange(product.id, 'id', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">商品名称</label>
                        <input 
                          type="text" 
                          value={product.name}
                          onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Price & Stock & Category */}
                    <div className="col-span-3 space-y-2">
                       <div>
                        <label className="text-xs text-gray-500 block mb-1">价格 (USD)</label>
                        <input 
                          type="number" 
                          value={product.price}
                          onChange={(e) => handleProductChange(product.id, 'price', parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-200 rounded text-sm"
                        />
                      </div>
                       <div className="flex gap-2">
                         <div className="flex-1">
                           <label className="text-xs text-gray-500 block mb-1">库存</label>
                           <input 
                            type="number" 
                            value={product.stock}
                            onChange={(e) => handleProductChange(product.id, 'stock', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded text-sm"
                          />
                         </div>
                         <div className="flex-1">
                           <label className="text-xs text-gray-500 block mb-1">分类</label>
                           <input 
                            type="text" 
                            value={product.category}
                            onChange={(e) => handleProductChange(product.id, 'category', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded text-sm"
                          />
                         </div>
                       </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-5">
                       <label className="text-xs text-gray-500 block mb-1">商品描述</label>
                       <textarea 
                        value={product.description}
                        onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                        className="w-full h-[108px] p-2 border border-gray-200 rounded text-sm resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center pt-8">
                       <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除商品"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">没有找到匹配的商品。</p>
                  <button onClick={handleAddProduct} className="mt-2 text-blue-600 hover:underline">添加一个新商品</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 模型设置 Tab (原配置页内容) --- */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* AI 模型选择 */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </span>
                AI 模型选择
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => onProviderChange('gemini')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    currentProvider === 'gemini' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">模型 A (Gemini)</span>
                    {currentProvider === 'gemini' && <span className="text-blue-500">● 活跃</span>}
                  </div>
                  <p className="text-sm text-gray-500">Google 最新的多模态模型，擅长长文本处理和多任务理解。</p>
                </div>

                <div 
                  onClick={() => onProviderChange('deepseek')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    currentProvider === 'deepseek' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">模型 B (DeepSeek)</span>
                    {currentProvider === 'deepseek' && <span className="text-blue-500">● 活跃</span>}
                  </div>
                  <p className="text-sm text-gray-500">DeepSeek-V3，国产开源之光，逻辑推理能力强劲。</p>
                  
                  {/* DeepSeek Key 输入框 */}
                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">API Key (可选)</label>
                    <input 
                      type="password" 
                      value={deepseekKey}
                      onChange={(e) => onDeepseekKeyChange && onDeepseekKeyChange(e.target.value)}
                      placeholder="sk-..."
                      className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">如未设置，将尝试使用环境变量。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 长上下文测试工具 */}
            {onRunLongContextTest && onRunCustomTest && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-3 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </span>
                实验室：长上下文能力测试 (Needle In A Haystack)
              </h2>
              
              <div className="space-y-6">
                {/* 预设测试 */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-2">快速测试</h3>
                  <p className="text-sm text-gray-500 mb-4">生成约 50k tokens 的混合数据，并在其中插入隐藏信息"SecretCode: 42"。</p>
                  <button 
                    onClick={onRunLongContextTest}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    运行 50k 压力测试
                  </button>
                </div>

                {/* 自定义测试 */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-2">自定义数据测试</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">1. 上传长文本文件 (txt/md/json)</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50"
                        >
                          选择文件...
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept=".txt,.md,.json,.log"
                          onChange={handleFileUpload}
                        />
                        {fileStats && (
                          <span className="text-sm text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {fileStats.name} ({fileStats.size})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">2. 设置待查找的“针” (Needle)</label>
                      <input 
                        type="text" 
                        value={customNeedle}
                        onChange={(e) => setCustomNeedle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="例如：特定订单号、隐藏口令等"
                      />
                    </div>

                    <button 
                      onClick={() => onRunCustomTest(customContent, customNeedle)}
                      disabled={!customContent}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        customContent 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      开始自定义测试
                    </button>
                  </div>
                </div>
              </div>
            </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};