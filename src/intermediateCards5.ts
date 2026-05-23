import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'barn': 'home',
    'yarn': 'wool',
    'harp': 'harp',
    'sharp': 'knife',
    'art': 'easel',
    'cart': 'handcart',
    'part': 'puzzle',
    'dart': 'dartboard',
    'smart': 'glasses',
    'start': 'play',
    'star': 'star',
    'far': 'road',
    'car': 'car',
    'bar': 'wooden-bar',
    'jar': 'pot',
    'scar': 'headache',
    'lord': 'king',
    'cord': 'usb',
    'sword': 'sword',
    'fork': 'fork',
    'pork': 'ham',
    'cork': 'wine',
    'storm': 'cloud-with-rain',
    'worm': 'worm',
    'form': 'file',
    'corn': 'corn',
    'horn': 'horn',
    'born': 'baby',
    'port': 'lighthouse',
    'fort': 'castle',
    'short': 't-shirt',
    'sport': 'tennis',
    'sort': 'list',
    'resort': 'beach',
    'for': 'gift',
    'herb': 'potion',
    'verb': 'pen',
    'herd': 'cow',
    'nerd': 'glasses',
    'term': 'calendar',
    'germ': 'virus',
    'fern': 'leaf',
    'stern': 'angry',
    'govern': 'castle',
    'paper': 'file',
    'tiger': 'tiger',
    'water': 'water',
    'flower': 'flower',
    'butter': 'cheese',
    'singer': 'singing',
    'spider': 'spider',
    'ruler': 'ruler',
    'silver': 'coin',
    'bird': 'bird',
    'third': 'medal',
    'smirk': 'happy',
    'quirk': 'sparkles',
    'girl': 'female-profile',
    'swirl': 'spiral',
    'shirt': 't-shirt',
    'dirt': 'earth',
    'skirt': 'skirt',
    'sir': 'man',
    'stir': 'spoon',
    'fir': 'pine',
    'burn': 'fire',
    'turn': 'repeat',
    'return': 'exit',
    'urn': 'pot',
    'mourn': 'crying',
    'slurp': 'hot',
    'burp': 'cough',
    'hurt': 'headache',
    'spurt': 'water',
    'yogurt': 'cheese',
    'fur': 'wool',
    'spur': 'boots',
    'blur': 'eyeglasses'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Raw content representing the textbook pages 355 to 600
