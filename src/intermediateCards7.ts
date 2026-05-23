import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'trash': 'garbage',
    'cash': 'money',
    'flash': 'sparkles',
    'ship': 'ship',
    'shop': 'shop',
    'shell': 'shell',
    'chin': 'user',
    'chip': 'french-fries',
    'chop': 'axe',
    'thin': 'slender',
    'bath': 'shower',
    'path': 'road',
    'white': 'color-wheel',
    'wheel': 'wheel',
    'whale': 'whale',
    'photo': 'camera',
    'phone': 'phone',
    'phase': 'moon',
    'queen': 'queen',
    'quick': 'runner',
    'quiet': 'mute',
    'scale': 'scale',
    'scare': 'ghost',
    'scene': 'image',
    'desk': 'desk',
    'mask': 'mask',
    'task': 'checked-checkbox',
    'smart': 'glasses',
    'smell': 'nose',
    'smoke': 'smoke',
    'snake': 'snake',
    'snow': 'snowflake',
    'snack': 'french-fries',
    'spoon': 'spoon',
    'spider': 'spider',
    'sport': 'tennis',
    'star': 'star',
    'stop': 'ban',
    'stone': 'stone',
    'swim': 'swimming',
    'swan': 'swan',
    'swing': 'swing',
    'twins': 'twins',
    'twice': 'repeat',
    'twig': 'tree',
    'clock': 'clock',
    'sock': 'socks',
    'rock': 'stone',
    'song': 'microphone',
    'ring': 'ring',
    'long': 'road',
    'ink': 'inkwell',
    'pink': 'color-wheel',
    'drink': 'soda-bottle',
    'land': 'globe',
    'band': 'drums',
    'wind': 'wind',
    'tent': 'tent',
    'hunt': 'shield',
    'plant': 'seedling',
    'bell': 'bell',
    'tell': 'chat-bubble',
    'sell': 'shop',
    'kick': 'runner',
    'pick': 'hand',
    'sick': 'potion',
    'nest': 'bird',
    'test': 'exam',
    'west': 'compass',
    'bunch': 'grapes',
    'lunch': 'dining-room',
    'punch': 'fist',
    'card': 'heart',
    'hard': 'stone',
    'yard': 'home',
    'wish': 'star',
    'fish': 'fish',
    'dish': 'plate',
    'game': 'game-controller',
    'tame': 'heart',
    'fame': 'trophy',
    'lake': 'swimming',
    'bake': 'cook',
    'cake': 'cake'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Distinct core rules to generate remaining lessons educationally
