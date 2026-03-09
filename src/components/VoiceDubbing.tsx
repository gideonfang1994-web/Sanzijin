
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, CheckCircle2, Trophy, Star, RefreshCw, X } from 'lucide-react';
import { WordGroup, WordItem } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface Props {
  groups: WordGroup[];
  onFinish: (score: number) => void;
  onClose: () => void;
}

const VoiceDubbing: React.FC<Props> = ({ groups, onFinish, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  const pool = groups.flatMap(g => g.words).slice(0, 10); // Limit to 10 words for a session
  const currentWord = pool[currentIdx];

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    audio.init();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

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
        setFeedback({ text: '没听清，再试一次吧！', color: 'text-amber-500' });
      };
    }
  }, []);

  const evaluatePronunciation = (transcript: string, confidence: number) => {
    if (!currentWord) return;
    const target = currentWord.text.toLowerCase();
    
    let currentWordScore = 0;
    if (transcript === target) {
      currentWordScore = Math.floor(confidence * 100);
      if (currentWordScore < 80) currentWordScore = 85; // Boost for kids
    } else if (transcript.includes(target) || target.includes(transcript)) {
      currentWordScore = 60;
    } else {
      currentWordScore = 30;
    }

    setScore(currentWordScore);
    setTotalScore(prev => prev + currentWordScore);

    if (currentWordScore >= 80) {
      setFeedback({ text: '太棒了！发音很标准！🌟', color: 'text-emerald-500' });
      audio.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else if (currentWordScore >= 60) {
      setFeedback({ text: '不错哦，再大声一点！👍', color: 'text-blue-500' });
      audio.playClick();
    } else {
      setFeedback({ text: '加油，再试一次！💪', color: 'text-amber-500' });
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
    recognitionRef.current.start();
  };

  const nextWord = () => {
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
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-indigo-500 text-center w-full max-w-sm">
          <Trophy className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-slate-800">配音大师!</h2>
          <p className="text-slate-400 font-bold mb-6">总分：{totalScore}</p>
          <div className="bg-indigo-50 rounded-3xl p-6 mb-6 border-2 border-indigo-100">
            <p className="text-5xl font-black text-indigo-600">{Math.floor(totalScore / pool.length)} <span className="text-xl">分</span></p>
            <p className="text-xs font-bold text-indigo-400 mt-2">平均得分</p>
          </div>
          <button onClick={() => onFinish(totalScore)} className="w-full puffy-button bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl">完成挑战</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between p-4 bg-white rounded-3xl border-2 border-slate-50 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={24} className="text-slate-400" />
        </button>
        <div className="font-black text-indigo-600 text-xl flex items-center">
          <Star className="w-5 h-5 mr-2 fill-indigo-500" /> 魔法配音秀
        </div>
        <div className="font-black text-slate-400">{currentIdx + 1} / {pool.length}</div>
      </div>

      <div className="flex-1 bg-white rounded-[50px] border-4 border-white shadow-puffy flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}></div>
        </div>

        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-100 blur-3xl opacity-30 rounded-full scale-150"></div>
            <img src={currentWord.imageUrl} className="w-48 h-48 object-contain relative z-10" alt={currentWord.text} />
          </div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">{currentWord.text}</h2>
          <p className="text-2xl font-bold text-slate-400">{currentWord.translation}</p>
        </div>

        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex space-x-4">
            <button 
              onClick={() => audio.speak(currentWord.text)}
              className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-200 transition-all active:scale-90"
            >
              <Play size={32} fill="currentColor" />
            </button>
            <button 
              onClick={startRecording}
              disabled={isRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                isRecording ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Mic size={48} className="text-white" />
            </button>
            <button 
              onClick={() => { setRecognizedText(''); setScore(0); setFeedback(null); }}
              className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
            >
              <RefreshCw size={32} />
            </button>
          </div>
          
          <div className="h-20 flex flex-col items-center justify-center text-center">
            {feedback && (
              <p className={`text-xl font-black ${feedback.color} animate-bounce`}>{feedback.text}</p>
            )}
            {recognizedText && (
              <p className="text-slate-400 font-bold mt-2 italic">你说了: "{recognizedText}"</p>
            )}
          </div>

          {score > 0 && (
            <div className="w-full max-w-xs bg-slate-50 rounded-3xl p-4 border-2 border-slate-100 flex items-center justify-between">
              <span className="font-black text-slate-500">发音得分</span>
              <div className="flex items-center">
                <span className={`text-3xl font-black mr-2 ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'}`}>{score}</span>
                <Star className={`w-6 h-6 ${score >= 80 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-200'}`} />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={nextWord}
          disabled={score === 0 && !feedback}
          className={`w-full py-5 rounded-3xl font-black text-xl transition-all ${
            score > 0 || feedback ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {currentIdx === pool.length - 1 ? '完成挑战' : '下一个单词'}
        </button>
      </div>
    </div>
  );
};

export default VoiceDubbing;
