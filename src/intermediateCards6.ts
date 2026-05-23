import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'black': 'black',
    'block': 'cube',
    'blow': 'wind',
    'clip': 'paperclip',
    'clock': 'clock',
    'cloud': 'cloud',
    'flag': 'flag',
    'flat': 'apartment',
    'fly': 'insect',
    'glass': 'glass',
    'glad': 'happy',
    'globe': 'globe',
    'play': 'tennis',
    'plan': 'todo-list',
    'plum': 'fruit',
    'slide': 'playground-slide',
    'slow': 'turtle',
    'sleep': 'bed',
    'brain': 'brain',
    'brick': 'building',
    'brown': 'color-wheel',
    'crab': 'crab',
    'cry': 'crying',
    'crown': 'queen',
    'drop': 'droplets',
    'drum': 'drums',
    'draw': 'pencil',
    'frog': 'frog',
    'free': 'cage',
    'front': 'door',
    'grass': 'grass',
    'grow': 'seedling',
    'grape': 'grapes',
    'press': 'weight',
    'prize': 'trophy',
    'proud': 'medal',
    'tree': 'tree',
    'train': 'train',
    'truck': 'truck',
    'duck': 'duck',
    'pack': 'backpack',
    'lock': 'padlock',
    'ring': 'ring',
    'sing': 'singing',
    'king': 'king',
    'bank': 'bank',
    'pink': 'color-wheel',
    'sink': 'bathroom',
    'hand': 'hand',
    'sand': 'beach',
    'wind': 'wind',
    'tent': 'tent',
    'dent': 'tooth',
    'spent': 'money',
    'jump': 'runner',
    'camp': 'tent',
    'pump': 'gas-station',
    'gift': 'gift',
    'lift': 'elevator',
    'soft': 'feather',
    'best': 'medal',
    'nest': 'bird',
    'vest': 't-shirt'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Raw content representing the textbook pages 385 to 650
const RAW_TEXTBOOK_PAGES_6: [string, string[], string][] = [
  // 385
  ['bl', ['black', '黑色的', 'block', '方块', 'blow', '吹拂'], '穿着 black（黑色），抱着 block（积木），大风 blow（吹风）'],
  // 386
  ['cl', ['clip', '回形针', 'clock', '钟表', 'cloud', '白云'], '拿着 clip（别针），看着 clock（时钟），望着 cloud（白云）'],
  // 387
  ['fl', ['flag', '旗帜', 'flat', '平的', 'fly', '飞'], '升起 flag（红旗），地面 flat（平坦），小鸟 fly（飞翔）'],
  // 388
  ['gl', ['glass', '玻璃杯', 'glad', '高兴的', 'globe', '地球仪'], '端起 glass（玻璃杯），感到 glad（高兴），看着 globe（地球仪）'],
  // 389
  ['pl', ['play', '玩耍', 'plan', '计划', 'plum', '李子'], '尽情 play（玩耍），制定 plan（计划），吃个 plum（李子）'],
  // 390
  ['sl', ['slide', '滑梯', 'slow', '慢的', 'sleep', '睡觉'], '滑下 slide（滑梯），动作 slow（缓慢），想要 sleep（睡觉）'],
  // 391
  ['br', ['brain', '大脑', 'brick', '砖头', 'brown', '褐色的'], '动动 brain（大脑），搬着 brick（砖头），颜色 brown（褐色）'],
  // 392
  ['cr', ['crab', '螃蟹', 'cry', '哭泣', 'crown', '皇冠'], '牵着 crab（螃蟹），突然 cry（哭泣），戴上 crown（皇冠）'],
  // 393
  ['dr', ['drop', '掉落', 'drum', '打鼓', 'draw', '画画'], '雨滴 drop（落下），用力 drum（击鼓），认真 draw（画画）'],
  // 394
  ['fr', ['frog', '青蛙', 'free', '自由的', 'front', '前方'], '惊醒 frog（青蛙），向往 free（自由），蹦向 front（前方）'],
  // 395
  ['gr', ['grass', '草地', 'grow', '生长', 'grape', '葡萄'], '躺在 grass（草地），看花 grow（成长），剥开 grape（葡萄）'],
  // 396
  ['pr', ['press', '按压', 'prize', '奖品', 'proud', '骄傲的'], '用力 press（按压），赢得 prize（大奖），父母 proud（骄傲）'],
  // 397
  ['tr', ['tree', '树', 'train', '火车', 'truck', '卡车'], '爬上 treeSize（树上），坐上 train（火车），看着 truck（卡车）'],
  // 398
  ['ck', ['duck', '鸭子', 'pack', '打包', 'lock', '锁'], '追着 duck（鸭子），背上 pack（背包），锁好 lock（锁子）'],
  // 399
  ['ng', ['ring', '戒指', 'sing', '唱歌', 'king', '国王'], '戴上 ring（戒指），轻轻 sing（唱歌），拜见 king（国王）'],
  // 400
  ['nk', ['bank', '银行', 'pink', '粉色的', 'sink', '水槽'], '去往 bank（银行），拿着 pink（粉色纸），放在 sink（水槽）'],
  // 401
  ['nd', ['hand', '手', 'sand', '沙子', 'wind', '风'], '张开 hand（双手），捧起 sand（沙子），吹着 wind（风儿）'],
  // 402
  ['nt', ['tent', '帐篷', 'dent', '凹痕', 'spent', '花费'], '搭好 tent（帐篷），砸出 dent（凹痕），钱已 spent（花光）'],
  // 403
  ['mp', ['jump', '跳跃', 'camp', '露营', 'pump', '抽水机'], '高高 jump（跳跃），去往 camp（露营），开动 pump（泵机）'],
  // 404
  ['ft', ['gift', '礼物', 'lift', '电梯', 'soft', '柔软的'], '收到 gift（礼物），走进 lift（电梯），沙发 soft（柔软）'],
  // 405
  ['st', ['best', '最好的', 'nest', '鸟巢', 'vest', '背心'], '做的 best（最棒），看着 nest（鸟窝），穿着 vest（马甲）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART6: WordCard[] = RAW_TEXTBOOK_PAGES_6.map((page, index) => {
  const pageNum = index + 385; // Continues from 385
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

  return {
    id: `int_${pageNum}`,
    suffix: page[0],
    levelName: `中级 课时 ${pageNum}`,
    words: wordsList,
    rhyme: page[2],
    learned: false,
    difficulty: 'INTERMEDIATE'
  };
});
