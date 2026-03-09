
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HomePage from './pages/HomePage';
import AdventurePage from './pages/AdventurePage';
import ArcadePage from './pages/ArcadePage';
import NavButton from './components/NavButton';
import WordLandCard from './components/WordLandCard';
import WordChallenge from './components/WordChallenge';
import LetterScramble from './components/LetterScramble';
import MemoryMatch from './components/MemoryMatch';
import SheepMatch from './components/SheepMatch';
import BalloonPop from './components/BalloonPop';
import WhackAMole from './components/WhackAMole';
import VoiceDubbing from './components/VoiceDubbing';
import Leaderboard from './components/Leaderboard';
import UploadContent from './components/UploadContent';
import CollectionCenter from './components/CollectionCenter';
import constants from './constants';
import { WordGroup, UserStats, ViewState, DailyQuest, Word, WordItem } from './types';
import { Home, BookOpen, Gamepad2, BarChart3, Award } from 'lucide-react';
import audio from './utils/AudioUtils';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [isReviewChallenge, setIsReviewChallenge] = useState(false);
  const [challengeGroupId, setChallengeGroupId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [lastLearnedWords, setLastLearnedWords] = useState<WordItem[]>([]);
  
  const initialQuests: DailyQuest[] = [
    { id: 'q1', label: '解锁一个新魔法', target: 1, current: 0, completed: false, rewardXp: 100, rewardCoins: 10, targetView: 'CARDS' },
    { id: 'q2', label: '游乐园大获全胜', target: 1, current: 0, completed: false, rewardXp: 200, rewardCoins: 25, targetView: 'ARCADE' },
    { id: 'q3', label: '魔法净化行动', target: 1, current: 0, completed: false, rewardXp: 300, rewardCoins: 50, targetView: 'ARCADE', isReviewType: true },
  ];

  const [stats, setStats] = useState<UserStats>({
    xp: 0, level: 1, streak: 1, starCoins: 50,
    totalWordsLearned: 0, bestChallengeScore: 0,
    rank: 12, hearts: 3, maxCombo: 0, quests: initialQuests
  });

  useEffect(() => {
    audio.init();
    const savedGroups = localStorage.getItem('wordland_groups');
    const savedStats = localStorage.getItem('wordland_stats');
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    else setGroups(constants.INITIAL_GROUPS);
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const updateQuest = (questId: string, amount: number = 1) => {
    setStats(prev => {
      const newQuests = prev.quests.map(q => {
        if (q.id === questId && !q.completed) {
          const newCurrent = Math.min(q.target, q.current + amount);
          return { ...q, current: newCurrent, completed: newCurrent >= q.target };
        }
        return q;
      });
      if (newQuests.some((q, i) => q.completed && !prev.quests[i].completed)) {
        audio.playSuccess();
        confetti({ 
            particleCount: 100, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#6366F1']
        });
      }
      return { ...prev, quests: newQuests };
    });
  };

  const handleLearned = useCallback((id: string) => {
    audio.playSuccess();
    setGroups(prev => prev.map(g => g.id === id ? { ...g, learned: true, nextReview: Date.now() + 86400000 } : g));
    updateQuest('q1');
    setStats(prev => ({ 
        ...prev, 
        xp: prev.xp + 150, 
        starCoins: prev.starCoins + 10,
        level: Math.floor((prev.xp + 150) / 1000) + 1 
    }));
  }, []);

  const handleChallenge = (id: string) => {
    setChallengeGroupId(id);
    setView('ARCADE');
  };

  const handleAddWord = (word: Word) => {
    const newWordItem = { text: word.term, translation: word.translation, imageUrl: word.imageUrl };
    setGroups(prev => [{ id: `user-${Date.now()}`, title: '自定义魔法', words: [newWordItem], learned: false, suffix: '', rhyme: '我亲手创造的魔法！', srsLevel: 0, nextReview: 0 }, ...prev]);
    setView('CARDS');
  };

  const reviewNeeded = useMemo(() => groups.filter(g => g.learned && g.nextReview < Date.now()), [groups]);

  const activeGroups = useMemo(() => {
    if (lastLearnedWords.length > 0) {
      return [{
        id: 'last-learned',
        title: '刚刚学过的魔法',
        suffix: '',
        words: lastLearnedWords,
        rhyme: '',
        learned: true,
        srsLevel: 0,
        nextReview: 0
      }];
    }
    if (challengeGroupId) return groups.filter(g => g.id === challengeGroupId);
    if (selectedDayId) return groups.filter(g => g.id === selectedDayId);
    return groups;
  }, [groups, challengeGroupId, selectedDayId, lastLearnedWords]);

  return (
    <div className="min-h-screen pt-10 pb-32 px-5 flex flex-col items-center max-w-lg mx-auto overflow-x-hidden relative bg-gradient-to-b from-indigo-50/50 to-white">
      <main className="w-full">
        {view === 'HOME' && (
          <HomePage 
            stats={stats} 
            groups={groups} 
            reviewNeeded={reviewNeeded} 
            onNavigate={setView} 
            onQuestClick={(v, r) => { setIsReviewChallenge(!!r); setView(v); }} 
          />
        )}

        {view === 'ADVENTURE' && (
          <AdventurePage 
            onClose={() => setView('HOME')} 
            onCompleteLevel={(words) => {
              setLastLearnedWords(words);
              setView('ARCADE');
            }}
          />
        )}

        {view === 'CARDS' && (
          <div className="space-y-6 animate-in slide-in-from-right-20 duration-500">
            <div className="text-center mb-4">
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">今日任务词库</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Magic Words</p>
            </div>
            {activeGroups.map(g => (
              <WordLandCard 
                key={g.id} 
                card={g} 
                onLearned={() => handleLearned(g.id)} 
                onNext={() => {}} 
                isLast={true} 
                onChallenge={() => handleChallenge(g.id)} 
              />
            ))}
          </div>
        )}

        {view === 'ARCADE' && (
          <ArcadePage 
            groups={groups} 
            lastLearnedWords={lastLearnedWords}
            onSelectGame={(id, words) => {
              if (words) setLastLearnedWords(words);
              setView(id);
            }} 
            onClose={() => { setView('HOME'); setChallengeGroupId(null); setLastLearnedWords([]); }} 
          />
        )}

        {view === 'COLLECTION' && <CollectionCenter groups={groups} stats={stats} onClose={() => setView('HOME')} />}
        {view === 'CHALLENGE' && <WordChallenge groups={activeGroups} isReviewMode={isReviewChallenge} onFinish={(s, c) => { setView('ARCADE'); updateQuest('q2'); }} onMistake={() => {}} onSuccess={() => {}} onClose={() => setView('ARCADE')} />}
        {view === 'SCRAMBLE' && <LetterScramble groups={activeGroups} onFinish={(s, c) => { setView('ARCADE'); updateQuest('q2'); }} onClose={() => setView('ARCADE')} />}
        {view === 'MEMORY' && <MemoryMatch groups={activeGroups} onFinish={() => setView('ARCADE')} onClose={() => setView('ARCADE')} />}
        {view === 'SHEEP' && <SheepMatch groups={activeGroups} onFinish={() => setView('ARCADE')} onClose={() => setView('ARCADE')} />}
        {view === 'BALLOON' && <BalloonPop groups={activeGroups} onFinish={() => setView('ARCADE')} onMistake={() => {}} onSuccess={() => {}} onClose={() => setView('ARCADE')} />}
        {view === 'WHACK' && <WhackAMole groups={activeGroups} onFinish={() => setView('ARCADE')} onMistake={() => {}} onSuccess={() => {}} onClose={() => setView('ARCADE')} />}
        {view === 'DUBBING' && <VoiceDubbing groups={activeGroups} onFinish={() => setView('ARCADE')} onClose={() => setView('ARCADE')} />}
        {view === 'RANKING' && <Leaderboard stats={stats} />}
        {view === 'UPLOAD' && <UploadContent onAddWord={handleAddWord} onAddVideo={() => {}} />}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] glass-pill h-20 rounded-[32px] flex items-center justify-around px-8 z-50 border-white/80 shadow-2xl">
        <NavButton icon={<Home />} label="主页" active={view === 'HOME'} onClick={() => setView('HOME')} color="text-indigo-600" />
        <NavButton icon={<BookOpen />} label="冒险" active={view === 'ADVENTURE'} onClick={() => setView('ADVENTURE')} color="text-rose-500" />
        <NavButton icon={<Award />} label="图鉴" active={view === 'COLLECTION'} onClick={() => setView('COLLECTION')} color="text-amber-500" />
        <NavButton icon={<Gamepad2 />} label="游玩" active={view === 'ARCADE' || ['CHALLENGE', 'SCRAMBLE', 'MEMORY', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING'].includes(view)} onClick={() => setView('ARCADE')} color="text-sky-500" />
        <NavButton icon={<BarChart3 />} label="排行" active={view === 'RANKING'} onClick={() => setView('RANKING')} color="text-amber-500" />
      </nav>
    </div>
  );
};

export default App;
