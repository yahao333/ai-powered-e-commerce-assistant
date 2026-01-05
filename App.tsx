
import React, { useState, useEffect, useRef } from 'react';
import { Message, KnowledgeItem } from './types';
import { LLMAgent } from './services/agentInterface';
import { GeminiAgent } from './services/geminiService';
import { DeepSeekAgent } from './services/deepseekService';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBaseSidebar } from './components/KnowledgeBaseSidebar';
import { ConfigPage, AIProvider } from './components/ConfigPage';
import { LoginPage } from './components/LoginPage';
import { KNOWLEDGE_BASE } from './constants';
import { generateMassivePrompt } from './utils/longContextGenerator';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'chat' | 'config'>('chat');
  
  // 状态管理
  const [currentProvider, setCurrentProvider] = useState<AIProvider>('gemini');
  const [deepseekKey, setDeepseekKey] = useState(''); // 新增：DeepSeek Key 状态
  const [policies, setPolicies] = useState<KnowledgeItem[]>(KNOWLEDGE_BASE);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "您好！我是您的专属 AI 客服助手。请问今天有什么可以帮您的？您可以询问商品详情、查询订单状态（例如：ORD-1001）或了解我们的服务政策。",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState(''); 
  
  // 使用接口类型 LLMAgent，而非具体类
  const agentRef = useRef<LLMAgent | null>(null);

  // 初始化或切换 Provider
  useEffect(() => {
    console.log(`[系统日志] 初始化 Agent, Provider: ${currentProvider}`);
    if (currentProvider === 'gemini') {
      agentRef.current = new GeminiAgent(policies);
    } else if (currentProvider === 'deepseek') {
      // 传入 deepseekKey
      agentRef.current = new DeepSeekAgent(policies, deepseekKey);
    }
  }, [currentProvider, deepseekKey]); // 依赖 deepseekKey 变化，当 Key 更新时重新实例化 Agent

  // 当策略变更时同步给 Agent
  useEffect(() => {
    if (agentRef.current) {
      agentRef.current.updatePolicies(policies);
    }
  }, [policies]);

  // 处理切换 Provider
  const handleProviderChange = (provider: AIProvider) => {
    setCurrentProvider(provider);
    // 切换模型时，可以选择清空消息或添加分割线，这里添加一条系统提示
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `🔄 已切换至 ${provider === 'gemini' ? 'Google Gemini' : 'DeepSeek'} 模型。`,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !agentRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setTypingStatus(''); 

    try {
      const responseText = await agentRef.current.handleConversation(text, (status) => {
        setTypingStatus(status);
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Agent Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，${currentProvider} 服务暂时无法处理您的请求。\n错误详情: ${error.message || '未知错误'}`,
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTypingStatus(''); 
    }
  };

  const handleRunLongContextTest = () => {
    setView('chat');
    setIsTyping(true);
    setTypingStatus('正在生成大规模测试数据...');
    
    const { fullPrompt, secretKey, estimatedTokens } = generateMassivePrompt();
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `⚡️ 正在启动长上下文压力测试...\n模型: ${currentProvider}\n数据规模: ${estimatedTokens}\n隐藏密钥: ${secretKey}\n\n正在发送数据...`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMsg]);

    setTimeout(async () => {
       setTypingStatus(`正在向 ${currentProvider} 发送 150k+ Tokens...`);
       await handleSendMessage(fullPrompt);
    }, 500);
  };

  const handleRunCustomTest = (content: string, needle: string) => {
    setView('chat');
    setIsTyping(true);
    setTypingStatus('正在处理自定义数据集...');
    
    const estimatedTokens = `≈ ${Math.ceil(content.length / 3)} tokens`;
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `🛠️ **自定义长上下文测试启动**\n模型: ${currentProvider}\n📊 数据规模: ${content.length.toLocaleString()} 字符 (${estimatedTokens})\n🎯 查找目标: "${needle}"\n\n正在加载数据...`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMsg]);

    const prompt = `我需要你进行一项长上下文检索测试。

下面是一段自定义的长文本，长度约为 ${content.length} 字符。

[文本开始]
${content}
[文本结束]

任务：
1. 仔细阅读上面的所有文本。
2. 找到并在回复中准确复述出 "${needle}" 的内容或相关上下文。
3. 评估你刚刚阅读的文本长度。

请开始寻找 "${needle}"。`;

    setTimeout(async () => {
       setTypingStatus('正在发送自定义海量数据...');
       await handleSendMessage(prompt);
    }, 800);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 animate-in fade-in duration-500">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 flex-shrink-0 border-r border-slate-200 bg-white">
        <KnowledgeBaseSidebar policies={policies} />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative h-full">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white glass-morphism z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 cursor-pointer"
              onClick={() => setView('chat')}
            >
              Y
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">
                {view === 'chat' ? 'AI 客服助手' : '系统配置'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  {currentProvider === 'gemini' ? 'Gemini 1.5' : 'DeepSeek V3'} 在线
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
             <button 
               onClick={() => setView(view === 'chat' ? 'config' : 'chat')}
               className={`p-2 rounded-lg transition-colors ${view === 'config' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
               title={view === 'chat' ? '打开设置' : '回到聊天'}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
             <button 
               onClick={() => setIsLoggedIn(false)}
               className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
               title="退出登录"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
             </button>
          </div>
        </header>

        {view === 'chat' ? (
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping}
            typingStatus={typingStatus} 
          />
        ) : (
          <ConfigPage 
            policies={policies} 
            currentProvider={currentProvider}
            deepseekKey={deepseekKey} // 传入 Key 状态
            onUpdatePolicies={setPolicies} 
            onRunLongContextTest={handleRunLongContextTest}
            onRunCustomTest={handleRunCustomTest}
            onProviderChange={handleProviderChange}
            onDeepSeekKeyChange={setDeepseekKey} // 传入 Key 更新函数
            onBack={() => setView('chat')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
