
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Gamepad2, Sparkles, Star, Trophy, CircleDollarSign, ArrowRight, Search, X } from 'lucide-react';
import { UserStats, WordGroup, ViewState } from '../types';
import DailyQuestBoard from '../components/DailyQuestBoard';

interface HomePageProps {
  stats: UserStats;
  groups: WordGroup[];
  reviewNeeded: WordGroup[];
  onNavigate: (view: ViewState) => void;
  onQuestClick: (view: ViewState, isReview?: boolean, levelId?: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ stats, groups, reviewNeeded, onNavigate, onQuestClick }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<WordGroup[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = groups.filter(group => 
      group.words.some(word => word.text.toLowerCase().includes(query)) ||
      group.title.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 pb-16 relative">
      {/* Dynamic Nature Background - Ultra Rich Green */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-br from-[#10513e] via-[#064e3b] to-[#065f46]">
        {/* Animated Sun Rays with Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(52,211,153,0.2)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(16,185,129,0.15)_0%,_transparent_40%)]" />

        {/* Floating Nature Objects (Leaves, Flowers, Petals) */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: -100, 
              rotate: 0,
              opacity: 0 
            }}
            animate={{ 
              y: ['0vh', '110vh'],
              x: [(Math.random() * 120 - 10) + '%', (Math.random() * 120 - 10) + '%'],
              rotate: [0, 1080],
              opacity: [0, 0.5, 0.5, 0],
              scale: [0.7, 1.3, 0.7]
            }}
            transition={{ 
              duration: 12 + Math.random() * 18, 
              repeat: Infinity, 
              delay: Math.random() * 15,
              ease: "linear"
            }}
            className="absolute text-5xl filter blur-[0.3px] select-none pointer-events-none"
          >
            {['🍃', '🌿', '🌸', '🍀', '✨', '🌼'][i % 6]}
          </motion.div>
        ))}
        
        {/* Deep Forest Layers with Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-96 opacity-10 flex justify-around items-end overflow-hidden">
           <div className="text-[20rem] -mb-28 -ml-32 transform -rotate-6">🌳</div>
           <div className="text-[14rem] -mb-16 text-emerald-900/30">🌲</div>
           <div className="text-[22rem] -mb-32 text-emerald-900/50 transform rotate-3">🌳</div>
           <div className="text-[15rem] -mb-12 -mr-32 text-emerald-900/30 transform -rotate-12">🌲</div>
        </div>

        {/* Ground Flora Details */}
        <div className="absolute bottom-10 left-10 text-7xl opacity-20 transform -rotate-12">🍄</div>
        <div className="absolute bottom-24 right-16 text-6xl opacity-15">🌸</div>
        <div className="absolute bottom-32 left-1/3 text-4xl opacity-10">🌿</div>
      </div>

