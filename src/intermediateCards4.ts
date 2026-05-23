import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'house': 'home',
    'mouse': 'mouse',
    'blouse': 't-shirt',
    'shoulder': 'muscle',
    'boulder': 'stone',
    'soup': 'soup',
    'group': 'group',
    'route': 'road',
    'double': 'twins',
    'trouble': 'sad',
    'cow': 'cow',
    'how': 'question-mark',
    'now': 'clock',
    'bow': 'respect',
    'row': 'line',
    'slow': 'turtle',
    'show': 'screen',
    'grow': 'seedling',
    'snow': 'snowflake',
    'blow': 'wind',
    'throw': 'basketball',
    'crow': 'bird',
    'yellow': 'color-wheel',
    'window': 'window',
    'shadow': 'ghost',
    'pillow': 'bed',
    'follow': 'footsteps',
    'hollow': 'hole',
    'flower': 'flower',
    'power': 'charger',
    'shower': 'shower',
    'boy': 'children',
    'toy': 'teddy-bear',
    'joy': 'happy',
    'coin': 'coin',
    'sauce': 'sauce',
    'autumn': 'autumn',
    'audience': 'stadium',
    'saw': 'saw',
    'draw': 'pencil',
    'law': 'scale',
    'straw': 'straw',
    'hawk': 'bird',
    'yawn': 'sleepy',
    'crawl': 'baby',
    'oil': 'gas-station',
    'boil': 'hot',
    'soil': 'earth',
    'spoil': 'garbage',
    'join': 'group',
    'noise': 'volume',
    'voice': 'microphone',
    'choice': 'hand',
    'ball': 'tennis',
    'call': 'phone',
    'fall': 'autumn',
    'tall': 'ruler',
    'wall': 'structure',
    'hall': 'castle',
    'small': 'microscope',
    'walk': 'road',
    'talk': 'microphone',
    'chalk': 'pencil',
    'stalk': 'seedling',
    'shark': 'shark',
    'bark': 'dog',
    'dark': 'moon',
    'park': 'park',
    'mark': 'pen',
    'spark': 'sparkles',
    'play_ay': 'tennis',
    'day_ay': 'sun',
    'clay_ay': 'pottery'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Raw content representing the textbook pages 329 to 650
const RAW_TEXTBOOK_PAGES_4: [string, string[], string][] = [
  // 329
  ['ou', ['house', '房子', 'mouse', '老鼠', 'blouse', '女衬衫'], '跑出 house（房子），撞见 mouse（老鼠），咬破 blouse（女衫）'],
  // 330
  ['ou', ['shoulder', '肩膀', 'boulder', '大圆石'], '揉揉 shoulder（肩膀），爬上 boulder（巨石）'],
  // 331
  ['ou', ['soup', '汤', 'group', '组', 'route', '路线'], '喝碗 soup（汤），跟着 group（队伍），选定 route（路线）'],
  // 332
  ['ou', ['touch', '碰', 'double', '双倍', 'trouble', '麻烦'], '轻轻 touch（摸），代价 double（双倍），带来 trouble（麻烦）'],
  // 333
  ['ow', ['cow', '母牛', 'how', '如何', 'now', '现在'], '看到 cow（母牛），别问 how（如何），快跑 now（现在）'],
  // 334
  ['ow', ['bow', '鞠躬', 'row', '一排', 'slow', '慢的'], '弯腰 bow（鞠躬），站在 row（一排），动作 slow（缓慢）'],
  // 335
  ['ow', ['show', '展览', 'grow', '生长', 'snow', '雪'], '精彩 show（展示），花儿 grow（成长），漫天 snow（下雪）'],
  // 336
  ['ow', ['blow', '刮', 'throw', '扔', 'crow', '乌鸦'], '大风 blow（吹拂），石头 throw（扔），吓走 crow（乌鸦）'],
  // 337
  ['ow', ['yellow', '黄色的', 'window', '窗户', 'shadow', '影子'], '穿着 yellow（黄色），打开 window（窗户），看见 shadow（影子）'],
  // 338
  ['ow', ['pillow', '枕头', 'follow', '跟随', 'hollow', '空心的'], '靠着 pillow（枕头），眼神 follow（紧随），木头 hollow（空心）'],
  // 339
  ['ow', ['flower', '花', 'power', '力量', 'shower', '阵雨'], '采朵 flower（鲜花），全身 power（力量），洗个 shower（淋浴）'],
  // 340
  ['oy', ['boy', '男孩', 'toy', '玩具', 'joy', '欢乐'], '那个 boy（男孩），买个 toy（玩具），满脸 joy（欢乐）'],
  // 341
  ['au', ['sauce', '酱汁', 'autumn', '秋天', 'audience', '观众'], '蘸点 sauce（酱汁），正值 autumn（秋天），面对 audience（观众）'],
  // 342
  ['aw', ['saw', '看见', 'draw', '画画', 'law', '法律'], '亲眼 saw（看见），正在 draw（画画），遵守 law（法律）'],
  // 343
  ['aw', ['straw', '稻草', 'hawk', '鹰', 'yawn', '打哈欠'], '坐在 straw（稻草），看着 hawk（苍鹰），睡意 yawn（打哈欠）'],
  // 344
  ['aw', ['crawl', '爬行', 'draw', '画'], '婴儿 crawl（爬行），在地上 draw（画画）'],
  // 345
  ['oi', ['oil', '汽油', 'boil', '沸腾', 'soil', '泥土'], '加点 oil（油），开水 boil（烧开），种在 soil（泥土）'],
  // 346
  ['oi', ['spoil', '宠坏', 'join', '加入'], '不要 spoil（溺爱），快来 join（加入）'],
  // 347
  ['oi', ['noise', '噪音', 'voice', '说话声', 'choice', '抉择'], '忍受 noise（杂音），优美 voice（歌声），明智 choice（选择）'],
  // 348
  ['all', ['ball', '球', 'call', '打电话', 'fall', '坠落'], '玩玩 ball（皮球），给妈 call（电话），落叶 fall（落下）'],
  // 349
  ['all', ['tall', '高大的', 'wall', '墙壁', 'hall', '走廊'], '个子 tall（高大），靠着 wall（墙壁），走过 hall（过道）'],
  // 350
  ['all', ['small', '细小的', 'wall', '城墙'], '非常 small（微小），爬上 wall（城墙）'],
  // 351
  ['alk', ['walk', '步行', 'talk', '交谈', 'chalk', '粉笔'], '出门 walk（漫步），高声 talk（聊天），拿着 chalk（粉笔）'],
  // 352
  ['alk', ['stalk', '茎', 'walk', '散步'], '踩到 stalk（小草茎），慢慢 walk（去散步）'],
  // 353
  ['ark', ['shark', '鲨鱼', 'bark', '狗吠', 'dark', '黑暗'], '遇到 shark（鲨鱼），小狗 bark（吼叫），天色 dark（昏暗）'],
  // 354
  ['ark', ['park', '公园', 'mark', '分数', 'spark', '火花'], '来到 park（公园），拿到 mark（满分），闪耀 spark（火花）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART4: WordCard[] = RAW_TEXTBOOK_PAGES_4.map((page, index) => {
  const pageNum = index + 329; // Continues from 329
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
