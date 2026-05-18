
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
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-indigo-500 text-center w-full max-w-sm">
          {overallPassed ? (
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          ) : (
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-black text-slate-800">
            {overallPassed ? '配音挑战成功!' : '配音还需要练习!'}
          </h2>
          <div className="bg-indigo-50 rounded-3xl p-6 my-6 border-2 border-indigo-100">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">平均得分</p>
            <p className={`text-5xl font-black ${overallPassed ? 'text-indigo-600' : 'text-slate-400'}`}>
              {averageScore} <span className="text-xl">分</span>
            </p>
            <p className={`text-sm font-bold mt-2 ${overallPassed ? 'text-emerald-500' : 'text-rose-400'}`}>
              {overallPassed ? '祝贺你顺利通过！' : '加油，再试一次就能通过了！'}
            </p>
          </div>
          <button onClick={() => onFinish(totalScore)} className="w-full puffy-button bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg">
            {overallPassed ? '收获奖励' : '返回关卡'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3 max-w-md mx-auto overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-slate-50 shadow-sm relative z-20">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="font-black text-indigo-600 text-lg flex items-center truncate px-2">
          <Mic className="w-4 h-4 mr-1.5 text-indigo-500 shrink-0" /> <span className="truncate">{title}</span>
        </div>
        <div className="font-black text-slate-400 text-sm whitespace-nowrap shrink-0">{currentIdx + 1} / {pool.length}</div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border-4 border-white shadow-puffy flex flex-col p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-4 overflow-y-auto py-2">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-100 blur-3xl opacity-20 rounded-full scale-125"></div>
            <SafeImage 
              src={currentItem.imageUrl} 
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain relative z-10" 
              alt={currentItem.text} 
              fallbackText={currentItem.text}
              width="112"
              height="112"
            />
          </div>
          <div className="bg-slate-50 p-4 sm:p-5 rounded-[28px] border-2 border-slate-100 w-full flex flex-col justify-center space-y-2">
            <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-relaxed text-center space-y-1">
              {currentItem.text.split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => {
                const parts = line.split(/([a-zA-Z]+)/);
                return (
                  <p key={idx} className="whitespace-nowrap flex justify-center items-center gap-x-1">
                    {parts.map((p, i) => (
                      <span key={i} className={/^[a-zA-Z]+$/.test(p) ? "text-indigo-600 font-extrabold" : "opacity-95"}>
                        {p}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 text-center">{currentItem.translation}</p>
          </div>

          <div className="h-12 flex flex-col items-center justify-center text-center w-full">
            {feedback && (
              <p className={`text-lg font-black ${feedback.color} ${feedback.status !== 'NEUTRAL' ? 'animate-bounce' : ''}`}>
                {feedback.text}
              </p>
            )}
            {recognizedText && (
              <p className="text-slate-400 font-bold mt-0.5 italic text-[10px]">听起来像: "{recognizedText}"</p>
            )}
          </div>

          {score > 0 && (
            <div className={`w-full max-w-xs rounded-2xl p-3 border-2 flex items-center justify-between transition-colors ${score >= 60 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <span className={`font-black text-sm ${score >= 60 ? 'text-emerald-600' : 'text-rose-400'}`}>
                {score >= 60 ? '配音成功' : '配音失败'}
              </span>
              <div className="flex items-center">
                <span className={`text-2xl font-black mr-2 ${score >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>{score}</span>
                <Star className={`w-5 h-5 ${score >= 80 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4 w-full mt-4">
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => audio.speak(currentItem.text)}
              className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-200 transition-all active:scale-90"
              title="播放示范"
            >
              <Play size={24} fill="currentColor" />
            </button>
            <button 
              onClick={startRecording}
              disabled={isRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                isRecording ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Mic size={32} className="text-white" />
            </button>
            <button 
              onClick={() => { setRecognizedText(''); setScore(0); setFeedback(null); }}
              className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
              title="重置"
            >
              <RefreshCw size={24} />
            </button>
          </div>

          <button 
            onClick={nextItem}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
              score > 0 || feedback ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {currentIdx === pool.length - 1 ? '完成配音' : (score > 0 || feedback ? '下一个' : '跳过本题')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceDubbing;