const RAW_TEXTBOOK_PAGES_5: [string, string[], string][] = [
  // 355
  ['arn', ['barn', '谷仓', 'yarn', '毛线'], '走到 barn（谷仓），织个 yarn（毛线）'],
  // 356
  ['arp', ['harp', '竖琴', 'sharp', '锋利的'], '弹起 harp（竖琴），刀子 sharp（锋利）'],
  // 357
  ['art', ['art', '艺术', 'cart', '手推车', 'part', '部分'], '爱好 art（艺术），推着 cart（手推车），它是 part（一部分）'],
  // 358
  ['art', ['dart', '飞镖', 'smart', '聪明的', 'start', '开始'], '投个 dart（飞镖），孩子 smart（聪明），我们 start（开始）'],
  // 359
  ['ar', ['star', '星星', 'far', '遥远的', 'car', '汽车'], '看着 star（星星），路途 far（遥远），开起 car（小车）'],
  // 360
  ['ar', ['bar', '栏杆', 'jar', '罐子', 'scar', '疤痕'], '翻过 bar（栏杆），打碎 jar（罐子），留下 scar（疤痕）'],
  // 361
  ['ord', ['lord', '领主', 'cord', '绳索', 'sword', '宝剑'], '拜见 lord（领主），系上 cord（绳扣），手拿 sword（宝剑）'],
  // 362
  ['ork', ['fork', '叉子', 'pork', '猪肉', 'cork', '软木塞'], '拿着 fork（钢叉），吃着 pork（猪肉），拔掉 cork（瓶塞）'],
  // 363
  ['orm', ['storm', '暴风雨', 'worm', '虫子', 'form', '表格'], '迎来 storm（风暴），看见 worm（蠕虫），填好 form（表格）'],
  // 364
  ['orn', ['corn', '玉米', 'horn', '号角', 'born', '出生'], '吃着 corn（玉米），吹响 horn（号角），婴儿 born（降生）'],
  // 365
  ['ort', ['port', '港口', 'fort', '堡垒', 'short', '矮的'], '停靠 port（港口），修建 fort（堡垒），个子 short（矮小）'],
  // 366
  ['ort', ['sport', '运动', 'sort', '分类', 'resort', '胜地'], '热爱 sport（运动），卡片 sort（分类），来到 resort（胜地）'],
  // 367
  ['or', ['for', '为了'], '一切 for（为了学习）'],
  // 368
  ['erb', ['herb', '草药', 'verb', '动词'], '研制 herb（草药），这是一个 verb（动词）'],
  // 369
  ['erd', ['herd', '牧群', 'nerd', '书呆子'], '赶着 herd（兽群），笑话 nerd（书呆子）'],
  // 370
  ['erm', ['term', '学期', 'germ', '细菌'], '在新 term（学期），消灭 germ（细菌）'],
  // 371
  ['ern', ['fern', '蕨类', 'stern', '严厉的', 'govern', '治国'], '采摘 fern（蕨草），脸色 stern（严肃），开始 govern（治理）'],
  // 372
  ['er', ['paper', '纸张', 'tiger', '老虎', 'water', '水'], '拿张 paper（纸张），画只 tiger（老虎），喝杯 water（白水）'],
  // 373
  ['er', ['flower', '鲜花', 'butter', '黄油', 'singer', '歌手'], '采朵 flower（鲜花），抹点 butter（黄油），听听 singer（歌手）'],
  // 374
  ['er', ['spider', '蜘蛛', 'ruler', '尺子', 'silver', '白银'], '发现 spider（蜘蛛），拿着 ruler（尺子），砸烂 silver（银子）'],
  // 375
  ['ird', ['bird', '鸟', 'third', '第三名'], '那只 bird（小鸟），荣获 third（第三）'],
  // 376
  ['irk', ['smirk', '假笑', 'quirk', '怪癖'], '偷偷 smirk（傻笑），有着 quirk（癖好）'],
  // 377
  ['irl', ['girl', '女孩', 'swirl', '盘绕'], '那个 girl（女孩），裙摆 swirl（旋转）'],
  // 378
  ['irt', ['shirt', '衬衫', 'dirt', '泥土', 'skirt', '半身裙'], '脏了 shirt（衬衫），沾上 dirt（泥土），换条 skirt（长裙）'],
  // 379
  ['ir', ['sir', '先生', 'stir', '搅拌', 'fir', '冷杉树'], '听从 sir（长官），用手 stir（搅拌），依靠 fir（冷杉）'],
  // 380
  ['urn', ['burn', '燃烧', 'turn', '转弯', 'return', '返回'], '火苗 burn（燃烧），前方 turn（转弯），顺利 return（回家）'],
  // 381
  ['urn', ['urn', '骨灰瓮', 'mourn', '哀悼'], '面对 urn（瓮罐），深切 mourn（悼念）'],
  // 382
  ['urp', ['slurp', '啜食', 'burp', '打嗝'], '大口 slurp（喝水），吃饱 burp（打嗝）'],
  // 383
  ['urt', ['hurt', '受伤', 'spurt', '喷射', 'yogurt', '酸奶'], '没有 hurt（受伤），水流 spurt（喷出），喝口 yogurt（酸奶）'],
  // 384
  ['ur', ['fur', '皮毛', 'spur', '马刺', 'blur', '模糊的'], '柔软 fur（皮毛），踩着 spur（马刺），视线 blur（模糊）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART5: WordCard[] = RAW_TEXTBOOK_PAGES_5.map((page, index) => {
  const pageNum = index + 355; // Continues from 355
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
