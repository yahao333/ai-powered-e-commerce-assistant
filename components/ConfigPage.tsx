
import React, { useState, useRef } from 'react';
import { KnowledgeItem } from '../types';

export type AIProvider = 'gemini' | 'deepseek';

interface ConfigPageProps {
  policies: KnowledgeItem[];
  currentProvider: AIProvider;
  deepseekKey: string;
  onUpdatePolicies: (policies: KnowledgeItem[]) => void;
  onRunLongContextTest: () => void;
  onRunCustomTest: (content: string, needle: string) => void;
  onProviderChange: (provider: AIProvider) => void;
  onDeepSeekKeyChange: (key: string) => void;
  onBack: () => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ 
  policies, 
  currentProvider,
  deepseekKey,
  onUpdatePolicies, 
  onRunLongContextTest, 
  onRunCustomTest,
  onProviderChange,
  onDeepSeekKeyChange,
  onBack 
}) => {
  const [localPolicies, setLocalPolicies] = useState<KnowledgeItem[]>(policies);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // 自定义数据实验室状态
  const [customContent, setCustomContent] = useState<string>('');
  const [customNeedle, setCustomNeedle] = useState<string>('SECRET-KEY-999');
  const [fileStats, setFileStats] = useState<{name: string, size: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePolicyChange = (index: number, newContent: string) => {
    const updated = [...localPolicies];
    updated[index] = { ...updated[index], content: newContent };
    setLocalPolicies(updated);
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // 模拟 API 延迟
    setTimeout(() => {
      onUpdatePolicies(localPolicies);
      setSaveStatus('saved');
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

  // 生成随机噪音数据追加到当前内容
  const handleAppendNoise = () => {
    const noiseBlock = " [噪音数据生成-测试长上下文能力-重复填充] ".repeat(1000); // 约 50k chars
    const newContent = customContent + "\n" + noiseBlock;
    setCustomContent(newContent);
    console.log(`[调试日志] 追加噪音数据，当前总长度: ${newContent.length} 字符`);
  };

  const handleTriggerCustomTest = () => {
    if (!customContent.trim()) {
      alert("请先导入文件或生成数据内容。");
      return;
    }
    console.log(`[调试日志] 触发自定义测试，Needle: ${customNeedle}`);
    onRunCustomTest(customContent, customNeedle);
  };

  return (
    <div className="flex-grow overflow-y-auto p-6 md:p-10 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">系统配置</h2>
            <p className="text-slate-500 mt-1">管理模型服务商、策略与系统诊断。</p>
          </div>
          <button 
            onClick={onBack}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            返回聊天
          </button>
        </div>

        {/* 模型选择区域 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-700 mb-4">AI 模型服务商</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => onProviderChange('gemini')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden ${currentProvider === 'gemini' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
              >
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">模型 A</span>
                    {currentProvider === 'gemini' && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
                 </div>
                 <p className="text-xs text-slate-500 mt-2">默认模型，支持更长上下文，适合长文检索与复杂问答。</p>
              </div>

              <div 
                onClick={() => onProviderChange('deepseek')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden ${currentProvider === 'deepseek' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
              >
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">模型 B</span>
                    {currentProvider === 'deepseek' && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
                 </div>
                 <p className="text-xs text-slate-500 mt-2">兼容接口接入，响应更快、成本更低，适合日常客服问答。</p>
                 
                 {/* DeepSeek API Key 输入区域 */}
                 {currentProvider === 'deepseek' && (
                   <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300" onClick={(e) => e.stopPropagation()}>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">API Key 配置</label>
                     <div className="relative">
                        <input
                           type="password"
                           value={deepseekKey}
                           onChange={(e) => onDeepSeekKeyChange(e.target.value)}
                           placeholder="sk-..."
                           className="w-full text-xs p-2 pl-2 bg-white border border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all font-mono text-slate-700"
                        />
                     </div>
                     {!deepseekKey && !process.env.DEEPSEEK_API_KEY && (
                        <div className="mt-2 text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg flex items-center gap-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                           未检测到环境变量，请手动输入 Key
                        </div>
                     )}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* 政策配置区域 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-700">服务政策知识库</h3>
          </div>
          
          {localPolicies.map((policy, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <span className="font-bold text-xs">{idx + 1}</span>
                </div>
                <label className="font-bold text-slate-700">{policy.topic}</label>
              </div>
              <textarea
                value={policy.content}
                onChange={(e) => handlePolicyChange(idx, e.target.value)}
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm leading-relaxed"
                placeholder={`输入${policy.topic}内容...`}
              />
            </div>
          ))}
          
          <div className="flex items-center justify-end gap-4 pt-4">
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                已保存并同步
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
            >
              {saveStatus === 'saving' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在同步...
                </>
              ) : '保存配置'}
            </button>
          </div>
        </div>

        {/* 诊断与测试区域 */}
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="M12 18h.01"/></svg>
            系统诊断
          </h3>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-amber-900">长上下文压力测试 (Needle In A Haystack)</h4>
              <p className="text-sm text-amber-700/80 mt-1 max-w-lg">
                生成超过 150k tokens 的测试数据，用于测试模型在海量信息中的检索能力。
                <span className="block mt-1 text-xs opacity-70">*注意：这会消耗较多 Token 额度。部分模型可能无法处理超大文本。</span>
              </p>
            </div>
            <button
              onClick={onRunLongContextTest}
              className="px-6 py-3 bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl font-bold shadow-sm transition-colors active:scale-95 whitespace-nowrap"
            >
              运行测试
            </button>
          </div>

          {/* 自定义数据实验室 */}
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 mt-4">
            <div className="mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                自定义数据实验室
              </h4>
              <p className="text-sm text-slate-500 mt-1">导入本地文件或生成噪音数据，构建自定义的长上下文测试集。</p>
            </div>

            <div className="space-y-4">
              {/* 控制栏 */}
              <div className="flex flex-wrap items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.md,.json,.csv"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                  导入文件
                </button>
                <button 
                  onClick={handleAppendNoise}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  追加噪音 (50k chars)
                </button>
              </div>

              {/* 状态面板 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">当前数据规模</label>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-slate-800">{customContent.length.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">字符</span>
                  </div>
                  {fileStats && (
                    <div className="text-[10px] text-slate-400 mt-1 truncate" title={fileStats.name}>
                      源文件: {fileStats.name} ({fileStats.size})
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">目标查找词 (Secret Key)</label>
                  <input 
                    type="text" 
                    value={customNeedle}
                    onChange={(e) => setCustomNeedle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-mono text-indigo-700 font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="输入要查找的关键词..."
                  />
                </div>
              </div>

              {/* 运行按钮 */}
              <button
                onClick={handleTriggerCustomTest}
                disabled={!customContent}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {customContent ? `运行自定义压力测试` : '请先导入或生成数据'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
