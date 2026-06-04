import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'loaf': 'bread',
    'oak': 'tree',
    'soak': 'swimming',
    'coal': 'coal',
    'goal': 'target',
    'foam': 'bubbles',
    'roam': 'globe',
    'moan': 'crying',
    'loan': 'money',
    'soap': 'soap',
    'roar': 'lion',
    'soar': 'airplane',
    'coast': 'beach',
    'toast': 'toast',
    'boast': 'speaker',
    'boat': 'boat',
    'coat': 't-shirt',
    'float': 'swimming',
    'toe': 'foot',
    'hoe': 'tools',
    'foe': 'angry',
    'oil': 'gas-station',
    'coil': 'spring',
    'boil': 'hot',
    'coin': 'coin',
    'point': 'pointing',
    'joint': 'skeleton',
    'soil': 'soil',
    'join': 'handshake',
    'noise': 'volume',
    'poise': 'happy',
    'voice': 'microphone',
    'choice': 'checkmark',
    'exploit': 'sword',
    'adroit': 'smart',
    'moon': 'moon',
    'spoon': 'spoon',
    'noon': 'sun',
    'wood': 'wood',
    'stood': 'man',
    'hood': 'hood',
    'roof': 'home',
    'proof': 'checkmark',
    'book': 'book',
    'look': 'eye',
    'cook': 'cook',
    'cool': 'ice',
    'pool': 'swimming',
    'tool': 'tools',
    'room': 'home',
    'bloom': 'flower',
    'gloom': 'crying',
    'hoop': 'basketball',
    'loop': 'repeat',
    'soup': 'soup',
    'door': 'door',
    'floor': 'surface',
    'poor': 'lonely',
    'goose': 'goose',
    'loose': 'rope',
    'choose': 'checkmark',
    'foot': 'foot',
    'shoot': 'target',
    'boot': 'boot',
    'tooth': 'teeth',
    'booth': 'home',
    'mouth': 'mouth',
    'south': 'compass',
    'youth': 'happy',
    'cloud': 'cloud',
    'loud': 'volume',
    'proud': 'medal',
    'touch': 'hand',
    'ouch': 'crying',
    'couch': 'chair',
    'ground': 'surface',
    'round': 'shape',
    'found': 'magnifying-glass',
    'house': 'home',
    'mouse': 'mouse',
    'blouse': 't-shirt',
    'shoulder': 'body',
    'boulder': 'stone',
    'group': 'friend',
    'route': 'road',
    'double': 'repeat',
    'trouble': 'crying',
    'cow': 'cow',
    'how': 'question-mark',
    'now': 'clock',
    'bow': 'respect',
    'row': 'line',
    'slow': 'turtle',
    'show': 'tv',
    'grow': 'sprout',
    'snow': 'snowflake',
    'blow': 'wind',
    'throw': 'hand',
    'crow': 'bird',
    'yellow': 'color-wheel',
    'window': 'window',
    'shadow': 'ghost',
    'pillow': 'bed',
    'follow': 'right-arrow',
    'hollow': 'tree',
    'flower': 'flower',
    'power': 'bolt',
    'shower': 'shower',
    'boy': 'user',
    'toy': 'lego',
    'joy': 'happy',
    'sauce': 'sauce',
    'autumn': 'leaf',
    'audience': 'crowd',
    'saw': 'eye',
    'draw': 'pen',
    'law': 'shield',
    'straw': 'grass',
    'hawk': 'bird',
    'yawn': 'sleepy',
    'crawl': 'baby',
    'spoil': 'broken-heart',
    'ball': 'ball',
    'call': 'phone',
    'fall': 'leaf',
    'tall': 'expand',
    'wall': 'wall',
    'hall': 'corridor',
    'small': 'minimize',
    'walk': 'walk',
    'talk': 'chat-bubble',
    'chalk': 'pen',
    'stalk': 'plant',
    'shark': 'shark',
    'bark': 'dog',
    'dark': 'moon',
    'park': 'park',
    'mark': 'grade',
    'spark': 'sparkles',
    'barn': 'home',
    'yarn': 'ball-of-yarn',
    'harp': 'music',
    'sharp': 'knife',
    'art': 'palette',
    'cart': 'shopping-cart',
    'part': 'puzzle',
    'dart': 'target',
    'smart': 'bulb',
    'start': 'play',
    'star': 'star',
    'far': 'road',
    'car': 'car',
    'bar': 'beer',
    'jar': 'jar',
    'scar': 'heart',
    'lord': 'crown',
    'cord': 'wire',
    'sword': 'sword',
    'fork': 'fork',
    'pork': 'meat',
    'cork': 'wine',
    'storm': 'cloud-with-lightning',
    'worm': 'bug',
    'form': 'file',
    'corn': 'corn',
    'horn': 'horn',
    'born': 'baby',
    'port': 'anchor',
    'fort': 'castle',
    'short': 'minimize',
    'sport': 'tennis',
    'sort': 'filter',
    'resort': 'island',
    'for': 'heart',
    'herb': 'potion',
    'verb': 'pen',
    'herd': 'cow',
    'nerd': 'glasses',
    'term': 'calendar',
    'germ': 'virus',
    'fern': 'plant',
    'stern': 'man',
    'govern': 'shield',
    'paper': 'file',
    'tiger': 'tiger',
    'water': 'water',
    'butter': 'butter',
    'singer': 'microphone',
    'spider': 'spider',
    'ruler': 'ruler',
    'silver': 'silver-halogen',
    'bird': 'bird',
    'third': 'medal',
    'smirk': 'happy',
    'quirk': 'think',
    'girl': 'female-user',
    'swirl': 'spiral',
    'shirt': 't-shirt',
    'dirt': 'mud',
    'skirt': 'skirt',
    'sir': 'user',
    'stir': 'cook',
    'fir': 'tree',
    'burn': 'fire',
    'turn': 'sync',
    'return': 'back',
    'urn': 'pottery',
    'mourn': 'crying',
    'slurp': 'soup',
    'burp': 'happy',
    'hurt': 'bandage',
    'spurt': 'water',
    'yogurt': 'milk',
    'fur': 'cat',
    'spur': 'boot',
    'blur': 'hide',
    'black': 'color-wheel',
    'block': 'cube',
    'clip': 'attach',
    'clock': 'clock',
    'flag': 'flag',
    'flat': 'surface',
    'fly': 'bird',
    'glass': 'cup',
    'glad': 'happy',
    'globe': 'globe',
    'plan': 'file',
    'plum': 'plum',
    'slide': 'playground-slide',
    'beer': 'beer',
    'cheer': 'glasses',
    'steer': 'steering-wheel',
    'teeth': 'teeth',
    'knees': 'knees',
    'handshake': 'handshake'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Handcrafted pages 301 to 405
