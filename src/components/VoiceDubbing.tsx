
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, CheckCircle2, Trophy, Star, RefreshCw, X } from 'lucide-react';
import { WordGroup, WordItem } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';

interface DubbingItem {
  id: string;
  text: string;
  translation: string;
  imageUrl: string;
  suffix?: string;
}

interface Props {
  items: DubbingItem[];
  onFinish: (score: number) => void;
  onClose: () => void;
  language?: string;
  title?: string;
}

const VoiceDubbing: React.FC<Props> = ({ items, onFinish, onClose, language = 'zh-CN', title = '魔法配音秀' }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string; status: 'PASS' | 'FAIL' | 'NEUTRAL' } | null>(null);

  const pool = items;
  const currentItem = pool[currentIdx];

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    audio.init();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const confidence = event.results[0][0].confidence;
        setRecognizedText(transcript);
        evaluatePronunciation(transcript, confidence);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setFeedback({ text: '麦克风权限被禁用，请开启权限后重试', color: 'text-rose-500', status: 'FAIL' });
            break;
          case 'no-speech':
            setFeedback({ text: '没听到你的声音，再试一次吧！', color: 'text-amber-500', status: 'NEUTRAL' });
            break;
          case 'network':
            setFeedback({ text: '网络连接问题，语音识别失败', color: 'text-rose-500', status: 'FAIL' });
            break;
          default:
            setFeedback({ text: '语音识别出错，请重试', color: 'text-amber-500', status: 'NEUTRAL' });
        }
      };
    }
  }, [language]);

  const evaluatePronunciation = (transcript: string, confidence: number) => {
    if (!currentItem) return;
    
    // Clean target text from annotations like (爸爸) if present
    const target = currentItem.text.toLowerCase().replace(/\([^)]*\)|（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    const cleanTranscript = transcript.replace(/\s+/g, '').trim();
    const cleanTarget = target.replace(/\s+/g, '').trim();
    
    let currentItemScore = 0;
    
    // For rhymes, precise matching is hard, so we use fuzzy comparison
    if (cleanTranscript === cleanTarget) {
      currentItemScore = Math.floor(confidence * 100);
      if (currentItemScore < 85) currentItemScore = 90; 
    } else {
      // Check for character overlap
      let matches = 0;
      const chars = cleanTarget.split('');
      chars.forEach(char => {
        if (cleanTranscript.includes(char)) matches++;
      });
      
      const ratio = matches / chars.length;
      if (ratio > 0.8) currentItemScore = 85;
      else if (ratio > 0.6) currentItemScore = 75;
      else if (ratio > 0.3) currentItemScore = 50;
      else currentItemScore = 20;
    }

    setScore(currentItemScore);
    setTotalScore(prev => prev + currentItemScore);

    if (currentItemScore >= 60) {
      setFeedback({ text: '通过！太棒了！🌟', color: 'text-emerald-500', status: 'PASS' });
      audio.playSuccess();
      if (currentItemScore >= 80) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
    } else {
      setFeedback({ text: '不通过，再加油！💪', color: 'text-rose-500', status: 'FAIL' });
      audio.playError();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别，请使用 Chrome 浏览器。');
      return;
    }
    setRecognizedText('');
    setScore(0);
    setFeedback(null);
    setIsRecording(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  };

  const nextItem = () => {
    if (currentIdx + 1 < pool.length) {
      setCurrentIdx(prev => prev + 1);
      setRecognizedText('');
      setScore(0);
      setFeedback(null);
    } else {
      setIsGameOver(true);
    }
  };

  if (isGameOver) {
    const averageScore = Math.floor(totalScore / pool.length);
    const overallPassed = averageScore >= 60;

    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 p-6">
        <div className="bg-white rounded-[40px] p-8 shadow-2xl border-[6px] border-emerald-500 text-center w-full max-w-sm">
          {overallPassed ? (
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
          ) : (
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 font-cute">
            {overallPassed ? '跟读挑战成功!' : '跟读还需要练习!'}
          </h2>
          <div className="bg-emerald-50 rounded-3xl p-5 my-6 border-2 border-emerald-100 shadow-inner">
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1 font-sans">测试结果</p>
            <p className={`text-4xl font-black ${overallPassed ? 'text-emerald-700' : 'text-rose-500'}`}>
              {overallPassed ? '✨ 顺利通过' : '⏰ 仍需练习'}
            </p>
            <p className={`text-xs font-bold mt-3 ${overallPassed ? 'text-emerald-800' : 'text-rose-600'}`}>
              {overallPassed ? '祝贺你顺利通过了全部魔法跟读！' : '加油，再试一次就能全部通过了！'}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setCurrentIdx(0);
                setTotalScore(0);
                setIsGameOver(false);
                setRecognizedText('');
                setScore(0);
                setFeedback(null);
              }} 
              className="w-full puffy-button bg-gradient-to-r from-emerald-500 to-teal-600 border-b-[5px] border-emerald-700 hover:brightness-105 active:scale-98 text-white py-3.5 rounded-2xl font-black text-base sm:text-lg shadow-lg cursor-pointer transition-all"
            >
              继续练习 🔄
            </button>
            <button 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                onFinish(overallPassed ? 100 : 0);
              }} 
              className="w-full py-2.5 rounded-2xl font-black text-sm transition-all border-b-[4px] border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-250 active:scale-[0.99] cursor-pointer"
            >
              {overallPassed ? '收下奥术魔力 ✨' : '返回奇妙地图 🗺️'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderWordWithHighlight = (word: string, suffix?: string) => {
    if (!suffix) {
      return <span className="text-indigo-600 font-extrabold">{word}</span>;
    }
    const lowerW = word.toLowerCase();
    const lowerS = suffix.toLowerCase();

    if (lowerW.endsWith(lowerS)) {
      const rootLen = word.length - suffix.length;
      const root = word.substring(0, rootLen);
      const suffPart = word.substring(rootLen);
      return (
        <span className="font-black text-indigo-600">
          <span>{root}</span>
          <span className="text-red-500 font-black animate-pulse">{suffPart}</span>
        </span>
      );
    } else {
      const idx = lowerW.indexOf(lowerS);
      if (idx !== -1) {
        const part1 = word.substring(0, idx);
        const part2 = word.substring(idx, idx + suffix.length);
        const part3 = word.substring(idx + suffix.length);
        return (
          <span className="font-black text-indigo-600">
            <span>{part1}</span>
            <span className="text-red-500 font-black animate-pulse">{part2}</span>
            {part3 && <span>{part3}</span>}
          </span>
        );
      }
    }
    return <span className="text-indigo-600 font-extrabold">{word}</span>;
  };

  return (
    <div className="flex flex-col h-full space-y-2.5 max-w-md mx-auto overflow-hidden">
      {/* Premium Colorful Header */}
      <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-[#eef2f7] via-[#fdf6e2] to-[#fcecee] rounded-[20px] border-2 border-amber-300 shadow-sm relative z-20 shrink-0">
        <button onClick={onClose} className="p-1.5 hover:bg-white rounded-xl transition-all shadow-xs active:scale-95 bg-white/70 border border-slate-200 cursor-pointer">
          <X size={16} className="text-slate-600 stroke-[3]" />
        </button>
        <div className="font-black text-slate-800 text-xs sm:text-xs flex items-center truncate px-1 gap-1 root-font">
          <span className="text-sm animate-bounce select-none">🎙️</span>
          <span className="truncate">{title}</span>
        </div>
        <div className="font-black bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap shrink-0 border border-emerald-200/60 shadow-xs">{currentIdx + 1} / {pool.length}</div>
      </div>

      {/* Friendly Guide Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-amber-50 to-rose-50 border border-amber-200/85 rounded-[16px] py-1.5 px-3 shadow-inner text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top-1 duration-300 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-md" />
        <span className="text-base shrink-0 block animate-bounce">🧙‍♂️</span>
        <p className="text-[10.5px] font-bold text-slate-600 leading-none select-none">
          点击左下 <span className="bg-sky-100 text-sky-700 font-extrabold px-1 rounded text-[10px]">▶ 示范</span>，再按中间 <span className="bg-rose-100 text-rose-700 font-extrabold px-1 rounded text-[10px]">🎙️ 话筒</span> 开始跟读
        </p>
      </div>

      {/* Main Creative Card Box WITHOUT scrollbar */}
      <div className="flex-1 bg-gradient-to-b from-white via-[#f7fdfa] to-[#f0faf5] rounded-[28px] border-3 border-emerald-350 shadow-puffy flex flex-col p-3 sm:p-4.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500" style={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}></div>
        </div>

        {/* Floating background glowing entities */}
        <div className="absolute -top-12 -right-12 w-20 h-20 bg-rose-200/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-emerald-250/20 rounded-full blur-2xl pointer-events-none" />

        {/* Compact Content Area */}
        <div className="flex-grow flex flex-col items-center justify-center space-y-2.5 py-1 sm:py-2 overflow-visible">
          {/* Enhanced Image Presentation with Glow details - Sized down beautifully */}
          <div className="relative inline-block hover:scale-105 transition-transform duration-300 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-pink-200 blur-xl opacity-35 rounded-full scale-110 animate-pulse"></div>
            <div className="bg-white/95 p-1 rounded-[14px] border border-amber-250 shadow-xs relative z-10 w-12 h-12 flex items-center justify-center">
              <SafeImage 
                src={currentItem.imageUrl} 
                className="w-8.5 h-8.5 object-contain relative z-10" 
                alt={currentItem.text} 
                fallbackText={currentItem.text}
                width="68"
                height="68"
              />
            </div>
          </div>

          {/* Suffix Colored Word Text Block - 1.5x larger font size and gorgeous layout */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-[20px] border-2 border-emerald-150 w-full flex flex-col justify-center space-y-1.5 shadow-xs relative z-10 animate-in fade-in duration-300">
            <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-relaxed text-center space-y-1 font-cute">
              {currentItem.text.split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => {
                const parts = line.split(/([a-zA-Z]+)/);
                return (
                  <p key={idx} className="whitespace-normal flex justify-center items-center flex-wrap gap-x-1 sm:gap-x-1.5">
                    {parts.map((p, i) => (
                      <span key={i} className={/^[a-zA-Z]+$/.test(p) ? "" : "opacity-95 text-slate-600 font-cute"}>
                        {/^[a-zA-Z]+$/.test(p) ? renderWordWithHighlight(p, currentItem.suffix) : p}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
            <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent mx-auto rounded-full" />
            <p className="text-[10px] sm:text-[11px] font-black text-emerald-800/80 text-center flex items-center justify-center gap-1 leading-none">
              <span>🌟 口诀:</span> <span>{currentItem.translation}</span>
            </p>
          </div>

          {/* Combined compact feedback & Speech Recognizer line */}
          <div className="min-h-7 flex flex-col items-center justify-center text-center w-full z-10 shrink-0">
            {feedback ? (
              <p className={`text-[11px] sm:text-xs font-black ${feedback.color} ${feedback.status === 'PASS' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {feedback.status === 'PASS' ? '✨ 完美契合 · 跟读通过！' : '⏰ 仍需磨砺 · 请重试！'}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-slate-450">跟读魔法蓄势待发，点击话筒开始读吧 🪄</p>
            )}
            {recognizedText && (
              <p className="text-emerald-850 bg-white/70 border border-emerald-100 rounded-md px-1.5 py-0.5 font-bold mt-0.5 italic text-[8.5px] shadow-2xs leading-none">
                听起来像: "{recognizedText}"
              </p>
            )}
          </div>
        </div>

        {/* Action Controls - Lifted up with absolute visibility and optimal layout */}
        <div className="flex flex-col items-center space-y-2 w-full mt-1.5 z-10 shrink-0">
          <div className="flex items-center justify-center space-x-6">
            <button 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                audio.speak(currentItem.text);
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#e0f2fe] hover:bg-sky-200 text-sky-600 border border-sky-300 rounded-[16px] flex items-center justify-center shadow-xs hover:scale-105 transition-all active:scale-95 cursor-pointer"
              title="播放示范"
            >
              <Play size={18} fill="currentColor" />
            </button>
            <button 
              onClick={startRecording}
              disabled={isRecording}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 border-4 border-white cursor-pointer ${
                isRecording ? 'bg-rose-500 animate-pulse ring-4 ring-rose-200' : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 hover:brightness-105'
              }`}
            >
              <Mic size={20} className="text-white" />
            </button>
            <button 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setRecognizedText('');
                setScore(0);
                setFeedback(null);
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-300 rounded-[16px] flex items-center justify-center shadow-xs hover:scale-105 transition-all active:scale-95 cursor-pointer"
              title="重置"
            >
              <RefreshCw size={18} className="stroke-[2.5]" />
            </button>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            {(score > 0 || feedback) && (
              <button 
                onClick={() => {
                  try { audio.playClick(); } catch(e){}
                  nextItem();
                }}
                className="w-full py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md border-b-[3px] border-emerald-600 hover:brightness-105 transition-all cursor-pointer active:scale-95 select-none text-center flex items-center justify-center gap-1.5"
              >
                {currentIdx === pool.length - 1 ? (
                  <span>完成跟读 ✨</span>
                ) : (
                  <span>下一个 ➡️</span>
                )}
              </button>
            )}

            {(!feedback || currentIdx < pool.length - 1) && (
              <button 
                onClick={() => {
                  try { audio.playClick(); } catch(e){}
                  nextItem();
                }}
                className="w-full py-1.5 sm:py-2 rounded-full font-black text-[11px] sm:text-xs bg-[#e6faf2] hover:bg-[#d1f7e5] text-emerald-800 border-2 border-emerald-350 shadow-puffy-xs active:scale-95 transition-all cursor-pointer select-none text-center flex items-center justify-center gap-1"
              >
                <span>跳过本题 ⏭️</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDubbing;