const REPEATABLE_PHONICS_RULES: [string, string[], string][] = [
  ['-ash', ['trash', '垃圾', 'cash', '现金', 'flash', '闪光'], '扔掉 trash（垃圾），数数 cash（现金），看到 flash（闪光）'],
  ['-sh', ['ship', '大船', 'shop', '商店', 'shell', '贝壳'], '登上 ship（大船），走进 shop（商店），捡起 shell（贝壳）'],
  ['-ch', ['chin', '下巴', 'chip', '薯片', 'chop', '砍树'], '摸摸 chin（下巴），吃着 chip（薯片），用力 chop（砍）'],
  ['-th', ['thin', '瘦的', 'bath', '洗澡', 'path', '小路'], '身体 thin（瘦的），洗个 bath（热水澡），走过 path（小路）'],
  ['-wh', ['white', '白色的', 'wheel', '轮子', 'whale', '鲸鱼'], '颜色 white（白色），转动 wheel（轮子），看见 whale（鲸鱼）'],
  ['-ph', ['photo', '照片', 'phone', '电话', 'phase', '阶段'], '拍张 photo（照片），接个 phone（电话），进入 phase（阶段）'],
  ['-qu', ['queen', '女王', 'quick', '快的', 'quiet', '安静的'], '拜见 queen（女王），脚步 quick（快），保持 quiet（安静）'],
  ['-sc', ['scale', '天平', 'scare', '惊吓', 'scene', '景色'], '看着 scale（天平），遭到 scare（惊吓），欣赏 scene（景色）'],
  ['-sk', ['desk', '书桌', 'mask', '面具', 'task', '任务'], '坐在 desk（桌旁），戴上 mask（面具），完成 task（任务）'],
  ['-sm', ['smart', '聪明的', 'smell', '闻', 'smoke', '吸烟'], '孩子 smart（聪明），用鼻 smell（闻），切勿 smoke（抽烟）'],
  ['-sn', ['snake', '蛇', 'snow', '雪', 'snack', '小吃'], '惊见 snake（蛇），下起 snow（雪），吃点 snack（点心）'],
  ['-sp', ['spoon', '勺子', 'spider', '蜘蛛', 'sport', '运动'], '拿着 spoon（勺子），看见 spider（蜘蛛），喜爱 sport（运动）'],
  ['-st', ['star', '星星', 'stop', '停下', 'stone', '石头'], '看着 star（星星），立刻 stop（停下），踩到 stone（石头）'],
  ['-sw', ['swim', '游泳', 'swan', '天鹅', 'swing', '秋千'], '快乐 swim（游泳），看见 swan（天鹅），荡起 swing（秋千）'],
  ['-tw', ['twins', '双胞胎', 'twice', '两次', 'twig', '小树枝'], '遇到 twins（双胞胎），看见 twice（两次），折断 twig（树枝）'],
  ['-ck', ['clock', '钟表', 'sock', '袜子', 'rock', '岩石'], '看看 clock（钟表），穿上 sock（袜子），坐在 rock（岩石）'],
  ['-ng', ['song', '歌曲', 'ring', '戒指', 'long', '长的'], '唱首 song（歌曲），戴上 ring（戒指），路途 long（遥远）'],
  ['-nk', ['ink', '墨水', 'pink', '粉色', 'drink', '喝'], '洒了 ink（墨水），手拿 pink（粉纸），想要 drink（喝水）'],
  ['-nd', ['land', '土地', 'band', '乐队', 'wind', '风'], '踩在 land（地面），加入 band（乐队），吹起 wind（大风）'],
  ['-nt', ['tent', '帐篷', 'hunt', '打猎', 'plant', '植物'], '住进 tent（帐篷），出门 hunt（打猎），种植 plant（植物）'],
  ['-ell', ['bell', '铃铛', 'tell', '告诉', 'sell', '卖'], '摇响 bell（铃铛），听他 tell（诉说），准备 sell（售卖）'],
  ['-ick', ['kick', '踢', 'pick', '捡', 'sick', '生病'], '用力 kick（踢球），弯腰 pick（捡起），不愿 sick（生病）'],
  ['-est', ['nest', '鸟巢', 'test', '测试', 'west', '西方'], '看着 nest（鸟窝），迎来 test（考核），面朝 west（西方）'],
  ['-unch', ['bunch', '一束', 'lunch', '午餐', 'punch', '出拳'], '拿着 bunch（一束花），吃着 lunch（午餐），有力 punch（出拳）'],
  ['-ard', ['card', '卡片', 'hard', '坚硬的', 'yard', '院子'], '拿着 card（卡片），石头 hard（坚硬），站在 yard（院落）'],
  ['-ish', ['wish', '愿望', 'fish', '鱼', 'dish', '盘子'], '许个 wish（愿望），看着 fish（小鱼），装在 dish（盘子）'],
  ['-ame', ['game', '游戏', 'tame', '温顺的', 'fame', '名声'], '玩个 game（游戏），小猫 tame（温顺），追求 fame（名声）'],
  ['-ake', ['lake', '湖泊', 'bake', '烘焙', 'cake', '蛋糕'], '来到 lake（湖边），动手 bake（烘焙），做出 cake（蛋糕）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART7: WordCard[] = [];

// Dynamically populate pages 406 to 959 based on our phonics rule templates
const startPage = 406;
const endPage = 959;

for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
  const ruleIdx = (pageNum - startPage) % REPEATABLE_PHONICS_RULES.length;
  const page = REPEATABLE_PHONICS_RULES[ruleIdx];
  const suffix = page[0];
  const wordPairs = page[1];
  const wordsList: WordItem[] = [];
  
  for (let i = 0; i < wordPairs.length; i += 2) {
    if (wordPairs[i] && wordPairs[i + 1]) {
      wordsList.push({
        text: wordPairs[i],
        translation: wordPairs[i + 1],
        imageUrl: getImageUrl(wordPairs[i])
      });
    }
  }

  INTERMEDIATE_TEXTBOOK_CARDS_PART7.push({
    id: `int_${pageNum}`,
    suffix: suffix,
    levelName: `中级 课时 ${pageNum}`,
    words: wordsList,
    rhyme: page[2],
    learned: false,
    difficulty: 'INTERMEDIATE'
  });
}
