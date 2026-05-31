
import React, { useState, useRef, useEffect } from 'react';
import { chatWithTutor } from '../services/geminiService';
import { Send, Sparkles, User, Smile, Music, ChevronLeft } from 'lucide-react';

interface AITutorProps {
  onClose?: () => void;
}

const AITutor: React.FC<AITutorProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: '哈喽！我是你的节奏导师皮皮。跟我一起把单词变成好听的三字经吧！让我们开始今天的说唱练习！🐯🎵' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const response = await chatWithTutor(history, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response || '皮皮刚才走神啦，能再说一遍吗？🐯' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: '哎呀，信号不好，皮皮的说唱被打断了！试试再说一次单词。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[44px] overflow-hidden shadow-puffy border-[1.5px] border-slate-100">
      {/* Header Container */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 flex items-center text-white shadow-lg z-10 relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Music className="w-20 h-20" />
        </div>
        
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="mr-4 p-3 bg-white/10 hover:bg-white/25 active:scale-90 rounded-2xl border border-white/20 transition-all cursor-pointer text-white flex items-center justify-center shrink-0"
          >
            <ChevronLeft size={20} className="stroke-[3]" />
          </button>
        )}

        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mr-5 border border-white/30 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 shimmer-bg opacity-30"></div>
          <span className="text-4xl animate-bounce-subtle">🐯</span>
        </div>
        <div>
          <h3 className="font-black text-2xl tracking-tight">皮皮导师</h3>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2.5 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
            <p className="text-xs font-bold text-green-100 uppercase tracking-widest">Mastering Rhythms</p>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#FAFBFE] scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {m.role === 'ai' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mr-3 mt-auto shadow-sm text-lg">🐯</div>
            )}
            <div className={`max-w-[85%] p-5 rounded-[28px] shadow-sm text-[1.05rem] leading-relaxed relative ${
              m.role === 'user' 
              ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-100' 
              : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center ml-3 mt-auto shadow-sm text-slate-400">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-[28px] border border-slate-100 text-slate-400 font-bold flex items-center shadow-sm">
              <div className="flex space-x-1.5 mr-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              皮皮正在编说唱口诀...
            </div>
          </div>
        )}
      </div>

      {/* Input Field Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="发个单词让皮皮帮你编口诀吧..."
              className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-4.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-400 transition-all font-bold pr-14 placeholder:text-slate-300"
            />
            <Smile className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 hover:text-emerald-500 transition-colors cursor-pointer" />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-4.5 rounded-[22px] shadow-lg transition-all ${
              !input.trim() || isLoading 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 shadow-emerald-200'
            }`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
