import React, { useState, useMemo } from 'react';
import { UserStats } from '../types';
import { 
  BookOpen, Sparkles, Volume2, Award, ArrowLeft, CheckCircle, 
  HelpCircle, Play, RotateCcw, Flame, Check, ShieldAlert, Star,
  Video, PlayCircle
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Props {
  stats: UserStats;
  onUpdateStats: (stats: Partial<UserStats>) => void;
  onReward?: (xp: number, coins: number) => void;
  onClose: () => void;
}

interface PhonicsItem {
  word: string;
  pinyin?: string;
  translation: string;
  mnemonicSentence?: string; // e.g. "我家 dad (爸爸)，脾气 bad (坏的)，让我 sad (伤心的)"
  highlight: string; // Phonics focus, e.g. "ad"
  emoji: string;
  letterDetails?: {
    letter: string;      // e.g. "Bb"
    sound: string;       // e.g. "/b/"
    charMnemonic: string;// e.g. "大肚伯伯"
    handoutWords: { word: string; translation: string; emoji: string }[];
  };
}

interface PhonicsCourse {
  id: string;
  title: string;
  icon: string;
  mnemonic: string; // The core mnemonic / chant, e.g. "大肚子伯伯 /b//b//b/"
  sound: string; // The phonetic sound, e.g. "/b/"
  items: PhonicsItem[];
}

interface PhonicsModule {
  id: string;
  title: string;
  icon: string;
  courses: PhonicsCourse[];
}

const PHONICS_SYLLABUS: PhonicsModule[] = [
  {
    id: 'm1',
    title: '第一阶段：26字母与本源音律',
    icon: '🌱',
    courses: [
      {
        id: 'c1',
        title: '第1课：英文字母王国班会',
        icon: '🔤',
        mnemonic: '字母王国一共有 26 个字母，快快跟上魔法口号！',
        sound: '[A-Z]',
        items: [
          { word: 'apple', translation: '苹果', highlight: 'a', emoji: '🍎' },
          { word: 'boy', translation: '男孩', highlight: 'b', emoji: '👦' },
          { word: 'cat', translation: '猫咪', highlight: 'c', emoji: '🐱' },
          { word: 'dog', translation: '小狗', highlight: 'd', emoji: '🐶' },
        ]
      },
      {
        id: 'c2',
        title: '第2课：元音五星班干部 (A, E, I, O, U规律)',
        icon: '⭐',
        mnemonic: '班级骨干：纪律委员 Aa张大嘴 /æ/，大班长 Ee小嘴巴 /e/，体育委员 Ii爱叹气 /ɪ/，学习委员 Oo嘴巴圆 /ɒ/，劳动委员 Uu扎耳朵 /ʌ/。',
        sound: '/æ/ /e/ /ɪ/ /ɒ/ /ʌ/',
        items: [
          {
            word: 'apple',
            translation: '苹果',
            mnemonicSentence: '纪律委员 Aa张大嘴：张大嘴巴压嗓子 /æ//æ//æ/！',
            highlight: 'a',
            emoji: '🍎',
            letterDetails: {
              letter: 'Aa',
              sound: '/æ/',
              charMnemonic: '纪律委员张大嘴：不守纪律就喊 /æ/！',
              handoutWords: [
                { word: 'apple', translation: '苹果', emoji: '🍎' },
                { word: 'ant', translation: '蚂蚁', emoji: '🐜' },
                { word: 'cat', translation: '小猫', emoji: '🐱' },
                { word: 'bag', translation: '包袋', emoji: '🎒' }
              ]
            }
          },
          {
            word: 'egg',
            translation: '鸡蛋',
            mnemonicSentence: '大班长 Ee小嘴巴：稍微张嘴后拉嘴角 /e//e//e/！',
            highlight: 'e',
            emoji: '🥚',
            letterDetails: {
              letter: 'Ee',
              sound: '/e/',
              charMnemonic: '大班长小嘴巴：管纪律也温柔 /e/！',
              handoutWords: [
                { word: 'elephant', translation: '大象', emoji: '🐘' },
                { word: 'egg', translation: '鸡蛋', emoji: '🥚' },
                { word: 'elf', translation: '精灵', emoji: '🧚' },
                { word: 'bed', translation: '单人床', emoji: '🛏️' }
              ]
            }
          },
          {
            word: 'pig',
            translation: '小猪',
            mnemonicSentence: '体育委员 Ii爱叹气：微启贝齿短叹气 /ɪ//ɪ//ɪ/！',
            highlight: 'i',
            emoji: '🐷',
            letterDetails: {
              letter: 'Ii',
              sound: '/ɪ/',
              charMnemonic: '体育委员爱叹气：天天叹气太累了 /ɪ/！',
              handoutWords: [
                { word: 'in', translation: '在里面', emoji: '📥' },
                { word: 'itchy', translation: '发痒的', emoji: '🦗' },
                { word: 'pig', translation: '小猪', emoji: '🐷' },
                { word: 'big', translation: '巨大的', emoji: '🐘' }
              ]
            }
          },
          {
            word: 'octopus',
            translation: '章鱼',
            mnemonicSentence: '学习委员 Oo嘴巴圆：大惊小怪圆圆口 /ɒ//ɒ//ɒ/！',
            highlight: 'o',
            emoji: '🐙',
            letterDetails: {
              letter: 'Oo',
              sound: '/ɒ/',
              charMnemonic: '学习委员嘴巴圆：看见好书惊叹 /ɒ/！',
              handoutWords: [
                { word: 'on', translation: '在上面', emoji: '🔛' },
                { word: 'octopus', translation: '章鱼', emoji: '🐙' },
                { word: 'sock', translation: '袜子', emoji: '🧦' },
                { word: 'hot', translation: '炎热的', emoji: '🥵' }
              ]
            }
          },
          {
            word: 'cup',
            translation: '杯子',
            mnemonicSentence: '劳动委员 Uu扎耳朵：下巴一掉大喊疼 /ʌ//ʌ//ʌ/！',
            highlight: 'u',
            emoji: '🥛',
            letterDetails: {
              letter: 'Uu',
              sound: '/ʌ/',
              charMnemonic: '劳动委员扎到耳朵：大嘴下掉发出 /ʌ/！',
              handoutWords: [
                { word: 'up', translation: '向上', emoji: '⬆️' },
                { word: 'under', translation: '在之下的', emoji: '👇' },
                { word: 'jump', translation: '跳跃', emoji: '🦘' },
                { word: 'cup', translation: '杯子', emoji: '🥛' }
              ]
            }
          }
        ]
      },
      {
        id: 'c3',
        title: '第3课：大肚伯伯与咳嗽家族 (b, c, d, f, g规律)',
        icon: '🎈',
        mnemonic: '大肚子伯伯 /b/，张嘴咳嗽 /k/，大胖弟弟 /d/，扶着拐棍 /f/，哥哥欢笑 /g/！',
        sound: '/b/ /k/ /d/ /f/ /g/',
        items: [
          {
            word: 'boy',
            translation: '男孩',
            mnemonicSentence: '大肚子伯伯：闭唇憋气爆破 /b//b//b/ 喜欢看书。',
            highlight: 'b',
            emoji: '👦',
            letterDetails: {
              letter: 'Bb',
              sound: '/b/',
              charMnemonic: '大肚伯伯：挺大肚子，闭嘴呼气 /b/！',
              handoutWords: [
                { word: 'boy', translation: '男孩', emoji: '👦' },
                { word: 'bed', translation: '单人床', emoji: '🛏️' },
                { word: 'black', translation: '黑色', emoji: '⬛' },
                { word: 'crab', translation: '螃蟹', emoji: '🦀' }
              ]
            }
          },
          {
            word: 'car',
            translation: '小汽车',
            mnemonicSentence: '张嘴咳嗽：清脆咳嗽喉咙响 /k//k//k/ 驾驶汽车。',
            highlight: 'c',
            emoji: '🚗',
            letterDetails: {
              letter: 'Cc',
              sound: '/k/',
              charMnemonic: '张大嘴咳两声：清脆爆破发 /k/！',
              handoutWords: [
                { word: 'car', translation: '小汽车', emoji: '🚗' },
                { word: 'cat', translation: '猫咪', emoji: '🐱' },
                { word: 'crab', translation: '螃蟹', emoji: '🦀' },
                { word: 'black', translation: '黑色', emoji: '⬛' }
              ]
            }
          },
          {
            word: 'dog',
            translation: '小狗',
            mnemonicSentence: '大胖弟弟：胖乎乎弟弟拍球 /d//d//d/ 最喜欢跳！',
            highlight: 'd',
            emoji: '🐕',
            letterDetails: {
              letter: 'Dd',
              sound: '/d/',
              charMnemonic: '大胖弟弟爱拍球：舌尖抵上齿龈拨水 /d/！',
              handoutWords: [
                { word: 'down', translation: '向下', emoji: '⬇️' },
                { word: 'dog', translation: '小狗', emoji: '🐶' },
                { word: 'duck', translation: '小鸭子', emoji: '🦆' },
                { word: 'bed', translation: '单人床', emoji: '🛏️' }
              ]
            }
          },
          {
            word: 'fox',
            translation: '狐狸',
            mnemonicSentence: '拐棍老人：颤颤巍巍上牙咬下唇吹风 /f//f//f/ 的智者。',
            highlight: 'f',
            emoji: '🦊',
            letterDetails: {
              letter: 'Ff',
              sound: '/f/',
              charMnemonic: '扶着拐棍：上门牙咬住下唇吹起小风 /f/！',
              handoutWords: [
                { word: 'five', translation: '数字五', emoji: '5️⃣' },
                { word: 'fast', translation: '快速的', emoji: '⚡' },
                { word: 'fox', translation: '狐狸', emoji: '🦊' },
                { word: 'elf', translation: '小精灵', emoji: '🧚' }
              ]
            }
          },
          {
            word: 'girl',
            translation: '女孩',
            mnemonicSentence: '哥哥爱笑：嗓底咯咯大笑 /g//g//g/ 女孩爱跳。',
            highlight: 'g',
            emoji: '👧',
            letterDetails: {
              letter: 'Gg',
              sound: '/g/',
              charMnemonic: '快乐哥哥咯咯笑：声带振动爆破 /g/！',
              handoutWords: [
                { word: 'girl', translation: '女孩', emoji: '👧' },
                { word: 'glass', translation: '玻璃杯', emoji: '🥛' },
                { word: 'leg', translation: '大腿', emoji: '🦵' },
                { word: 'egg', translation: '鸡蛋', emoji: '🥚' }
              ]
            }
          }
        ]
      },
      {
        id: 'c4',
        title: '第4课：爬完梯子喝口水 (h, j, k, l规律)',
        icon: '🪜',
        mnemonic: '爬完梯子要“喝”水 /h/，橘色雨伞 /dʒ/，咳嗽病人 /k/，快乐孩子 /l/！',
        sound: '/h/ /dʒ/ /k/ /l/',
        items: [
          {
            word: 'hot',
            translation: '热的',
            mnemonicSentence: '爬完梯子哈口气：喉咙呼气 /h//h//h/ 实在太热！',
            highlight: 'h',
            emoji: '🥵',
            letterDetails: {
              letter: 'Hh',
              sound: '/h/',
              charMnemonic: '爬山哈气：张口哈出热气流 /h/！',
              handoutWords: [
                { word: 'hug', translation: '拥抱', emoji: '🤗' },
                { word: 'hot', translation: '热的', emoji: '🥵' },
                { word: 'hit', translation: '击打', emoji: '🎯' },
                { word: 'house', translation: '房子', emoji: '🏠' }
              ]
            }
          },
          {
            word: 'jam',
            translation: '果酱',
            mnemonicSentence: '橘色雨伞撑伞跳：雨伞弹跳 /dʒ//dʒ//dʒ/ 盛满甜果汁！',
            highlight: 'j',
            emoji: '🍓',
            letterDetails: {
              letter: 'Jj',
              sound: '/dʒ/',
              charMnemonic: '橘色雨伞蹦蹦跳：圆唇发重音 /dʒ/！',
              handoutWords: [
                { word: 'jump', translation: '跳跃', emoji: '🦘' },
                { word: 'jacket', translation: '厚外套', emoji: '🧥' },
                { word: 'jet', translation: '飞机', emoji: '✈️' },
                { word: 'jam', translation: '美味果酱', emoji: '🍓' }
              ]
            }
          },
          {
            word: 'kick',
            translation: '踢球',
            mnemonicSentence: '咳嗽老病人：压住嗓子大声咳 /k//k//k/ 飞脚进球！',
            highlight: 'k',
            emoji: '⚽',
            letterDetails: {
              letter: 'Kk',
              sound: '/k/',
              charMnemonic: '咳嗽的人：蓄力爆破吐气发出 /k/！',
              handoutWords: [
                { word: 'kiss', translation: '亲吻', emoji: '💋' },
                { word: 'kick', translation: '踢球', emoji: '⚽' },
                { word: 'stinky', translation: '臭气熏天', emoji: '🦨' },
                { word: 'sock', translation: '袜子', emoji: '🧦' }
              ]
            }
          },
          {
            word: 'leg',
            translation: '腿',
            mnemonicSentence: '乐哈哈的小孩：高声乐呵 /l//l//l/ 跑步真有力。',
            highlight: 'l',
            emoji: '🦵',
            letterDetails: {
              letter: 'Ll',
              sound: '/l/',
              charMnemonic: '乐呵呵的孩子：舌尖抵住上牙床乐 /l/！',
              handoutWords: [
                { word: 'loud', translation: '大声的', emoji: '📢' },
                { word: 'leg', translation: '大腿', emoji: '🦵' },
                { word: 'glass', translation: '玻璃杯', emoji: '🥛' },
                { word: 'smell', translation: '闻气味', emoji: '👃' }
              ]
            }
          }
        ]
      },
      {
        id: 'c5',
        title: '第5课：沉默大山与慈祥婆婆 (m, n, p, q规律)',
        icon: '⛰️',
        mnemonic: '沉默大山嘴抿紧 /m/，慢慢开门鼻出声 /n/，慈祥婆婆吹灭灯 /p/，扩胸运动学鸭鸣 qu /kw/。',
        sound: '/m/ /n/ /p/ /kw/',
        items: [
          {
            word: 'moon',
            translation: '月亮',
            mnemonicSentence: '大山默不作声：闭嘴哼鼻子 /m//m//m/ 大山不言语。',
            highlight: 'm',
            emoji: '🌙',
            letterDetails: {
              letter: 'Mm',
              sound: '/m/',
              charMnemonic: '沉默大山：抿唇用鼻子发闷声 /m/！',
              handoutWords: [
                { word: 'moon', translation: '月亮', emoji: '🌙' },
                { word: 'man', translation: '男人', emoji: '🧔' },
                { word: 'jump', translation: '跳跃', emoji: '🦘' },
                { word: 'jam', translation: '果酱', emoji: '🍓' }
              ]
            }
          },
          {
            word: 'sun',
            translation: '太阳',
            mnemonicSentence: '门铃慢慢叫主人：微张门缝哼鼻子 /n//n//n/ 开门了。',
            highlight: 'n',
            emoji: '☀️',
            letterDetails: {
              letter: 'Nn',
              sound: '/n/',
              charMnemonic: '慢慢开门：微张开嘴，舌抵上门牙顶发 /n/！',
              handoutWords: [
                { word: 'no', translation: '不、不要', emoji: '❌' },
                { word: 'neck', translation: '脖子、红领巾', emoji: '🧣' },
                { word: 'men', translation: '男人们', emoji: '👥' },
                { word: 'sun', translation: '金黄太阳', emoji: '☀️' }
              ]
            }
          },
          {
            word: 'pig',
            translation: '小猪',
            mnemonicSentence: '慈祥婆婆吹灭灯：嘴唇紧闭大吹风 /p//p//p/ 安全吹灭。',
            highlight: 'p',
            emoji: '🐷',
            letterDetails: {
              letter: 'Pp',
              sound: '/p/',
              charMnemonic: '慈祥婆婆吹柴火：双唇闭住，急爆气发 /p/！',
              handoutWords: [
                { word: 'panda', translation: '熊猫', emoji: '🐼' },
                { word: 'pig', translation: '小猪', emoji: '🐷' },
                { word: 'apple', translation: '大苹果', emoji: '🍎' },
                { word: 'up', translation: '高高在上', emoji: '⬆️' }
              ]
            }
          },
          {
            word: 'quiet',
            translation: '安静的',
            mnemonicSentence: '扩胸多扩胸：小红鸭 quack 叫 /kw//kw//kw/ 真神奇。',
            highlight: 'qu',
            emoji: '🤫',
            letterDetails: {
              letter: 'Qq',
              sound: '/kw/',
              charMnemonic: '扩胸运动：两发音融合发 /kw/！',
              handoutWords: [
                { word: 'quiet', translation: '安静的', emoji: '🤫' },
                { word: 'quilt', translation: '保暖棉被', emoji: '🛌' },
                { word: 'quack', translation: '大鸭子叫', emoji: '🦆' },
                { word: 'squid', translation: '大海鲜鱿鱼', emoji: '🦑' }
              ]
            }
          }
        ]
      },
      {
        id: 'c6',
        title: '第6课：柔弱小苗与咬人小蛇 (r, s, t, v规律)',
        icon: '🌿',
        mnemonic: '柔弱小苗往上顶 /r/，昂首小蛇发警告 /s/，生龙活虎踢踢腿 /t/，富豪项链闪闪亮 /v/。',
        sound: '/r/ /s/ /t/ /v/',
        items: [
          {
            word: 'run',
            translation: '跑步',
            mnemonicSentence: '柔弱的小苗：舌头反勾顶土壤 /r//r//r/ 发出弱音。',
            highlight: 'r',
            emoji: '🏃',
            letterDetails: {
              letter: 'Rr',
              sound: '/r/',
              charMnemonic: '柔弱小苗：小舌卷起，阻挡气体发出弱音 /r/！',
              handoutWords: [
                { word: 'run', translation: '快乐奔跑', emoji: '🏃' },
                { word: 'red', translation: '红润苹果色', emoji: '🔴' },
                { word: 'truck', translation: '威武卡车', emoji: '🚚' },
                { word: 'crab', translation: '大钳子螃蟹', emoji: '🦀' }
              ]
            }
          },
          {
            word: 'sun',
            translation: '太阳',
            mnemonicSentence: '小青蛇盘在草地上：闭齿吹风嘶嘶叫 /s//s//s/ 快绕开。',
            highlight: 's',
            emoji: '☀️',
            letterDetails: {
              letter: 'Ss',
              sound: '/s/',
              charMnemonic: '盘地小蛇：闭拢门牙，吐纳清气发出小蛇声 /s/！',
              handoutWords: [
                { word: 'sun', translation: '天空中太阳', emoji: '☀️' },
                { word: 'slow', translation: '慢腾腾蜗牛', emoji: '🐌' },
                { word: 'fast', translation: '飞速闪电', emoji: '⚡' },
                { word: 'kiss', translation: '爱心亲吻', emoji: '💋' }
              ]
            }
          },
          {
            word: 'ten',
            translation: '数字十',
            mnemonicSentence: '快乐踢腿：生龙活虎踢起球 /t//t//t/ 精准进账。',
            highlight: 't',
            emoji: '🔟',
            letterDetails: {
              letter: 'Tt',
              sound: '/t/',
              charMnemonic: '快乐踢腿：舌尖抵上去突发清爆破 /t/！',
              handoutWords: [
                { word: 'ten', translation: '数字十', emoji: '🔟' },
                { word: 'truck', translation: '霸气重卡', emoji: '🚚' },
                { word: 'hot', translation: '热烘烘', emoji: '🥵' },
                { word: 'ant', translation: '小蚂蚁爬', emoji: '🐜' }
              ]
            }
          },
          {
            word: 'van',
            translation: '面包车',
            mnemonicSentence: '富豪大老爷：上门牙咬住下唇大鸣笛 /v//v//v/ 开豪车。',
            highlight: 'v',
            emoji: '🚐',
            letterDetails: {
              letter: 'Vv',
              sound: '/v/',
              charMnemonic: '富人项链：露出门牙咬下唇发颤闷声 /v/！',
              handoutWords: [
                { word: 'van', translation: '面包车', emoji: '🚐' },
                { word: 'vet', translation: '爱心兽医', emoji: '🥼' },
                { word: 'vest', translation: '保暖马甲', emoji: '🎽' },
                { word: 'five', translation: '数字五朵云', emoji: '5️⃣' }
              ]
            }
          }
        ]
      },
      {
        id: 'c7',
        title: '第7课：两人握手与闪电劈木 (w, x, y, z规律)',
        icon: '🤝',
        mnemonic: '好朋友两手握圆口 /w/，大板斧猛力劈柴火 /ks/，高大树枝开口叫桠 /j/，雷雨惊现电光闪 /z/。',
        sound: '/w/ /ks/ /j/ /z/',
        items: [
          {
            word: 'wind',
            translation: '风儿',
            mnemonicSentence: '紧握双手真要好：嘴巴嘟嘟圆发声 /w//w//w/。',
            highlight: 'w',
            emoji: '💨',
            letterDetails: {
              letter: 'Ww',
              sound: '/w/',
              charMnemonic: '两人握手：噘起圆滚滚小嘴哈出气 /w/！',
              handoutWords: [
                { word: 'watermelon', translation: '甜西瓜', emoji: '🍉' },
                { word: 'wind', translation: '大风吹', emoji: '💨' },
                { word: 'web', translation: '蜘蛛织网', emoji: '🕸' },
                { word: 'swim', translation: '大河游泳', emoji: '🏊' }
              ]
            }
          },
          {
            word: 'fox',
            translation: '狐狸',
            mnemonicSentence: '板斧大力向下砍：猛力砸声快速憋气 /ks//ks//ks/ 劈树杈。',
            highlight: 'x',
            emoji: '🦊',
            letterDetails: {
              letter: 'Xx',
              sound: '/ks/',
              charMnemonic: '劈开木头：吐气如大斧快速掠过发送气音 /ks/！',
              handoutWords: [
                { word: 'six', translation: '数字六', emoji: '6️⃣' },
                { word: 'exit', translation: '安全出口', emoji: '🚪' },
                { word: 't-rex', translation: '威猛霸王龙', emoji: '🦖' },
                { word: 'fox', translation: '狐狸', emoji: '🦊' }
              ]
            }
          },
          {
            word: 'yes',
            translation: '是的',
            mnemonicSentence: '高高树桠开口笑：咧开嘴唇发重气 /j//j//j/ 大叫好。',
            highlight: 'y',
            emoji: '👍',
            letterDetails: {
              letter: 'Yy',
              sound: '/j/',
              charMnemonic: '微笑大桠杈：咧嘴微微后拉喉发出 /j/！',
              handoutWords: [
                { word: 'yes', translation: '是的，太棒了', emoji: '👍' },
                { word: 'yogurt', translation: '草莓酸牛奶', emoji: '🥛' },
                { word: 'yell', translation: '山顶大喊', emoji: '🗣️' },
                { word: 'yen', translation: '金色日元', emoji: '💴' }
              ]
            }
          },
          {
            word: 'zip',
            translation: '拉链',
            mnemonicSentence: '雷雨乌云大闪电：电流滋啪啪颤抖 /z//z//z/ 雷声滚。',
            highlight: 'z',
            emoji: '🤐',
            letterDetails: {
              letter: 'Zz',
              sound: '/z/',
              charMnemonic: '一道闪电：闭紧钢牙剧烈颤抖摩擦出 /z/！',
              handoutWords: [
                { word: 'zero', translation: '数字零', emoji: '0️⃣' },
                { word: 'zip', translation: '衣服拉链', emoji: '🤐' },
                { word: 'zigzag', translation: '之字曲折线', emoji: '〰️' },
                { word: 'buzz', translation: '小蜜蜂嗡嗡', emoji: '🐝' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: '第二阶段：魔法短元音闭音节',
    icon: '🏰',
    courses: [
      {
        id: 'c8',
        title: '第8课：闭音节 Aa 闭门大狂欢 (at, ad, ag, an, ap)',
        icon: '🍎',
        mnemonic: '闭门闭音节，大名字母叫不响，全声大喊 /æ/！',
        sound: '/æ/',
        items: [
          { word: 'dad', translation: '爸爸', mnemonicSentence: '我家 dad (爸爸)，脾气 bad (坏的)，让我 sad (伤心的)。', highlight: 'ad', emoji: '👨' },
          { word: 'cat', translation: '猫咪', mnemonicSentence: '有只 cat (猫)，专吃 rat (老鼠)，非常 fat (胖)。', highlight: 'at', emoji: '🐱' },
          { word: 'bag', translation: '包袋', mnemonicSentence: '借来 bag (包)，正要 brag (吹牛)，掉出 tag (标签)。', highlight: 'ag', emoji: '🎒' },
          { word: 'man', translation: '男人', mnemonicSentence: '有个 man (男人)，没看 pan (锅)，烧成 tan (焦色)。', highlight: 'an', emoji: '🧔' },
          { word: 'cap', translation: '帽子', mnemonicSentence: '戴上 cap (帽子)，用手 tap (轻按)，大声 rap (说唱)。', highlight: 'ap', emoji: '🧢' },
        ]
      },
      {
        id: 'c9',
        title: '第9课：闭音节 Ee 魔法羽毛笔 (ed, eg, en, et)',
        icon: '🥚',
        mnemonic: '大班长 Ee 来临：稍微张嘴，嘴角往两侧微微拉开 /e/ /e/ /e/ ！',
        sound: '/e/',
        items: [
          { word: 'bed', translation: '床', mnemonicSentence: '拉来 sled (雪橇)，染成 red (红色)，放上 bed (床)。', highlight: 'ed', emoji: '🛏️' },
          { word: 'leg', translation: '双腿', mnemonicSentence: '两只 leg (腿)，夹上 peg (夹子)，只想 beg (讨饶)。', highlight: 'eg', emoji: '🦵' },
          { word: 'pen', translation: '钢笔', mnemonicSentence: '一只 hen (母鸡)，买了 pen (钢笔)，花了 ten (十块)。', highlight: 'en', emoji: '🖋️' },
          { word: 'pet', translation: '宠物', mnemonicSentence: '养了 pet (宠物)，结出 net (网)，全身 wet (湿透)。', highlight: 'et', emoji: '🐶' },
        ]
      },
      {
        id: 'c10',
        title: '第10课：闭音节 Ii 叹气体育委 (ig, in, im, ip, it)',
        icon: '🧪',
        mnemonic: '叹气体育委 Ii ：嘴唇向两侧略拉，牙口半开，短促声 /ɪ/。',
        sound: '/ɪ/',
        items: [
          { word: 'pig', translation: '小猪', mnemonicSentence: '一只 pig (猪)，非常 big (大)，喜欢 dig (挖)。', highlight: 'ig', emoji: '🐷' },
          { word: 'win', translation: '获得胜利', mnemonicSentence: '顶着 bin (桶)，比赛 spin (旋转)，看谁 win (赢)。', highlight: 'in', emoji: '🏆' },
          { word: 'swim', translation: '游泳', mnemonicSentence: '跟着 him (他)，每天 swim (游泳)，身材 slim (苗条)。', highlight: 'im', emoji: '🏊' },
          { word: 'slip', translation: '滑倒', mnemonicSentence: '水滴 drip (滴落)，地上 slip (滑溜)，赶紧 skip (跳过)。', highlight: 'ip', emoji: '🍌' },
        ]
      },
      {
        id: 'c11',
        title: '第11课：闭音节 Oo/Uu 终极会师',
        icon: '🍩',
        mnemonic: '大惊小怪委员 Oo /ɒ/ 与劳动委员大口 Uu /ʌ/！',
        sound: '/ɒ/ & /ʌ/',
        items: [
          { word: 'dog', translation: '小狗', mnemonicSentence: '清晨 jog (慢跑)，带上 dog (小狗)，踩到 frog (青蛙)。(Oo)', highlight: 'og', emoji: '🐸' },
          { word: 'hop', translation: '单脚跳', mnemonicSentence: '轻轻 hop (跳)，跳上 top (顶端)，唱起 pop (流行歌)。(Oo)', highlight: 'op', emoji: '🦘' },
          { word: 'hug', translation: '拥抱', mnemonicSentence: '一只 bug (虫子)，想要 hug (拥抱)，拼命 dug (挖洞)。(Uu)', highlight: 'ug', emoji: '🤗' },
          { word: 'sun', translation: '太阳', mnemonicSentence: '晒着 sun (太阳)，不停 run (跑步)，感到 fun (快乐)。(Uu)', highlight: 'un', emoji: '☀️' },
        ]
      }
    ]
  },
  {
    id: 'm3',
    title: '第三阶段：双辅音与变音传奇',
    icon: '🔮',
    courses: [
      {
        id: 'c12',
        title: '第12课：咬舌吐丝双手辅音 (th, sh, ch, ph)',
        icon: '🐍',
        mnemonic: 'th 咬蛇音 /θ/ /ð/，sh 安静声，ch 咳嗽声，ph 象拐弯声 /f/！',
        sound: '/θ/ /ð/ /ʃ/ /tʃ/ /f/',
        items: [
          { word: 'math', translation: '数学', mnemonicSentence: 'th 咬紧舌：学完 math，穿过 path (小路)，洗个 bath。', highlight: 'th', emoji: '🧮' },
          { word: 'mother', translation: '妈妈', mnemonicSentence: 'th 在中间轻咬蛇：我的 mother，寻找 brother 还有 another。', highlight: 'th', emoji: '👩' },
          { word: 'fish', translation: '小鱼', mnemonicSentence: 'sh 安静音 /ʃ/：心中 wish，钓到 fish，做成 dish。', highlight: 'sh', emoji: '🐟' },
          { word: 'lunch', translation: '午餐', mnemonicSentence: 'ch 咳嗽喝水音 /tʃ/：每次 lunch，非常 rich，吃得 much。', highlight: 'ch', emoji: '🍱' },
          { word: 'photo', translation: '照片', mnemonicSentence: 'ph 搀扶发音 /f/：拍下 photo，打通 phone，看见 elephant。', highlight: 'ph', emoji: '📷' }
        ]
      },
      {
        id: 'c13',
        title: '第13课：变声怪 r 与 l 在元音的前后',
        icon: '🌀',
        mnemonic: 'r 像弱 /r/，l 像乐 /l/，在元音后面大变音！',
        sound: 'r / l [Vowel Shifts]',
        items: [
          { word: 'red', translation: '红色', mnemonicSentence: 'r在元音前：开着 red 车，送你玫瑰 rose，拿绳 rope。', highlight: 'r', emoji: '🔴' },
          { word: 'bear', translation: '棕熊', mnemonicSentence: 'r在元音后：一头 bear，感到 fear，拼命 hear。', highlight: 'ear', emoji: '🐻' },
          { word: 'lake', translation: '湖泊', mnemonicSentence: 'l在元音前：微风吹过 lake，出门去锁 lock。', highlight: 'l', emoji: '🏞' },
          { word: 'pill', translation: '药丸', mnemonicSentence: 'l在元音后：身体 ill，吃颗 pill，看小山 hill，付账单 bill。', highlight: 'll', emoji: '💊' },
          { word: 'needle', translation: '细针', mnemonicSentence: 'le 结构(e不发音)：一根 needle，掉进 noodle，点上 candle。', highlight: 'le', emoji: '🪡' },
        ]
      },
      {
        id: 'c14',
        title: '第14课：沉默不发音小怪兽 (kn, wr, mb, bt)',
        icon: '🤫',
        mnemonic: '到家门口不咳 k！小草弱不握手 w！老伯爬山太累不说话 b / t！',
        sound: '[Silent Consonants]',
        items: [
          { word: 'knee', translation: '膝盖', mnemonicSentence: '到家门前就不咳k了：我知道 know，摸膝盖 knee，听门响 knock。', highlight: 'kn', emoji: '🦵' },
          { word: 'write', translation: '写字', mnemonicSentence: '小草太弱，不和w握手：写字 write，错了 wrong，包裹 wrap。', highlight: 'wr', emoji: '✍️' },
          { word: 'climb', translation: '攀爬', mnemonicSentence: '老伯伯爬山，太累不说话：爬山 climb，抖四肢 limb，冻麻木 numb。', highlight: 'mb', emoji: '🧗' },
          { word: 'debt', translation: '债务', mnemonicSentence: '极速拼读：无力偿还 debt，心生疑问 doubt。', highlight: 'bt', emoji: '💸' },
        ]
      },
      {
        id: 'c15',
        title: '第15课：吓蛇四人组浊化音 (sp, st, sc, sk)',
        icon: '⚡',
        mnemonic: '碰到大毒蛇（S）不用怕，后面辅音通通变浊音吓走它！',
        sound: '/sb/ /sd/ /sg/',
        items: [
          { word: 'sport', translation: '运动', mnemonicSentence: 'sp 浊化为 /sb/：喜爱 sport，陀螺 spin，草木 spring。', highlight: 'sp', emoji: '🏋️' },
          { word: 'star', translation: '星星', mnemonicSentence: 'st 浊化为 /sd/：夜空 star，小木 stick，立刻 stop。', highlight: 'st', emoji: '⭐' },
          { word: 'scan', translation: '扫视', mnemonicSentence: 'sc 浊化为 /sg/：双眼 scan，极度 scare，看屏幕 screen。', highlight: 'sc', emoji: '🖥️' },
          { word: 'skirt', translation: '裙子', mnemonicSentence: 'sk 浊化为 /sg/：穿上 skirt，老鼠 skip，在冰上 skate。', highlight: 'sk', emoji: '👗' },
        ]
      }
    ]
  },
  {
    id: 'm4',
    title: '第四阶段：长元音本音与字母联盟',
    icon: '✨',
    courses: [
      {
        id: 'c16',
        title: '第16课：长音开音节 A 联盟 (a_e, ai, ay)',
        icon: '👑',
        mnemonic: '长元音 Aa 在开音节发它的大名字母本音 /eɪ/！',
        sound: '/eɪ/',
        items: [
          { word: 'cake', translation: '蛋糕', mnemonicSentence: 'a_e 结构：买了 cake，小心 take，千万别 shake。', highlight: 'a_e', emoji: '🍰' },
          { word: 'rain', translation: '下雨', mnemonicSentence: 'ai 在中间：突然 rain，没修 drain，淹没 grain。', highlight: 'ai', emoji: '🌧️' },
          { word: 'day', translation: '天', mnemonicSentence: 'ay 在词尾：很多 day，没发 pay，无话 say。', highlight: 'ay', emoji: '☀️' },
          { word: 'game', translation: '游戏', mnemonicSentence: 'a_e 结构：出了 name，不再 same，代言 game。', highlight: 'a_e', emoji: '🎮' },
        ]
      },
      {
        id: 'c17',
        title: '第17课：长音大班长 E 联盟 (ee, ea, ey)',
        icon: '🐝',
        mnemonic: '元音 Ee 的大名 /iː/：大眼睛双胞胎 ee 与好拍档 ea 聚首！',
        sound: '/iː/',
        items: [
          { word: 'tree', translation: '大树', mnemonicSentence: 'ee 组合发大名 /iː/：一只 bee，躲进 tree，没人 see。', highlight: 'ee', emoji: '🌳' },
          { word: 'sea', translation: '大海', mnemonicSentence: 'ea 组合：来到 sea，泡杯 tea，吃点 pea。', highlight: 'ea', emoji: '🌊' },
          { word: 'key', translation: '钥匙', mnemonicSentence: 'ey 组合：顽皮 monkey，捡起 key，扔向 donkey。', highlight: 'ey', emoji: '🔑' },
          { word: 'sleep', translation: '睡着', mnemonicSentence: 'ee 联盟 eep：悬崖 deep，开着 jeep，莫要 sleep。', highlight: 'eep', emoji: '💤' },
        ]
      },
      {
        id: 'c18',
        title: '第18课：开音节 I / O / U 联盟高阶阵线',
        icon: '🔮',
        mnemonic: '字母本音 /aɪ/ /əʊ/ /juː/：开门大叫本名，元音大声喧哗！',
        sound: '/aɪ/ /əʊ/ /juː/',
        items: [
          { word: 'nice', translation: '很棒', mnemonicSentence: 'i_e 结构：倒杯 juice，加点 ice，味道 nice。', highlight: 'i_e', emoji: '🥤' },
          { word: 'sigh', translation: '叹气', mnemonicSentence: 'igh 结构发 /aɪ/：山太 high，只能 sigh。', highlight: 'igh', emoji: '😮💨' },
          { word: 'coke', translation: '可乐', mnemonicSentence: 'o_e 结构发本音：喝着 coke，听着 joke，差点 choke。', highlight: 'o_e', emoji: '🥤' },
          { word: 'cute', translation: '可爱的', mnemonicSentence: 'u_e 结构发本音 /juː/：多么 cute，小猫 mute。', highlight: 'u_e', emoji: '🐱' },
          { word: 'blue', translation: '蓝色', mnemonicSentence: 'ue 发音规律：丢了 glue，没有 clue，心情 blue。', highlight: 'ue', emoji: '💙' },
        ]
      },
      {
        id: 'c19',
        title: '第19课：双眼哭泣与老虎呼啸 (oo, ou, ow)',
        icon: '🐯',
        mnemonic: '大眼睛 oo 呜呜哭 /uː/！ou/ow 像被老虎咬到发出 /aʊ/ 的尖叫声！',
        sound: '/uː/ /ʊ/ /aʊ/',
        items: [
          { word: 'zoo', translation: '动物园', mnemonicSentence: 'oo 哭泣音 /uː/：一个 zoo，种满 bamboo，养了 kangaroo。', highlight: 'oo', emoji: '🦁' },
          { word: 'book', translation: '书本', mnemonicSentence: 'oo 在 k 前发短/ʊ/：手拿 book，一边 cook，一边 look。', highlight: 'ook', emoji: '📖' },
          { word: 'loud', translation: '大声的', mnemonicSentence: 'ou 发 /aʊ/：声音 loud，冲向 cloud，感到 proud。', highlight: 'ou', emoji: '📢' },
          { word: 'town', translation: '城镇', mnemonicSentence: 'ow 发 /aʊ/：心情 down，来到 town，看看 clown。', highlight: 'ow', emoji: '🎪' },
        ]
      }
    ]
  },
  {
    id: 'm5',
    title: '第五阶段：自然探险与后缀殿堂',
    icon: '🧭',
    courses: [
      {
        id: 'c20',
        title: '第20课：探险 -r 元元音结合体 (ar, er, ir, or, ur)',
        icon: '🎒',
        mnemonic: 'ar 疼得啊啊啊 /ɑːr/！er/ir/ur 扁口发 /ɜːr/！or 恍然大悟 /ɔːr/！',
        sound: '/ɑːr/ /ɜːr/ /ɔːr/',
        items: [
          { word: 'star', translation: '星星', mnemonicSentence: 'ar 疼得啊啊啊 /ɑːr/：开着 car，向着 star，路途 far。', highlight: 'ar', emoji: '⭐' },
          { word: 'teacher', translation: '老师', mnemonicSentence: 'er 结尾不重读发/ər/：我的 teacher，教我 computer，夸我 clever。', highlight: 'er', emoji: '👩‍🏫' },
          { word: 'skirt', translation: '短裙', mnemonicSentence: 'ir 重读发 /ɜːr/：拍拍 dirt (尘土)，穿上 shirt (衬衫)，还有 skirt (短裙)。', highlight: 'ir', emoji: '👗' },
          { word: 'sport', translation: '运动', mnemonicSentence: 'or 重读发 /ɔːr/：个子 short，喜欢 sport，拿着 fork 吃 pork。', highlight: 'or', emoji: '⚽' },
          { word: 'turtle', translation: '乌龟', mnemonicSentence: 'ur 重读发 /ɜːr/：护士 nurse，丢了 purse，买只 turtle 涂成 purple。', highlight: 'ur', emoji: '🐢' }
        ]
      },
      {
        id: 'c21',
        title: '第21课：哦一发音组合 (oi, oy)',
        icon: '🪙',
        mnemonic: 'oi 放中间，oy 在末尾！胆小鬼吵着闹着叫哦一！',
        sound: '/ɔɪ/',
        items: [
          { word: 'coin', translation: '硬币', mnemonicSentence: 'oi 在中：是否 join，抛起 coin，加点 oil 煮 boil。', highlight: 'oi', emoji: '🪙' },
          { word: 'toy', translation: '玩具', mnemonicSentence: 'oy 在尾：有个 boy，玩着 toy，心中充满 joy。', highlight: 'oy', emoji: '🧸' }
        ]
      },
      {
        id: 'c22',
        title: '第22课：恍然大悟音群 (au, aw, al, all)',
        icon: '🤝',
        mnemonic: '嘴巴张大发长音 /ɔː/！恍然大悟！',
        sound: '/ɔː/',
        items: [
          { word: 'draw', translation: '画画', mnemonicSentence: 'aw 结尾：大雁用 claw，抓起 straw，画出 draw。', highlight: 'aw', emoji: '🎨' },
          { word: 'walk', translation: '步行', mnemonicSentence: 'al 中 l 不发音：拿着 chalk，一边 walk，一边 talk。', highlight: 'alk', emoji: '🚶' },
          { word: 'ball', translation: '球类', mnemonicSentence: 'all 组合：一个 ball，往下 fall，砸到 wall。', highlight: 'all', emoji: '⚽' },
          { word: 'small', translation: '小的', mnemonicSentence: 'all 组合：身体 tall，脑袋 small，知道 all。', highlight: 'all', emoji: '👶' }
        ]
      },
      {
        id: 'c23',
        title: '第23课：拼读高阶词尾后缀 (tion, cion, sure, ture)',
        icon: '🏛️',
        mnemonic: '殿堂级长词后缀一键拼读！/ʃn/、/ʒə/ 和 /tʃə/ 的发音奥秘！',
        sound: '/ʃn/ /ʒə/ /tʃə/',
        items: [
          { word: 'station', translation: '火车站', mnemonicSentence: '-tion 发音 /ʃ(ə)n/：想去 station，不知 direction，开始 action。', highlight: 'tion', emoji: '🚉' },
          { word: 'magician', translation: '魔术师', mnemonicSentence: '-cian 同样发音 /ʃ(ə)n/：音乐家 musician 配合魔术师 magician。', highlight: 'cian', emoji: '🧙' },
          { word: 'treasure', translation: '宝藏', mnemonicSentence: '-sure 发音 /ʒə(r)/：看到 treasure，无法 measure，感到 pleasure。', highlight: 'sure', emoji: '🏴‍☠️' },
          { word: 'adventure', translation: '奇幻冒险', mnemonicSentence: '-ture 发音 /tʃə(r)/：来到 nature，进行 adventure，拍下 picture。', highlight: 'ture', emoji: '🧗' }
        ]
      }
    ]
  }
];

const ALPHABET_26 = [
  { char: 'Aa', sound: '/æ/', type: '元音班委', icon: '🍎', desc: '纪律委员张大嘴' },
  { char: 'Bb', sound: '/b/', type: '辅音', icon: '👦', desc: '大肚伯伯' },
  { char: 'Cc', sound: '/k/', type: '辅音', icon: '🚗', desc: '张嘴咳嗽' },
  { char: 'Dd', sound: '/d/', type: '辅音', icon: '🐕', desc: '大胖弟弟' },
  { char: 'Ee', sound: '/e/', type: '元音班委', icon: '🥚', desc: '大班长小嘴巴' },
  { char: 'Ff', sound: '/f/', type: '辅音', icon: '🦊', desc: '扶着拐棍' },
  { char: 'Gg', sound: '/g/', type: '辅音', icon: '👧', desc: '哥哥爱笑' },
  { char: 'Hh', sound: '/h/', type: '辅音', icon: '🥵', desc: '爬完梯子喝水' },
  { char: 'Ii', sound: '/ɪ/', type: '元音班委', icon: '🐷', desc: '体育委员爱叹气' },
  { char: 'Jj', sound: '/dʒ/', type: '辅音', icon: '🍓', desc: '橘色雨伞' },
  { char: 'Kk', sound: '/k/', type: '辅音', icon: '⚽', desc: '咳嗽病人' },
  { char: 'Ll', sound: '/l/', type: '辅音', icon: '🦵', desc: '快乐孩子' },
  { char: 'Mm', sound: '/m/', type: '辅音', icon: '🌙', desc: '沉默大山' },
  { char: 'Nn', sound: '/n/', type: '辅音', icon: '🧣', desc: '慢慢开门' },
  { char: 'Pp', sound: '/p/', type: '辅音', icon: '🐼', desc: '慈祥婆婆' },
  { char: 'Qq', sound: '/kw/', type: '辅音', icon: '🤫', desc: '扩胸运动' },
  { char: 'Rr', sound: '/r/', type: '辅音', icon: '🏃', desc: '柔弱小苗' },
  { char: 'Ss', sound: '/s/', type: '辅音', icon: '🐍', desc: '一条小蛇' },
  { char: 'Tt', sound: '/t/', type: '辅音', icon: '🔟', desc: '喜欢踢腿' },
  { char: 'Vv', sound: '/v/', type: '辅音', icon: '🚐', desc: '富人项链' },
  { char: 'Ww', sound: '/w/', type: '辅音', icon: '🍉', desc: '两人握手' },
  { char: 'Xx', sound: '/ks/', type: '辅音', icon: '🦊', desc: '劈开木头' },
  { char: 'Yy', sound: '/j/', type: '辅音', icon: '🦒', desc: '一个枝桠' },
  { char: 'Zz', sound: '/z/', type: '辅音', icon: '⚡', desc: '一道闪电' }
];

const getPhonicsRulePhrase = (letter: string, sound: string, charMnemonic: string) => {
  const L = letter[0].toUpperCase(); 
  const cleanMnemonic = charMnemonic.replace(/[！!]/g, '');
  const triSound = `${sound} ${sound} ${sound}`; 
  
  if (L === 'B') {
    return `大肚 ${L} 大肚子伯伯 ${triSound}`;
  }
  if (L === 'C') {
    return `猫开口 ${L} 猫咪喵喵叫 ${triSound}`;
  }
  if (L === 'D') {
    return `大鼓 ${L} 敲击大鼓发出咚咚声 ${triSound}`;
  }
  if (L === 'E') {
    return `小木耳 ${L} 微微张嘴发出笑声 ${triSound}`;
  }
  if (L === 'F') {
    return `拐杖 ${L} 牙咬嘴唇轻轻吹气 ${triSound}`;
  }
  if (L === 'G') {
    return `小手枪 ${L} 顶在喉咙发出咳咳声 ${triSound}`;
  }
  if (L === 'H') {
    return `竹椅 ${L} 大口哈气吹热风 ${triSound}`;
  }
  if (L === 'I') {
    return `小蜡烛 ${L} 微笑咧嘴轻轻哼 ${triSound}`;
  }
  if (L === 'J') {
    return `大勾子 ${L} 双唇微突发颤音 ${triSound}`;
  }
  if (L === 'K') {
    return `机关枪 ${L} 后部急速吐气声 ${triSound}`;
  }
  if (L === 'L') {
    return `小木棍 ${L} 舌抵牙龈向上卷 ${triSound}`;
  }
  if (L === 'M') {
    return `双拱门 ${L} 闭嘴闷声发出哼哼声 ${triSound}`;
  }
  if (L === 'N') {
    return `慢慢开门 ${L} 舌头顶门向外呼 ${triSound}`;
  }
  if (L === 'O') {
    return `大甜圈 ${L} 张圆嘴巴高声唱 ${triSound}`;
  }
  if (L === 'P') {
    return `婆婆 ${L} 慈祥婆婆双唇急爆气 ${triSound}`;
  }
  if (L === 'Q') {
    return `短脖鸭 ${L} 伸脖发声 ${triSound}`;
  }
  if (L === 'R') {
    return `小苗 ${L} 柔弱小苗反勾发出弱音 ${triSound}`;
  }
  if (L === 'S') {
    return `小蛇 ${L} 昂首小蛇闭齿吹气嘶嘶叫 ${triSound}`;
  }
  if (L === 'T') {
    return `踢腿 ${L} 快速送气轻爆破 ${triSound}`;
  }
  if (L === 'U') {
    return `小酒杯 ${L} 苦恼皱眉发出闷重声 ${triSound}`;
  }
  if (L === 'V') {
    return `项链 ${L} 露齿咬唇剧烈摩擦颤声 ${triSound}`;
  }
  if (L === 'W') {
    return `握手 ${L} 噘嘴哈出热气 ${triSound}`;
  }
  if (L === 'X') {
    return `劈木头 ${L} 像大斧送气吹出撕破声 ${triSound}`;
  }
  if (L === 'Y') {
    return `大树桠 ${L} 咧嘴向后拉喉发悬空声 ${triSound}`;
  }
  if (L === 'Z') {
    return `闪电 ${L} 咬紧钢牙剧烈摩擦震动声 ${triSound}`;
  }
  if (L === 'A') {
    return `纪律委员 ${L} 张大嘴巴惊讶发短声 ${triSound}`;
  }

  const colonIdx = cleanMnemonic.indexOf('：') !== -1 ? cleanMnemonic.indexOf('：') : cleanMnemonic.indexOf(':');
  if (colonIdx !== -1) {
    return `${cleanMnemonic.substring(0, colonIdx)} ${L} ${cleanMnemonic.substring(colonIdx + 1)} ${triSound}`;
  }
  return `${cleanMnemonic} ${triSound}`;
};

const getCourseVideoUrl = (courseId: string): string => {
  const videoMap: Record<string, string> = {
    c1: 'https://www.youtube.com/embed/HQ3G_O_YPrY', // 元音拼读 / 26 Letters
    c2: 'https://www.youtube.com/embed/7rX6L4B9A7w', // 元音五星
    c3: 'https://www.youtube.com/embed/36U4ezS9KTo', // b, c, d, f, g
    c4: 'https://www.youtube.com/embed/fe7Y0S6E0R0', // h, j, k, l
    c5: 'https://www.youtube.com/embed/gS_4B1fD85o', // m, n, p, q
    c6: 'https://www.youtube.com/embed/bN5H2I-c_rE', // r, s, t, v
    c7: 'https://www.youtube.com/embed/vO8v6U9x7jI', // w, x, y, z
    c8: 'https://www.youtube.com/embed/4b4yN4sS_4E', // 闭音节 at ad ag
    c9: 'https://www.youtube.com/embed/5Uu7mD3mE6E', // 闭音节 e
    c10: 'https://www.youtube.com/embed/2_Y5v4X0S_w', // 闭音节 i
    c11: 'https://www.youtube.com/embed/gS_4B1fD85o', // 闭音节 o / u
    c12: 'https://www.youtube.com/embed/0G6kZ7vU04I', // th, sh, ch, ph
    c13: 'https://www.youtube.com/embed/Xm6P6m48pC8', // Bossy R
    c14: 'https://www.youtube.com/embed/kYj6v4_gUlg', // 沉默不发音
    c15: 'https://www.youtube.com/embed/Ape6fscKkYg', // Blend letters sp st sc
    c16: 'https://www.youtube.com/embed/fe7Y0S6E0R0', // Long A
    c17: 'https://www.youtube.com/embed/5Uu7mD3mE6E', // Long E
    c18: 'https://www.youtube.com/embed/2_Y5v4X0S_w', // Long I O U
    c19: 'https://www.youtube.com/embed/0G6kZ7vU04I', // oo ou ow
    c20: 'https://www.youtube.com/embed/Xm6P6m48pC8', // ar er ir
    c21: 'https://www.youtube.com/embed/Ape6fscKkYg', // oi oy
    c22: 'https://www.youtube.com/embed/fe7Y0S6E0R0', // au aw
    c23: 'https://www.youtube.com/embed/0G6kZ7vU04I', // tion ...
  };
  return videoMap[courseId] || 'https://www.youtube.com/embed/HQ3G_O_YPrY';
};

export const PhonicsArena: React.FC<Props> = ({ stats, onUpdateStats, onReward, onClose }) => {
  const [selectedModule, setSelectedModule] = useState<string>('m1');
  const [activeCourseId, setActiveCourseId] = useState<string>('c1');
  
  // Video overlay modal state
  const [showVideoModal, setShowVideoModal] = useState<string | null>(null);
  const [inlineVideoPlaying, setInlineVideoPlaying] = useState<boolean>(false);
  
  // Game states inside training dojo
  const [dojoMode, setDojoMode] = useState<'LEARN' | 'QUIZ' | 'SUCCESS'>('LEARN');
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizStep, setQuizStep] = useState<number>(0);
  
  // Quiz tracking
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<any>(null);
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  // Audio state
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const currentCourse = useMemo(() => {
    for (const m of PHONICS_SYLLABUS) {
      const found = m.courses.find(c => c.id === activeCourseId);
      if (found) return found;
    }
    return PHONICS_SYLLABUS[0].courses[0];
  }, [activeCourseId]);

  const speakPhonics = (text: string) => {
    setIsSynthesizing(text);
    try {
      audio.speak(text);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setIsSynthesizing(null);
    }, 1200);
  };

  // Generate 5 random questions based on the active course items
  const startQuiz = () => {
    audio.playClick();
    setDojoMode('QUIZ');
    setQuizScore(0);
    setQuizStep(0);
    generateQuizQuestion(0);
  };

  const generateQuizQuestion = (stepIndex: number) => {
    const courseItems = currentCourse.items;
    const correctItem = courseItems[stepIndex % courseItems.length];
    
    // Choose between 2 formats:
    // Option 0: Listen to audio (Speak word) -> match the correct word
    // Option 1: Complete missing phonics letters -> look at emoji & translation and fill blank
    const format = Math.random() > 0.5 ? 0 : 1;
    
    let options: string[] = [];
    let correctValue = '';
    
    if (format === 0) {
      // Format 0: Audio word recognition
      correctValue = correctItem.word;
      
      const otherItems = PHONICS_SYLLABUS
        .flatMap(m => m.courses.flatMap(c => c.items))
        .filter(item => item.word !== correctItem.word);
      
      const distractors: string[] = [];
      while (distractors.length < 3 && otherItems.length > 0) {
        const idx = Math.floor(Math.random() * otherItems.length);
        const w = otherItems[idx].word;
        if (!distractors.includes(w) && w !== correctValue) {
          distractors.push(w);
        }
      }
      options = [correctValue, ...distractors].sort(() => Math.random() - 0.5);
      
      // Auto play audio
      setTimeout(() => {
        try { audio.speak(correctValue); } catch(e){}
      }, 350);
      
    } else {
      // Format 1: Fill the blank phonics block
      correctValue = correctItem.highlight;
      
      // Get other unique highlights in the syllabus as distractors
      const otherHighlights = Array.from(new Set(
        PHONICS_SYLLABUS
          .flatMap(m => m.courses.flatMap(c => c.items))
          .map(item => item.highlight)
          .filter(h => h !== correctValue && h.length > 0)
      ));
      
      const distractors: string[] = [];
      while (distractors.length < 3 && otherHighlights.length > 0) {
        const idx = Math.floor(Math.random() * otherHighlights.length);
        const h = otherHighlights[idx];
        if (!distractors.includes(h) && h !== correctValue) {
          distractors.push(h);
        }
      }
      if (distractors.length < 3) {
        // Fallback standard highlights if syllabus size is low or limited
        const fallback = ['at', 'ad', 'en', 'et', 'ig', 'op'];
        for (const item of fallback) {
          if (distractors.length < 3 && item !== correctValue && !distractors.includes(item)) {
            distractors.push(item);
          }
        }
      }
      options = [correctValue, ...distractors].sort(() => Math.random() - 0.5);
    }

    setCurrentQuizQuestion({
      format,
      correctValue,
      correctWord: correctItem.word,
      emoji: correctItem.emoji,
      translation: correctItem.translation,
      highlight: correctItem.highlight,
      options
    });
    setUserSelectedAnswer(null);
    setIsAnswerCorrect(null);
  };

  const handleAnswerSelect = (option: string) => {
    if (userSelectedAnswer !== null) return; // block multiple clicks
    setUserSelectedAnswer(option);
    
    const correct = option === currentQuizQuestion.correctValue;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      audio.playSuccess();
      setQuizScore(prev => prev + 1);
    } else {
      audio.playError();
    }

    // Auto vocalize the final response word to connect text + sound visually & aurally
    setTimeout(() => {
      try {
        audio.speak(currentQuizQuestion.correctWord);
      } catch(e){}
    }, 450);

    setTimeout(() => {
      if (quizStep < 4) {
        setQuizStep(prev => prev + 1);
        generateQuizQuestion(quizStep + 1);
      } else {
        // Evaluate dojo completion!
        concludeDojoSession();
      }
    }, 2200); // 2.2 seconds to absorb pronunciation
  };

  const concludeDojoSession = () => {
    setDojoMode('SUCCESS');
    audio.playLevelUp();
    
    // Trigger real rewards
    const gainedXp = 25 + quizScore * 5;
    const gainedCoins = 10 + quizScore * 2;
    
    onUpdateStats({
      xp: (stats.xp || 0) + gainedXp,
      magicCoins: (stats.magicCoins || 0) + gainedCoins,
      streak: (stats.streak || 1) + 1, // trigger learning streak pump
    });
    
    if (onReward) {
      onReward(gainedXp, gainedCoins);
    }

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FBBF24', '#34D399', '#60A5FA', '#EEF2F6']
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#064e3b] overflow-y-auto flex flex-col font-sans select-none pb-12">
      
      {/* Dynamic Animated Particles / Forest Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/40 via-emerald-955 to-[#022c22] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER STATUS PANEL */}
      <header className="sticky top-0 z-30 bg-emerald-900/90 backdrop-blur-md border-b-2 border-emerald-600/45 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { audio.playClick(); onClose(); }}
            className="p-2.5 bg-emerald-800/80 hover:bg-emerald-700/90 hover:scale-105 active:scale-95 text-emerald-100 rounded-xl border border-emerald-600/50 shadow-sm transition-all cursor-pointer flex items-center"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="font-black text-white text-base sm:text-[19px] tracking-wide flex items-center gap-1.5">
              <span>倍速拼读学院 · 声音修炼场</span>
              <span className="text-yellow-400 animate-pulse text-[15px]">🛡️</span>
            </h1>
            <p className="text-emerald-300 text-[11px] font-extrabold leading-none mt-1">
              通过经典口诀、拟声试炼极速点亮纯正神域口音！
            </p>
          </div>
        </div>

        {/* User stats widget in header */}
        <div className="flex items-center space-x-2 bg-emerald-950/80 p-1.5 px-3 rounded-full border border-emerald-700/60 shadow-inner">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-black text-amber-400 font-sans">🪙 {stats.magicCoins}</span>
          </div>
          <span className="text-[#a7f3d0]/30 font-bold text-xs select-none">|</span>
          <div className="flex items-center space-x-1">
            <span className="bg-emerald-500/25 text-[#6ee7b7] px-2 py-0.5 rounded-md font-black text-[10.5px] font-sans">LV.{stats.level}</span>
          </div>
          <span className="text-[#a7f3d0]/30 font-bold text-xs select-none">|</span>
          <div className="flex items-center space-x-0.5 text-rose-455 animate-pulse">
            <Flame size={12} className="fill-current text-rose-500" />
            <span className="font-extrabold text-[11px] text-rose-200 font-sans">{stats.streak}天连击</span>
          </div>
        </div>
      </header>

      {/* COMPACT STAGE BOARD CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* LEFT COLUMN: MODULE ROADMAP & SYLLABUS LISTING (Lg: 4 of 12 cols) */}
        <section className="lg:col-span-4 shrink-0 flex flex-col space-y-4">
          
          {/* Module Selector Banner */}
          <div className="bg-[#115e59] p-3 rounded-2xl border-2 border-emerald-500/50 shadow-md">
            <p className="text-teal-200 font-extrabold text-[11px] mb-2 uppercase tracking-wider text-center">🏆 自然拼读极速进阶地图</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PHONICS_SYLLABUS.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    audio.playClick();
                    setSelectedModule(mod.id);
                    setInlineVideoPlaying(false);
                    if (mod.courses.length > 0) {
                      setActiveCourseId(mod.courses[0].id);
                    }
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center border text-center ${
                    selectedModule === mod.id 
                    ? 'bg-amber-400 border-amber-600 text-emerald-950 scale-102 font-black shadow' 
                    : 'bg-emerald-900/65 border-emerald-700/50 text-emerald-100/80 hover:text-white hover:bg-emerald-800'
                  }`}
                >
                  <span className="text-xl mb-0.5 select-none">{mod.icon}</span>
                  <span className="text-[10px] font-black leading-tight">M{mod.id.replace('m', '')} 阶段</span>
                </button>
              ))}
            </div>
          </div>

          {/* Courses selection list under selected module */}
          <div className="bg-emerald-950/80 rounded-2xl border-2 border-emerald-600/35 p-3.5 space-y-2 max-h-[500px] overflow-y-auto shadow-inner">
            <h3 className="text-[12.5px] font-black text-emerald-300 flex items-center gap-1.5 border-b border-emerald-800 pb-2 mb-2">
              <BookOpen size={14} className="text-teal-400" />
              <span>当前阶段特训课程列表</span>
            </h3>

            {PHONICS_SYLLABUS.find(m => m.id === selectedModule)?.courses.map((course, idx) => {
              const isActive = course.id === activeCourseId;
              return (
                <button
                  key={course.id}
                  onClick={() => {
                    audio.playClick();
                    setActiveCourseId(course.id);
                    setInlineVideoPlaying(false);
                    setDojoMode('LEARN');
                  }}
                  className={`w-full p-3 rounded-xl text-left border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isActive 
                    ? 'bg-gradient-to-r from-emerald-500/30 to-teal-400/20 border-emerald-400 text-white shadow shadow-emerald-500/20' 
                    : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200/90 hover:border-emerald-700/55 hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-emerald-800/60 border border-emerald-600/50 text-base flex items-center justify-center shrink-0">
                      {course.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-[#34d399] leading-none mb-1 flex items-center gap-1.5 flex-wrap">
                        <span>第 {idx + 1} 课  ·  {course.sound}</span>
                        <span className="text-[8.5px] text-indigo-200 bg-indigo-900/50 border border-indigo-500/40 px-1 py-0.2 rounded font-black flex items-center gap-0.5 leading-none shrink-0 scale-90 origin-left">
                          <Video size={8} /> 节奏视频
                        </span>
                      </p>
                      <h4 className="font-extrabold text-[13.5px] text-slate-100 truncate leading-snug">{course.title}</h4>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black select-none shrink-0 ${
                    isActive 
                    ? 'bg-emerald-400/95 text-emerald-950 border border-emerald-300' 
                    : 'bg-emerald-900/60 text-emerald-400 font-extrabold border border-emerald-800/40'
                  }`}>
                    {isActive ? '研读中' : '去试炼'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick learning tip bottom panel */}
          <div className="bg-emerald-900/35 p-3 rounded-2xl border border-emerald-800/40 flex gap-2.5 items-start">
            <span className="text-xl shrink-0 select-none">🦉</span>
            <div className="text-left">
              <h5 className="text-[12px] font-black text-emerald-300 leading-tight font-sans">智者猫头鹰的特训建议</h5>
              <p className="text-[10.5px] text-emerald-100/80 leading-relaxed mt-0.5">
                先认真阅读“口诀金言”并点击单词卡反复聆听，熟稔其声。随后点击“开启声音特训试炼”以完成评估、收获足额金币哦！
              </p>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: INTERACTIVE CORE PLAY STAGE (Lg: 8 of 12 cols) */}
        <section className="lg:col-span-8 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            
            {/* 1. DOJO LEARN MODE DISPLAY */}
            {dojoMode === 'LEARN' && (
              <motion.div 
                key="learn-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gradient-to-b from-[#f9fafb] via-white to-[#f3f4f6] rounded-3xl p-5 border-4 border-emerald-500 shadow-xl text-left space-y-4"
              >
                
                {/* Course Main title block */}
                <div className="bg-gradient-to-r from-emerald-100/95 via-teal-50/50 to-amber-50/70 p-3 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3.5xl p-2.5 bg-white/95 rounded-2xl border border-emerald-100 shadow-xs select-none">
                      {currentCourse.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-600 text-white font-black text-[9.5px] px-2 py-0.5 rounded-full border border-emerald-500 uppercase tracking-widest">自然拼读核心秘笈</span>
                        <span className="bg-amber-100 text-amber-800 text-[10.5px] font-black px-2 py-0.2 rounded border border-amber-200 font-sans">发音: {currentCourse.sound}</span>
                      </div>
                      <h2 className="text-lg sm:text-[23.5px] font-black text-emerald-950 mt-1 leading-snug font-sans">{currentCourse.title}</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => speakPhonics(currentCourse.sound)}
                    className="p-3 bg-white hover:bg-amber-50 text-emerald-800 hover:text-amber-700 hover:scale-105 active:scale-95 border-2 border-emerald-105 rounded-full shadow transition-all cursor-pointer"
                    title="播放核心发音示范"
                  >
                    <Volume2 size={24} className="animate-pulse" />
                  </button>
                </div>

                {/* Golden Chant Mnemonic Card */}
                <div className="bg-[#fef3c7] border-2 border-amber-300 p-4 rounded-2xl shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-amber-400/10 rounded-full select-none pointer-events-none" />
                  <div className="flex gap-3">
                    <span className="text-3xl animate-bounce select-none shrink-0 mt-0.5">🗣️</span>
                    <div>
                      <h4 className="text-[13px] font-black text-amber-900 tracking-wider font-sans">📜 拼读魔法金口诀 (朗读背诵)</h4>
                      <p className="text-[14.5px] sm:text-[16.5px] font-black text-[#513511] mt-1.5 leading-relaxed bg-white/45 p-2 rounded-xl border border-amber-200/50 font-sans">
                        {currentCourse.mnemonic}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📺 Phonics Interactive Companion Rhythm Video Card */}
                {inlineVideoPlaying ? (
                  <div className="bg-slate-900 border-4 border-indigo-500 rounded-3xl overflow-hidden shadow-md space-y-0.5">
                    {/* Inline TV top bar */}
                    <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-indigo-950">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] animate-pulse shrink-0" />
                        <span className="text-white font-black text-xs font-sans truncate">
                          📺 Phonics 魔法音律伴播 · {currentCourse.sound} 节奏特训正在播放
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setShowVideoModal(getCourseVideoUrl(currentCourse.id));
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-1 border-b-[2px] border-indigo-800"
                        >
                          <Sparkles size={11} />
                          <span>大屏开播</span>
                        </button>
                        <button
                          onClick={() => {
                            audio.playClick();
                            setInlineVideoPlaying(false);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer border border-slate-700"
                        >
                          收起
                        </button>
                      </div>
                    </div>

                    {/* Embed Iframe Screen */}
                    <div className="relative pt-[56.25%] bg-black">
                      <iframe
                        src={`${getCourseVideoUrl(currentCourse.id)}?autoplay=1`}
                        title={`${currentCourse.title} Video Player`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>

                    {/* Interactive Companion Advice Footer */}
                    <div className="bg-slate-950 p-3 text-[11.5px] text-indigo-200/90 font-bold flex flex-col sm:flex-row items-center justify-between gap-2 font-sans border-t border-indigo-950/40 text-left">
                      <span className="flex items-center gap-1.5">
                        <span>💡</span>
                        <span>伴唱模式已开启：你可以一边看着下方的发音口诀/卡片，一边跟着视频大声哼鸣拼唱哦！</span>
                      </span>
                      <button
                        onClick={() => {
                          audio.playClick();
                          setInlineVideoPlaying(false);
                        }}
                        className="text-amber-300 hover:text-amber-200 underline font-black cursor-pointer shrink-0 text-right w-full sm:w-auto"
                      >
                        已练完，收回视频 ↩
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#eef2f6]/95 border-2 border-indigo-200 p-4 rounded-3xl shadow-xs text-left relative overflow-hidden flex flex-col md:flex-row items-center gap-4 transition-all hover:bg-indigo-50/20">
                    <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-indigo-500/5 rounded-full select-none pointer-events-none" />
                    
                    {/* TV Mock Thumbnail on the left */}
                    <div 
                      onClick={() => {
                        audio.playClick();
                        setInlineVideoPlaying(true);
                      }}
                      className="w-full md:w-44 aspect-video bg-indigo-950 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner group cursor-pointer border-2 border-indigo-400 hover:border-amber-400 hover:scale-[1.02] transition-all shrink-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-[#221c54]/30 to-slate-950/40" />
                      <PlayCircle className="w-12 h-12 text-amber-400 group-hover:scale-110 group-hover:text-amber-300 transition-all drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] z-10 animate-pulse" />
                      <span className="absolute bottom-1.5 text-[9px] font-black tracking-wider bg-black/55 text-indigo-200 px-1.5 py-0.5 rounded-full z-10">
                        🎬 极速伴唱课堂
                      </span>
                    </div>

                    <div className="flex-1 w-full text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          本课专属自然拼读律动
                        </span>
                        <span className="text-[10px] text-indigo-500 font-extrabold flex items-center gap-0.5 bg-indigo-50 px-1.5 py-0.2 rounded font-sans">
                          1080P 超清伴学
                        </span>
                      </div>
                      <h4 className="text-[14.5px] font-black text-slate-800 mt-1.5 flex items-center gap-1.5 font-sans">
                        <span>📺 Phonics 拼读节奏实战特训视频</span>
                      </h4>
                      <p className="text-[12.5px] text-slate-500 font-bold leading-relaxed mt-1 font-sans">
                        想跟唱英文神曲磨耳朵？极速熟练 <span className="text-indigo-600 font-black">{currentCourse.sound}</span> 的发音。你可以开启页内伴学播放，边看单词字形边跟唱！
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3.5 w-full">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setInlineVideoPlaying(true);
                          }}
                          className="puffy-button bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11.5px] px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-sm active:translate-y-0.5 cursor-pointer border-b-[3px] border-indigo-800 active:border-b-0 transition-all font-sans"
                        >
                          <Play size={12} />
                          <span>🖥️ 页内展开播（推荐·边看边唱）</span>
                        </button>
                        <button
                          onClick={() => {
                            audio.playClick();
                            setShowVideoModal(getCourseVideoUrl(currentCourse.id));
                          }}
                          className="h-10 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-black text-[11.5px] px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-xs hover:border-indigo-300 transition-all cursor-pointer font-sans"
                        >
                          <span>🚀 弹窗大荧幕看</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phonics Words Grid cards (click to listen) */}
                <div className="space-y-4">
                  {/* 26英文字母魔法全拼音律声卡琴键 - Only for Lesson 1 (c1) */}
                  {currentCourse.id === 'c1' && (
                    <div className="bg-[#f0fdf4] border-2 border-emerald-200/60 p-4 rounded-3xl shadow-xs text-left space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <h4 className="text-[13.5px] font-black text-emerald-950 flex items-center gap-1.5 font-sans">
                          <span>🎹 26个英文字母魔法全拼音律声卡</span>
                          <span className="bg-emerald-200 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black">点击开声随身听</span>
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {ALPHABET_26.map((letterItem) => {
                          const charSpeakText = `${letterItem.char[0]}, ${letterItem.sound}`;
                          const isActiveSp = isSynthesizing === charSpeakText;
                          return (
                            <button
                              key={letterItem.char}
                              onClick={() => speakPhonics(charSpeakText)}
                              className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isActiveSp
                                  ? 'bg-amber-400 border-amber-600 text-emerald-950 scale-102 shadow-sm font-bold'
                                  : 'bg-white hover:bg-amber-50/50 border-slate-150 text-emerald-950 hover:border-amber-305'
                              }`}
                            >
                              <span className="text-xl select-none leading-none">{letterItem.icon}</span>
                              <span className="text-sm font-extrabold leading-none mt-1">{letterItem.char}</span>
                              <span className="text-[9.5px] font-black text-amber-800 mt-0.5">{letterItem.sound}</span>
                              <span className="text-[8.5px] text-slate-400 mt-0.5 truncate w-full text-center leading-none">{letterItem.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <h3 className="text-[13.5px] text-emerald-900 font-extrabold flex items-center gap-1.5 px-0.5 font-sans">
                    <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                    <span>魔法特训核心拼读卡 (点击随身听示范 & 解锁卡牌)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentCourse.items.map((item, idx) => {
                      const isMainWordTalking = isSynthesizing === item.word;
                      const hasLetterDetails = !!item.letterDetails;
                      return (
                        <div
                          key={`${item.word}-${idx}`}
                          className={`p-4 bg-white rounded-3xl border-2 transition-all flex flex-col gap-3.5 text-left h-full ${
                            hasLetterDetails ? 'md:col-span-2' : ''
                          } border-slate-200/80 shadow-xs`}
                        >
                          {/* 1. Letter & Phonics Rule Section at the very top (Featured only when letterDetails exists) */}
                          {item.letterDetails ? (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                speakPhonics(`${item.letterDetails!.letter[0]}, ${item.letterDetails!.sound}`);
                              }}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                                isSynthesizing === `${item.letterDetails.letter[0]}, ${item.letterDetails.sound}`
                                ? 'bg-amber-100 border-amber-400 shadow-sm'
                                : 'bg-amber-50/55 hover:bg-amber-100/35 border-amber-200/70'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                {/* Letter */}
                                <span className="text-[18px] font-black text-amber-950 bg-amber-400 px-3 py-1 rounded-xl select-none leading-none shrink-0 shadow-inner font-sans">
                                  {item.letterDetails.letter}
                                </span>
                                
                                {/* Rule text in 18px */}
                                <span className="text-[18px] font-black text-emerald-950 leading-snug">
                                  边上是 <span className="text-amber-955">{getPhonicsRulePhrase(item.letterDetails.letter, item.letterDetails.sound, item.letterDetails.charMnemonic)}</span>
                                </span>
                              </div>

                              <span className={`p-2 rounded-xl transition-all shrink-0 ${
                                isSynthesizing === `${item.letterDetails.letter[0]}, ${item.letterDetails.sound}`
                                ? 'bg-amber-400 text-white animate-bounce shadow' 
                                : 'bg-white border border-amber-300 text-amber-500 hover:bg-amber-105/50'
                              }`}>
                                <Volume2 size={18} />
                              </span>
                            </div>
                          ) : null}

                          {/* 2. Main item detail when NO letterDetails, or traditional display */}
                          {!hasLetterDetails && (
                            <div 
                              onClick={() => speakPhonics(item.word)}
                              className={`flex items-start justify-between gap-2.5 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all ${
                                isMainWordTalking ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <span className="text-3xl p-1.5 bg-slate-50 border border-slate-100 rounded-xl select-none shrink-0 shadow-inner">
                                  {item.emoji}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-[17px] sm:text-[19px] font-black text-emerald-950 flex items-baseline gap-1 leading-none">
                                    <span className="underline decoration-amber-400 decoration-3 underline-offset-3">
                                      {item.word}
                                    </span>
                                  </h4>
                                  <p className="text-[12.5px] font-extrabold text-emerald-700/80 leading-none mt-1.5">
                                    释义: {item.translation}
                                  </p>
                                </div>
                              </div>
                              <span className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500">
                                <Volume2 size={16} />
                              </span>
                            </div>
                          )}

                          {/* 3. Mnemonic Chants Section (Display below rule) */}
                          {item.mnemonicSentence && (
                            <div className="bg-[#f0fdf4]/60 border border-emerald-100/70 rounded-2xl p-3.5">
                              <p className="text-[12px] font-bold text-slate-650 leading-relaxed">
                                💡 拼读金句口诀: <span className="text-emerald-900 font-extrabold">{item.mnemonicSentence}</span>
                              </p>
                            </div>
                          )}

                          {/* 4. Handout Words section for letters Bb, Cc, Dd, etc. (下面是对应单词) */}
                          {hasLetterDetails && item.letterDetails && (
                            <div className="mt-1 space-y-2">
                              <p className="text-[12px] font-black text-emerald-950 flex items-center gap-1.5 px-0.5">
                                📖 讲义对应词单 (点击单词单独听拼读发音):
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {item.letterDetails.handoutWords.map((hw, innerIdx) => {
                                  const isHwSpeaking = isSynthesizing === hw.word;
                                  return (
                                    <button
                                      key={innerIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakPhonics(hw.word);
                                      }}
                                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs ${
                                        isHwSpeaking
                                        ? 'bg-amber-400 border-amber-600 text-emerald-950 scale-102 shadow font-bold'
                                        : 'bg-emerald-50/20 hover:bg-emerald-100/35 border-emerald-100/60 text-emerald-950 hover:border-emerald-300'
                                      }`}
                                    >
                                      <span className="text-[22px] select-none leading-none mb-1">{hw.emoji}</span>
                                      <span className="text-[13.5px] font-black underline decoration-2 decoration-teal-400 leading-none mt-1">{hw.word}</span>
                                      <span className="text-[10px] text-emerald-700 font-bold leading-none mt-1">({hw.translation})</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* 26英文字母魔法全拼音律声卡琴键 - Only for Lesson 1 (c1) */}
                  {currentCourse.id === 'c1' && (
                    <div className="bg-[#f0fdf4] border-2 border-emerald-200/60 p-4 rounded-3xl shadow-xs text-left space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <h4 className="text-[13.5px] font-black text-emerald-950 flex items-center gap-1.5 font-sans">
                          <span>🎹 26个英文字母魔法全拼音律声卡</span>
                          <span className="bg-emerald-200 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black">点击开声随身听</span>
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {ALPHABET_26.map((letterItem) => {
                          const charSpeakText = `${letterItem.char[0]}, ${letterItem.sound}`;
                          const isActiveSp = isSynthesizing === charSpeakText;
                          return (
                            <button
                              key={letterItem.char}
                              onClick={() => speakPhonics(charSpeakText)}
                              className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isActiveSp
                                ? 'bg-amber-400 border-amber-600 text-emerald-950 scale-102 shadow-sm font-bold'
                                : 'bg-white hover:bg-amber-50/50 border-slate-150 text-emerald-950 hover:border-amber-305'
                              }`}
                            >
                              <span className="text-xl select-none leading-none">{letterItem.icon}</span>
                              <span className="text-sm font-extrabold leading-none mt-1">{letterItem.char}</span>
                              <span className="text-[9.5px] font-black text-amber-800 mt-0.5">{letterItem.sound}</span>
                              <span className="text-[8.5px] text-slate-400 mt-0.5 truncate w-full text-center leading-none">{letterItem.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <h3 className="text-[13.5px] text-emerald-900 font-extrabold flex items-center gap-1.5 px-0.5 font-sans">
                    <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                    <span>魔法特训核心拼读卡 (点击随身听示范 & 解锁卡牌)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentCourse.items.map((item, idx) => {
                      const isMainWordTalking = isSynthesizing === item.word;
                      const hasLetterDetails = !!item.letterDetails;
                      return (
                        <div
                          key={`${item.word}-${idx}`}
                          className={`p-4 bg-white rounded-3xl border-2 transition-all flex flex-col gap-3.5 text-left h-full ${
                            hasLetterDetails ? 'md:col-span-2' : ''
                          } border-slate-200/80 shadow-xs`}
                        >
                          {/* 1. Letter & Phonics Rule Section at the very top (Featured only when letterDetails exists) */}
                          {item.letterDetails ? (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                speakPhonics(`${item.letterDetails!.letter[0]}, ${item.letterDetails!.sound}`);
                              }}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                                isSynthesizing === `${item.letterDetails.letter[0]}, ${item.letterDetails.sound}`
                                ? 'bg-amber-100 border-amber-400 shadow-sm'
                                : 'bg-amber-50/55 hover:bg-amber-100/35 border-amber-200/70'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                {/* Letter */}
                                <span className="text-[18px] font-black text-amber-950 bg-amber-400 px-3 py-1 rounded-xl select-none leading-none shrink-0 shadow-inner font-sans">
                                  {item.letterDetails.letter}
                                </span>
                                
                                {/* Rule text in 18px */}
                                <span className="text-[18px] font-black text-emerald-950 leading-snug font-sans">
                                  边上是 <span className="text-amber-950">{getPhonicsRulePhrase(item.letterDetails.letter, item.letterDetails.sound, item.letterDetails.charMnemonic)}</span>
                                </span>
                              </div>

                              <span className={`p-2 rounded-xl transition-all shrink-0 ${
                                isSynthesizing === `${item.letterDetails.letter[0]}, ${item.letterDetails.sound}`
                                ? 'bg-amber-400 text-white animate-bounce shadow' 
                                : 'bg-white border border-amber-300 text-amber-500 hover:bg-amber-100/50'
                              }`}>
                                <Volume2 size={18} />
                              </span>
                            </div>
                          ) : null}

                          {/* 2. Main item detail when NO letterDetails, or traditional display */}
                          {!hasLetterDetails && (
                            <div 
                              onClick={() => speakPhonics(item.word)}
                              className={`flex items-start justify-between gap-2.5 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all ${
                                isMainWordTalking ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <span className="text-3xl p-1.5 bg-slate-50 border border-slate-100 rounded-xl select-none shrink-0 shadow-inner">
                                  {item.emoji}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-[17px] sm:text-[19px] font-black text-emerald-950 flex items-baseline gap-1 leading-none font-sans">
                                    <span className="underline decoration-amber-400 decoration-3 underline-offset-3">
                                      {item.word}
                                    </span>
                                  </h4>
                                  <p className="text-[12.5px] font-extrabold text-emerald-700/80 leading-none mt-1.5 font-sans">
                                    释义: {item.translation}
                                  </p>
                                </div>
                              </div>
                              <span className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500">
                                <Volume2 size={16} />
                              </span>
                            </div>
                          )}

                          {/* 3. Mnemonic Chants Section (Display below rule) */}
                          {item.mnemonicSentence && (
                            <div className="bg-[#f0fdf4]/60 border border-emerald-100/70 rounded-2xl p-3.5">
                              <p className="text-[12px] font-bold text-slate-650 leading-relaxed font-sans">
                                💡 拼读金句口诀: <span className="text-emerald-900 font-extrabold">{item.mnemonicSentence}</span>
                              </p>
                            </div>
                          )}

                          {/* 4. Handout Words section for letters Bb, Cc, Dd, etc. (下面是对应单词) */}
                          {hasLetterDetails && item.letterDetails && (
                            <div className="mt-1 space-y-2">
                              <p className="text-[12px] font-black text-emerald-950 flex items-center gap-1.5 px-0.5 font-sans">
                                📖 讲义对应词单 (点击单词单独听拼读发音):
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {item.letterDetails.handoutWords.map((hw, innerIdx) => {
                                  const isHwSpeaking = isSynthesizing === hw.word;
                                  return (
                                    <button
                                      key={innerIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakPhonics(hw.word);
                                      }}
                                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs ${
                                        isHwSpeaking
                                        ? 'bg-amber-400 border-amber-600 text-emerald-950 scale-102 shadow font-bold'
                                        : 'bg-emerald-50/20 hover:bg-emerald-100/35 border-emerald-100/60 text-emerald-950 hover:border-emerald-300'
                                      }`}
                                    >
                                      <span className="text-[22px] select-none leading-none mb-1">{hw.emoji}</span>
                                      <span className="text-[13.5px] font-black underline decoration-2 decoration-teal-400 leading-none mt-1">{hw.word}</span>
                                      <span className="text-[10px] text-emerald-700 font-bold leading-none mt-1">({hw.translation})</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Training Start trigger Button banner */}
                <div className="pt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 p-0.5 rounded-2xl">
                  <button
                    onClick={startQuiz}
                    className="w-full py-4 bg-emerald-900 border border-emerald-800 text-white hover:scale-101 hover:brightness-105 active:scale-99 rounded-2xl cursor-pointer transition-all flex items-center justify-center space-x-2 text-base font-black shadow-lg"
                  >
                    <span>🛡️ 开启声音特训与试炼</span>
                    <span className="text-xs bg-emerald-700/90 text-yellow-400/90 border border-emerald-600/70 py-0.5 px-2 rounded-full font-black animate-pulse">
                      +20 经验 · 可赢 10 魔法币
                    </span>
                  </button>
                </div>

              </motion.div>
            )}

            {/* 2. DOJO ACTIVE QUIZ TRIAL MODE */}
            {dojoMode === 'QUIZ' && currentQuizQuestion && (
              <motion.div 
                key="quiz-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-emerald-950 border-4 border-amber-400 p-6 rounded-3xl shadow-2xl relative text-center space-y-6"
              >
                
                {/* Active Quiz steps and stats bar */}
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl select-none">🧙‍♂️</span>
                    <span className="text-[#a7f3d0] font-black text-sm uppercase tracking-widest">修炼场试炼进度: {quizStep + 1} / 5</span>
                  </div>
                  
                  {/* Visual Step indicators bar */}
                  <div className="flex space-x-1.5">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <span 
                        key={s} 
                        className={`w-3.5 h-3.5 rounded-full transition-all border ${
                          s < quizStep 
                            ? 'bg-amber-400 border-amber-600 shadow-sm' 
                            : s === quizStep 
                              ? 'bg-emerald-400 border-teal-200 scale-110 animate-pulse' 
                              : 'bg-emerald-900/60 border-emerald-800'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* QUESTION WRAPPER DISPLAY */}
                <div className="bg-emerald-990/60 p-4 border border-emerald-800/80 rounded-2xl space-y-4">
                  
                  {currentQuizQuestion.format === 0 ? (
                    /* Format 0: Spoken Audio listening task */
                    <div className="space-y-3.5 py-4">
                      <div className="inline-block p-4.5 bg-gradient-to-br from-amber-300 to-amber-500 text-emerald-950 rounded-full shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all" onClick={() => speakPhonics(currentQuizQuestion.correctWord)}>
                        <Volume2 size={38} className="animate-bounce" />
                      </div>
                      <p className="text-slate-200 text-[14px] font-black leading-none uppercase tracking-wider animate-pulse">
                        点击上方号角播放古兽发音，请凭声音选出对应单词：
                      </p>
                    </div>
                  ) : (
                    /* Format 1: Text mnemonic & blank puzzle format */
                    <div className="space-y-3 py-2 text-center flex flex-col items-center justify-center">
                      <span className="text-5.5xl p-2.5 bg-[#022c22] rounded-3xl border-2 border-emerald-600/40 shadow-inner select-none animate-wiggle">
                        {currentQuizQuestion.emoji}
                      </span>
                      <div>
                        <span className="bg-emerald-900 text-yellow-400 font-black border border-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full select-none">
                          拼读特训补缺缺音
                        </span>
                        <h4 className="text-white text-3xl font-black mt-2 tracking-widest leading-none">
                          {currentQuizQuestion.correctWord.replace(currentQuizQuestion.highlight, ' _ ')}
                        </h4>
                        <p className="text-emerald-350 text-[13.5px] font-bold mt-1.5 leading-none">
                          释义: {currentQuizQuestion.translation} (提示发音: {currentQuizQuestion.highlight})
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* MULTIPLE CHOICE GRID OPTIONS */}
                <div className="grid grid-cols-2 gap-3.5">
                  {currentQuizQuestion.options.map((option: string) => {
                    const isSelected = userSelectedAnswer === option;
                    let optionBtnStyle = "bg-emerald-900 border-emerald-700/60 text-slate-100 hover:border-emerald-500 hover:bg-emerald-800/80";
                    
                    if (isSelected) {
                      if (isAnswerCorrect) {
                        optionBtnStyle = "bg-emerald-500 border-emerald-400 text-emerald-950 font-black scale-102 shadow-md shadow-emerald-400/20";
                      } else {
                        optionBtnStyle = "bg-rose-500 border-rose-400 text-white font-black scale-102";
                      }
                    } else if (userSelectedAnswer !== null && option === currentQuizQuestion.correctValue) {
                      // Highlight the correct one if user got it wrong
                      optionBtnStyle = "bg-emerald-500/30 border-emerald-400 text-emerald-100 border-dashed animate-pulse font-black";
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={userSelectedAnswer !== null}
                        className={`w-full py-4 px-3 border-2 border-b-[5px] active:border-b-2 active:translate-y-0.5 text-center text-[16px] font-black rounded-2xl cursor-pointer shadow-sm transition-all flex items-center justify-center space-x-2 ${optionBtnStyle}`}
                      >
                        <span>{option}</span>
                        {isSelected && isAnswerCorrect && <Check size={16} className="stroke-[3]" />}
                        {isSelected && !isAnswerCorrect && <span className="text-sm">❌</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Instant validation status indicator */}
                <AnimatePresence>
                  {userSelectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-center font-black py-2 rounded-xl text-sm ${
                        isAnswerCorrect ? 'text-emerald-400 animate-pulse' : 'text-rose-400 animate-bounce'
                      }`}
                    >
                      {isAnswerCorrect ? '🎉 太棒了！回答正确，神识感应完美！' : '🙀 哦不，本音不和鸣，古兽有些落寞！'}
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* 3. DOJO COMPLETE SUCCESS SUMMARY REPORT CARD */}
            {dojoMode === 'SUCCESS' && (
              <motion.div 
                key="summary-mode"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="bg-gradient-to-b from-[#fffbeb] via-[#fffbeb] to-amber-50 rounded-3xl p-6.5 border-4 border-amber-400 shadow-2xl text-center space-y-6 max-w-xl mx-auto"
              >
                <div className="flex justify-center select-none">
                  <div className="relative">
                    <span className="text-7.5xl animate-bounce block">🏆</span>
                    <span className="absolute bottom-0 right-1 shrink-0 text-3xl">✨</span>
                  </div>
                </div>

                <div>
                  <span className="bg-amber-100 text-amber-850 px-3.5 py-1 rounded-full border border-amber-200 text-xs font-black select-none tracking-widest uppercase">
                    太古声音修炼试炼成功
                  </span>
                  <h2 className="text-3xl font-black text-emerald-950 mt-2.5 leading-snug">
                    神和鸣！自然发音通关
                  </h2>
                  <p className="text-emerald-800 font-extrabold text-[14px] mt-1 leading-snug">
                    你成功解锁了 <strong>{currentCourse.title}</strong> 课程魔法，本音纯正度极高。
                  </p>
                </div>

                {/* Rewards Panel item displays */}
                <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-inner flex items-center justify-around gap-4">
                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 font-black">试炼正确率</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{(quizScore / 5 * 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{quizScore} / 5 对</p>
                  </div>
                  
                  <div className="h-10 w-px bg-slate-200" />

                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 font-black">修炼经验值 XP</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">+{25 + quizScore * 5} ✨</p>
                    <p className="text-[10px] bg-amber-100 px-1 py-0.2 rounded font-extrabold text-amber-700 mt-0.5">点亮神力</p>
                  </div>
                  
                  <div className="h-10 w-px bg-slate-200" />

                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 font-black">奖励魔法币</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">+{10 + quizScore * 2} 🪙</p>
                    <p className="text-[10px] bg-[#6ee7b7]/20 px-1 py-0.2 rounded font-extrabold text-emerald-850 mt-0.5">存入钱阁</p>
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      audio.playClick();
                      setDojoMode('LEARN');
                    }}
                    className="w-full py-3.5 bg-white hover:bg-slate-50 border-2 border-slate-300 text-emerald-900 font-black text-[15px] rounded-2xl cursor-pointer shadow-sm transition-all"
                  >
                    🔄 再次特训
                  </button>
                  <button
                    onClick={() => {
                      audio.playClick();
                      onClose();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-500 text-white font-black text-[15px] rounded-2xl border-b-[5px] border-emerald-700 active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-md transition-all"
                  >
                    📜 凯旋出关
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* Floating Video Overlay Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border-4 border-indigo-400 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎬</span>
                  <span className="text-white font-black text-sm font-sans">{currentCourse.title} · 专属节奏特训视频</span>
                </div>
                <button 
                  onClick={() => setShowVideoModal(null)}
                  className="p-1 px-4 bg-[#f43f5e] hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer font-black text-xs border-b-[3px] border-rose-800 active:border-b-0 active:translate-y-[1px]"
                >
                  关闭
                </button>
              </div>

              {/* Video Wrapper */}
              <div className="relative pt-[56.25%] bg-black">
                {showVideoModal.endsWith('.mp4') ? (
                  <video 
                    src={showVideoModal}
                    controls 
                    autoPlay
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <iframe 
                    src={showVideoModal}
                    title={`${currentCourse.title} Video`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>

              {/* Tip footer */}
              <div className="p-3 bg-slate-950 text-[11px] text-slate-400 font-bold border-t border-slate-850 flex items-center justify-between font-sans">
                <span>💡 智者猫头鹰建议：磨耳朵跟读 3 遍，自然拼读神力大幅度觉醒！</span>
                <span className="text-indigo-450 font-black">倍速拼读学院 · 特训专属</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