        {/* Magical Ecosystem Accents */}
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-32 left-16 text-6xl opacity-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        >
          🍄
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            rotate: [0, 20, 0]
          }} 
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-20 text-5xl opacity-20"
        >
          🦋
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/3 left-10 text-4xl"
        >
          ✨
        </motion.div>

      {/* Hero Stats Section - Glassmorphism Refined */}
      <div className="bg-white rounded-[40px] p-6 shadow-[0_32px_64px_-16px_rgba(6,78,59,0.15)] border-2 border-emerald-100 flex justify-between items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        
        <div className="flex items-center space-x-6 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-400 rounded-[24px] blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white w-16 h-16 rounded-[24px] flex flex-col items-center justify-center font-black shadow-xl border-2 border-white/50 relative overflow-hidden">
              <span className="text-[10px] font-bold opacity-70 leading-none mb-1">LV</span>
              <span className="text-3xl leading-none">{stats.level}</span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </motion.div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between min-w-[120px]">
               <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em]">Magical Core</span>
               <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">{Math.floor((stats.xp % 1000) / 10)}%</span>
            </div>
            <div className="w-40 h-3 bg-emerald-100/50 rounded-full overflow-hidden border border-emerald-200/50 shadow-inner p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.xp % 1000) / 10}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center bg-white px-4 py-3 rounded-[24px] border-2 border-slate-100 shadow-sm"
          >
            <CircleDollarSign size={20} className="text-amber-500 mr-2 fill-amber-200" />
            <span className="font-black text-slate-700 text-base tabular-nums tracking-tight">{stats.starCoins}</span>
          </motion.div>
        </div>
      </div>

      {/* Main Branding */}
      <div className="text-center py-6 relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 bg-gradient-to-r from-emerald-200/40 via-lime-200/40 to-emerald-200/40 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-36 h-36 bg-white rounded-[48px] shadow-2xl shadow-emerald-900/10 flex items-center justify-center text-8xl relative z-10 border-4 border-emerald-50"
            >
              <div className="absolute -top-6 -left-6 text-5xl drop-shadow-lg">🌳</div>
              🐯
              <div className="absolute -top-6 -right-6 text-5xl drop-shadow-lg animate-pulse">✨</div>
            </motion.div>
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl font-black tracking-tighter text-emerald-950 pb-1">
              单词奇旅
            </h1>
            <div className="inline-flex px-6 py-2 bg-emerald-900 text-white rounded-full border border-emerald-800 shadow-lg magic-shadow">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Adventure Forest v2.0</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Word Search Section */}
      <div className="px-1">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-emerald-500 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="搜索单词，寻找它的三字经魔法..."
            className="w-full bg-white/80 backdrop-blur-md py-5 pl-14 pr-12 rounded-[28px] border-2 border-emerald-100/50 shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all text-emerald-900 font-bold placeholder:text-emerald-300"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-4 flex items-center px-2 text-emerald-300 hover:text-emerald-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-4 bg-white/90 backdrop-blur-xl rounded-[32px] border-2 border-emerald-100 shadow-2xl p-6 space-y-4 overflow-hidden"
            >
              <h4 className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] mb-2 px-2">发现魔法口诀</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1">
                        {group.words.map(w => (
                          <span key={w.text} className={`px-2 py-0.5 rounded-full text-[10px] font-black ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
                            {w.text}
                          </span>
                        ))}
                      </div>
                      <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">{group.title}</span>
                    </div>
                    <p className="text-emerald-900 font-bold text-sm leading-relaxed translate-y-1">
                      {group.rhyme.split(',').map((part, i) => (
                        <span key={i} className="block">{part.trim()}</span>
                      ))}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-2 gap-6 px-1">
        <motion.button 
          whileHover={{ scale: 1.02, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ADVENTURE')} 
          className="puffy-card p-7 text-left relative overflow-hidden group h-64 flex flex-col justify-between border-emerald-100"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <div className="bg-emerald-500 w-16 h-16 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            {reviewNeeded.length > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full shadow-lg border-2 border-white z-20"
              >
                {reviewNeeded.length}
              </motion.div>
            )}
          </div>

          <div>
            <h3 className="font-black text-2xl text-emerald-950 tracking-tight leading-tight">冒险森林</h3>
            <p className="text-[11px] font-black text-emerald-500/70 uppercase tracking-widest mt-2 flex items-center">
              EXPLORE WORLD <ArrowRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </p>
          </div>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ARCADE')} 
          className="puffy-card p-7 text-left relative overflow-hidden group h-64 flex flex-col justify-between border-amber-100"
        >
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="bg-amber-500 w-16 h-16 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-white w-8 h-8" />
          </div>

          <div>
            <h3 className="font-black text-2xl text-amber-950 tracking-tight leading-tight">魔法乐园</h3>
            <p className="text-[11px] font-black text-amber-600/70 uppercase tracking-widest mt-2 flex items-center">
              PLAY GAMES <ArrowRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </p>
          </div>
        </motion.button>
      </div>

      <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />
      
      {/* Achievement Progress Bar Footprint */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-emerald-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group border-2 border-emerald-800"
      >
        <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12 scale-150">🌲</div>
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center space-x-3">
            <Trophy className="text-amber-400" size={24} />
            <h4 className="font-black text-emerald-50 text-base">魔法成就</h4>
          </div>
          <span className="text-xs font-black text-emerald-400">已掌握 {(stats.masteredWords || []).length} 个单词</span>
        </div>
        <div className="w-full h-3 bg-emerald-800 rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: stats.masteredWords?.length ? Math.min(100, (stats.masteredWords.length / 50) * 100) + '%' : '0%' }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400" 
          />
        </div>
      </motion.div>

      {/* Nature Footer Accent */}
      <div className="flex justify-center items-center space-x-8 opacity-20 pointer-events-none pb-4">
        <div className="text-4xl">🌲</div>
        <div className="text-2xl">🍄</div>
        <div className="text-4xl">🌳</div>
        <div className="text-2xl">🍄</div>
        <div className="text-4xl">🌲</div>
      </div>
    </div>
  );
};

export default HomePage;
