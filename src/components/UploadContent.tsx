
import React, { useState } from 'react';
import { Word, VideoLesson } from '../types';
// Added Sparkles to lucide-react imports
import { PlusCircle, FileText, Video, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Props {
  onAddWord: (word: Word) => void;
  onAddVideo: (video: VideoLesson) => void;
}

const UploadContent: React.FC<Props> = ({ onAddWord, onAddVideo }) => {
  const [tab, setTab] = useState<'WORD' | 'VIDEO'>('WORD');
  const [wordForm, setWordForm] = useState({ term: '', translation: '', example: '' });
  const [videoForm, setVideoForm] = useState({ title: '', url: '' });

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordForm.term || !wordForm.translation) return;
    onAddWord({
      id: Date.now().toString(),
      term: wordForm.term,
      translation: wordForm.translation,
      example: wordForm.example || `${wordForm.term}, ${wordForm.translation}!`,
      imageUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${wordForm.term}`,
      learned: false,
      xpValue: 15
    });
    setWordForm({ term: '', translation: '', example: '' });
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.url) return;
    let finalUrl = videoForm.url;
    if (finalUrl.includes('youtube.com/watch?v=')) {
      finalUrl = finalUrl.replace('watch?v=', 'embed/');
    }
    onAddVideo({
      id: Date.now().toString(),
      title: videoForm.title,
      url: finalUrl,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`
    });
    setVideoForm({ title: '', url: '' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[45px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-[4px] border-white">
      <div className="flex bg-slate-100 p-2 rounded-[30px] mb-8">
        <button 
          onClick={() => setTab('WORD')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[24px] font-black transition-all ${tab === 'WORD' ? 'bg-white text-rose-500 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-500'}`}
        >
          <FileText className="w-5 h-5" /> <span>魔法口诀</span>
        </button>
        <button 
          onClick={() => setTab('VIDEO')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[24px] font-black transition-all ${tab === 'VIDEO' ? 'bg-white text-indigo-500 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-500'}`}
        >
          <Video className="w-5 h-5" /> <span>节奏视频</span>
        </button>
      </div>

      {tab === 'WORD' ? (
        <form onSubmit={handleWordSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-500 ml-4 flex items-center"><PlusCircle className="w-4 h-4 mr-2" /> 输入单词</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-rose-100 focus:border-rose-300 outline-none font-black text-lg transition-all"
              value={wordForm.term}
              onChange={(e) => setWordForm({...wordForm, term: e.target.value})}
              placeholder="例如: Duck"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-500 ml-4 flex items-center">中文翻译</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-rose-100 focus:border-rose-300 outline-none font-black text-lg transition-all"
              value={wordForm.translation}
              onChange={(e) => setWordForm({...wordForm, translation: e.target.value})}
              placeholder="例如: 鸭子"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-500 ml-4 flex items-center">编排口诀 (让它押韵)</label>
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-rose-100 focus:border-rose-300 outline-none font-bold text-base transition-all h-32"
              value={wordForm.example}
              onChange={(e) => setWordForm({...wordForm, example: e.target.value})}
              placeholder="例如: 我家 Duck (鸭子) 走路 Luck (好运)!"
            />
          </div>
          <button className="w-full puffy-button bg-gradient-to-b from-rose-400 to-rose-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 mt-4">
            <Sparkles className="w-6 h-6" />
            <span>存入我的魔法宝箱</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleVideoSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-500 ml-4">视频名称</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-black text-lg transition-all"
              value={videoForm.title}
              onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
              placeholder="有趣的Phonics律动"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-500 ml-4">链接 (YouTube/Vimeo)</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-black text-lg transition-all"
              value={videoForm.url}
              onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
              placeholder="粘贴视频地址..."
            />
          </div>
          <button className="w-full puffy-button bg-gradient-to-b from-indigo-400 to-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 mt-4">
            <Video className="w-6 h-6" />
            <span>收藏到律动剧场</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default UploadContent;