const HANDCRAFTED_PAGES: [string, string[], string][] = [
  // 301
  ['oaf', ['loaf', '条（面包）'], '吃个 loaf（大面包）'],
  // 302
  ['oak', ['oak', '橡树', 'soak', '浸泡'], '靠着 oak（橡树），把脚 soak（浸泡）'],
  // 303
  ['oal', ['coal', '煤炭', 'goal', '目标'], '烧着 coal（煤），坚定 goal（目标）'],
  // 304
  ['oam', ['foam', '泡沫', 'roam', '漫游'], '彩色 foam（肥皂泡），四处 roam（游荡）'],
  // 305
  ['oan', ['moan', '呻吟', 'loan', '贷款'], '一声 moan（叹息），申请 loan（贷款）'],
  // 306
  ['oap', ['soap', '肥皂'], '洗手 soap（香皂）'],
  // 307
  ['oar', ['roar', '吼叫', 'soar', '飞翔'], '听到 roar（咆哮），向天 soar（高飞）'],
  // 308
  ['oas', ['coast', '海岸', 'toast', '吐司', 'boast', '夸耀'], '来到 coast（海岸），吃着 toast（烤面包），别去 boast（自夸）'],
  // 309
  ['oat', ['boat', '小船', 'coat', '外套', 'float', '漂浮'], '坐上 boat（小船），披着 coat（外套），水上 float（漂流）'],
  // 310
  ['oe', ['toe', '脚趾', 'hoe', '锄头', 'foe', '敌人'], '动动 toe（脚趾），拿着 hoe（锄头），打败 foe（宿敌）'],
  // 311
  ['oi', ['oil', '油', 'coil', '盘绕', 'boil', '沸腾'], '倒点 oil（油），钢卷 coil（好），水在 boil（翻滚）'],
  // 312
  ['oil', ['boil', '开水', 'soil', '泥土'], '水已 boil（烧开），浇在 soil（土中）'],
  // 313
  ['oin', ['coin', '硬币', 'join', '加入'], '捡到 coin（硬币），快来 join（加入）'],
  // 314
  ['oint', ['point', '点', 'joint', '关节'], '指着 point（痛点），揉揉 joint（关节）'],
  // 315
  ['ois', ['noise', '噪音', 'poise', '姿态'], '远离 noise（噪音），保持 poise（姿态）'],
  // 316
  ['oit', ['exploit', '开发', 'adroit', '熟练的'], '极力 exploit（开发），动作 adroit（熟练的）'],
  // 317
  ['oo', ['moon', '月亮', 'spoon', '勺子', 'noon', '中午'], '看着 moon（月亮），拿着 spoon（勺子），已到 noon（中午）'],
  // 318
  ['ood', ['wood', '木头', 'stood', '站立', 'hood', '兜帽'], '抱着 wood（木头），stood（站立）在林，戴着 hood（大兜帽）'],
  // 319
  ['oof', ['roof', '屋顶', 'proof', '证据'], '爬上 roof（屋顶），寻找 proof（证据）'],
  // 320
  ['ook', ['book', '书', 'look', '看', 'cook', '厨师'], '翻开 book（书本），look（看一秒），我是 cook（大厨）'],
  // 321
  ['ool', ['cool', '凉爽的', 'pool', '水池', 'tool', '工具'], '天气 cool（凉爽），跳入 pool（铺满），带上 tool（工具）'],
  // 322
  ['oom', ['room', '房间', 'bloom', '开花', 'gloom', '忧郁'], '走进 room（房间），鲜花 bloom（盛开），驱散 gloom（忧郁）'],
  // 323
  ['oop', ['hoop', '铁环', 'loop', '圈', 'soup', '汤'], '滚起 hoop（铁环），打个 loop（圆圈），喝碗 soup（汤水）'],
  // 324
  ['oor', ['door', '门', 'floor', '地板', 'poor', '可怜的'], '推开 door（木门），站在 floor（地板），老人 poor（可怜）'],
  // 325
  ['oose', ['goose', '鹅', 'loose', '松的', 'choose', '选择'], '养只 goose（白鹅），绳子 loose（松了），任其 choose（选择）'],
  // 326
  ['oot', ['foot', '脚', 'shoot', '射击', 'boot', '靴子'], '动动 foot（大脚），准备 shoot（射击），穿着 boot（皮靴）'],
  // 327
  ['ooth', ['tooth', '牙齿', 'booth', '货摊'], '剔剔 tooth（牙齿），摆个 booth（货摊）'],
  // 328
  ['outh', ['mouth', '嘴', 'south', '南方', 'youth', '青年人'], '闭上 mouth（嘴巴），一路 south（向南），我们 youth（青年）'],
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
  ['ark', ['park', '公园', 'mark', '分数', 'spark', '火花'], '来到 park（公园），拿到 mark（满分），闪耀 spark（火花）'],
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
  ['ur', ['fur', '皮毛', 'spur', '马刺', 'blur', '模糊的'], '柔软 fur（皮毛），踩着 spur（马刺），视线 blur（模糊）'],
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
  ['fr', ['frog', '青蛙', 'free', '自由的', 'front', '前方'], '惊醒 frog（青蛙），向向 free（自由），蹦向 front（前方）'],
  // 395
  ['gr', ['grass', '草地', 'grow', '生长', 'grape', '葡萄'], '躺在 grass（草地），看花 grow（成长），剥开 grape（葡萄）'],
  // 396
  ['pr', ['press', '按压', 'prize', '奖品', 'proud', '骄傲的'], '用力 press（按压），赢得 prize（大奖），父母 proud（骄傲）'],
  // 397
  ['tr', ['tree', '树', 'train', '火车', 'truck', '卡车'], '爬上 tree （树上），坐上 train（火车），看着 truck（卡车）'],
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

// Phonics rules used to generate subsequent cards
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

export const INTERMEDIATE_TEXTBOOK_CARDS_PART3: WordCard[] = Array.from({ length: 150 }).map((_, index) => {
  const pageNum = index + 301; // Continues from 301 to 450
  let page: [string, string[], string];

  if (index < HANDCRAFTED_PAGES.length) {
    page = HANDCRAFTED_PAGES[index];
  } else {
    // Dynamically generate using the REPEATABLE_PHONICS_RULES template
    const ruleOffset = index - HANDCRAFTED_PAGES.length;
    const rule = REPEATABLE_PHONICS_RULES[ruleOffset % REPEATABLE_PHONICS_RULES.length];
    page = [rule[0], rule[1], rule[2]];
  }

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
