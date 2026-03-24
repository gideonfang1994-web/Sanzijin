
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { X, Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface Tile {
  id: string;
  wordId: string;
  type: 'text' | 'translation' | 'image';
  content: string;
  isImage: boolean;
  zIndex: number;
  x: number;
  y: number;
  isBlocked: boolean;
}

interface Props {
  groups: WordGroup[];
  onFinish: (score: number) => void;
  onClose: () => void;
}

const SheepMatch: React.FC<Props> = ({ groups, onFinish, onClose }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<Tile[]>([]);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [level, setLevel] = useState(1);

  const SLOT_CAPACITY = 7;

  const [syncedImages, setSyncedImages] = useState<Record<string, string>>({});

  // Initialize game
  useEffect(() => {
    const saved = localStorage.getItem('adventure_synced_images');
    if (saved) {
      setSyncedImages(JSON.parse(saved));
    }
    initGame();
  }, [groups, level]);

  const initGame = () => {
    const learnedWords: { word: WordItem, groupId: string }[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        learnedWords.push({ word: w, groupId: g.id });
      });
    });

    // Pick words for the level - more words for higher levels
    const wordCount = Math.min(learnedWords.length, 3 + level * 2);
    const selected = [...learnedWords].sort(() => Math.random() - 0.5).slice(0, wordCount);
    
    const newTiles: Tile[] = [];
    selected.forEach((item) => {
      // Create 3 tiles for each word: Text, Translation, Image
      const types: ('text' | 'translation' | 'image')[] = ['text', 'translation', 'image'];
      types.forEach(type => {
        newTiles.push({
          id: `${item.word.text}-${type}-${Math.random()}`,
          wordId: item.word.text,
          type,
          content: type === 'text' ? item.word.text : (type === 'translation' ? item.word.translation : item.word.imageUrl || `https://placehold.co/200x200/indigo/white?text=${item.word.text}`),
          isImage: type === 'image',
          zIndex: 0,
          x: 0,
          y: 0,
          isBlocked: false
        });
      });
    });

    // Randomize positions and layers for "Sheep a Sheep" feel
    const shuffled = newTiles.sort(() => Math.random() - 0.5);
    const layeredTiles = shuffled.map((tile, i) => {
      // Create multiple layers
      const layer = Math.floor(i / 9);
      const posInLayer = i % 9;
      const row = Math.floor(posInLayer / 3);
      const col = posInLayer % 3;
      
      // Offset layers slightly for overlapping effect
      const offsetX = (layer % 2) * 20;
      const offsetY = (layer % 3) * 20;
      
      return {
        ...tile,
        zIndex: layer,
        x: col * 75 + offsetX + 20 + Math.random() * 10,
        y: row * 75 + offsetY + 20 + Math.random() * 10,
      };
    });

    setTiles(checkBlocking(layeredTiles));
    setSlots([]);
    setGameState('PLAYING');
  };

  const checkBlocking = (currentTiles: Tile[]) => {
    return currentTiles.map(tile => {
      // A tile is blocked if there's any tile in a higher layer that overlaps it
      const isBlocked = currentTiles.some(other => 
        other.zIndex > tile.zIndex && 
        Math.abs(other.x - tile.x) < 55 && 
        Math.abs(other.y - tile.y) < 55
      );
      return { ...tile, isBlocked };
    });
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.isBlocked || gameState !== 'PLAYING' || slots.length >= SLOT_CAPACITY) return;

    audio.playClick();
    audio.speak(tile.wordId);
    
    const newTiles = tiles.filter(t => t.id !== tile.id);
    const newSlots = [...slots, tile];
    
    // Check for 3-match (same wordId)
    const wordCounts: Record<string, number> = {};
    newSlots.forEach(s => {
      wordCounts[s.wordId] = (wordCounts[s.wordId] || 0) + 1;
    });

    const matchedWordId = Object.keys(wordCounts).find(id => wordCounts[id] === 3);
    
    if (matchedWordId) {
      // Delay to show the tile entering the slot before clearing
      setSlots(newSlots);
      setTimeout(() => {
        audio.playSuccess();
        const filteredSlots = newSlots.filter(s => s.wordId !== matchedWordId);
        setSlots(filteredSlots);
        
        if (newTiles.length === 0 && filteredSlots.length === 0) {
          setGameState('WON');
          audio.playCheer();
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }, 400);
    } else {
      setSlots(newSlots);
      if (newSlots.length >= SLOT_CAPACITY) {
        setGameState('LOST');
      }
    }

    setTiles(checkBlocking(newTiles));
  };

  return (
    <div className="fixed inset-0 bg-indigo-50 z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-indigo-600">羊羊消消乐</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {level} • Match 3 Magic Tiles</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <X size={24} />
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative p-4 overflow-hidden flex items-center justify-center">
        <div className="relative w-full max-w-sm h-[400px]">
          {tiles.map(tile => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={tile.isBlocked}
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                zIndex: tile.zIndex,
              }}
              className={`absolute w-16 h-16 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center p-1
                ${tile.isBlocked ? 'bg-slate-200 border-slate-300 grayscale opacity-80' : 'bg-white border-indigo-100 shadow-md active:scale-90'}
              `}
            >
              {tile.isImage ? (
                <img 
                  src={syncedImages[tile.wordId] || tile.content} 
                  alt="tile" 
                  className="w-full h-full object-contain rounded-lg" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('fluency')) {
                      target.src = `https://img.icons8.com/clouds/200/${tile.wordId.toLowerCase()}.png`;
                    } else if (target.src.includes('clouds')) {
                      target.src = `https://img.icons8.com/color/200/${tile.wordId.toLowerCase()}.png`;
                    } else if (target.src.includes('placehold.co')) {
                      target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${tile.wordId}`;
                    } else {
                      target.src = `https://placehold.co/200x200/indigo/white?text=${tile.wordId}`;
                    }
                  }}
                />
              ) : (
                <span className={`font-bold text-center leading-tight ${tile.type === 'text' ? 'text-indigo-600 text-sm' : 'text-slate-600 text-[10px]'}`}>
                  {tile.content}
                </span>
              )}
              {/* Layer shadow effect */}
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-slate-200 -z-10 rounded-2xl opacity-50"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Slots Area */}
      <div className="bg-white p-6 pb-12 shadow-2xl rounded-t-[40px] border-t-4 border-indigo-100">
        <div className="flex justify-center space-x-2 h-16 mb-4">
          {Array.from({ length: SLOT_CAPACITY }).map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
              {slots[i] && (
                <div className="w-full h-full bg-white flex items-center justify-center animate-in zoom-in duration-200">
                  {slots[i].isImage ? (
                    <img 
                      src={syncedImages[slots[i].wordId] || slots[i].content} 
                      alt="slot" 
                      className="w-full h-full object-contain p-1" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/200x200/indigo/white?text=${slots[i].wordId}`;
                      }}
                    />
                  ) : (
                    <span className="text-[8px] font-bold text-center px-1">{slots[i].content}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {gameState === 'LOST' && (
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-center text-rose-500 font-black">
              <AlertCircle className="mr-2" /> 槽位已满！
            </div>
            <button onClick={initGame} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center">
              <RefreshCw className="mr-2" size={20} /> 再试一次
            </button>
          </div>
        )}

        {gameState === 'WON' && (
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-center text-emerald-500 font-black text-xl">
              <Trophy className="mr-2" /> 魔法大胜利！
            </div>
            <button onClick={() => { setLevel(l => l + 1); }} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg">
              进入下一关
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SheepMatch;
