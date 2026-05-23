import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'green': 'color-wheel',
    'screen': 'monitor',
    'queen': 'queen',
    'sleep': 'bed',
    'sheep': 'sheep',
    'jeep': 'jeep',
    'keep': 'hand',
    'deep': 'deep',
    'sweep': 'broom',
    'deer': 'deer',
    'beer': 'beer',
    'cheer': 'cheerleading',
    'peer': 'binocular',
    'steer': 'steering-wheel',
    'career': 'briefcase',
    'bees': 'bee',
    'trees': 'tree',
    'knees': 'knees',
    'feet': 'foot',
    'meet': 'handshake',
    'street': 'road',
    'sweet': 'candy',
    'sheet': 'file',
    'greet': 'handshake',
    'tea': 'tea',
    'sea': 'beach',
    'pea': 'peas',
    'flea': 'insect',
    'plea': 'pray',
    'bread': 'bread',
    'head': 'head',
    'dead': 'skeleton',
    'lead': 'lead',
    'read': 'book',
    'leaf': 'leaf',
    'deaf': 'mute',
    'meal': 'restaurant',
    'deal': 'handshake',
    'steal': 'thief',
    'seal': 'seal',
    'heal': 'potion',
    'real': 'checkmark',
    'dream': 'sleeping',
    'cream': 'ice-cream',
    'steam': 'sauna',
    'beam': 'sun',
    'scream': 'scream',
    'clean': 'vacuum',
    'bean': 'seedling',
    'mean': 'angry',
    'cheap': 'price-tag',
    'leap': 'frog',
    'heap': 'box',
    'bear': 'bear',
    'pear': 'pear',
    'tear': 'crying',
    'hear': 'ear',
    'ear': 'ear',
    'near': 'compass',
    'fear': 'ghost',
    'gear': 'gear',
    'wear': 't-shirt',
    'peas': 'peas',
    'fleas': 'insect',
    'meat': 'meat',
    'eat': 'dining-room',
    'heat': 'hot',
    'seat': 'chair',
    'beat': 'drums',
    'neat': 'vacuum',
    'wheat': 'wheat',
    'cheat': 'thief',
    'treat': 'gift',
    'boat': 'boat',
    'coat': 't-shirt',
    'goat': 'goat',
    'road': 'road',
    'load': 'truck',
    'toad': 'frog',
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
    'bois': 'wood',
    'exploit': 'sword',
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
    'choose_oo': 'checkmark',
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
    'found': 'magnifying-glass'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Raw content representing the textbook pages 273 to 550
const RAW_TEXTBOOK_PAGES_3: [string, string[], string][] = [
  // 273
  ['een', ['green', '绿色的', 'screen', '屏幕', 'queen', '女王'], '草地 green（绿色），看着 screen（屏幕），拜见 queen（女王）'],
  // 274
  ['eep', ['sleep', '睡觉', 'sheep', '小羊', 'jeep', '吉普车'], '正在 sleep（睡觉），抱着 sheep（绵羊），梦见 jeep（吉普车）'],
  // 275
  ['eep', ['keep', '保持', 'deep', '深处的', 'sweep', '扫'], '努力 keep（保持），水里 deep（深），认真 sweep（倒垃圾）'],
  // 276
  ['eer', ['deer', '鹿', 'beer', '啤酒', 'cheer', '欢呼'], '喂喂 deer（鹿），喝杯 beer（啤酒），为他 cheer（欢呼）'],
  // 277
  ['eer', ['peer', '同伴', 'steer', '驾驶', 'career', '职业生涯'], '遇到 peer（同龄人），学会 steer（开车），规划 career（生涯）'],
  // 278
  ['ees', ['bees', '蜜蜂们', 'trees', '树木们', 'knees', '膝盖们'], '成群 bees（蜜蜂），飞向 trees（树林），碰到 knees（膝盖）'],
  // 279
  ['eet', ['feet', '脚', 'meet', '遇见', 'street', '街道'], '洗洗 feet（双脚），出门 meet（偶遇），走在 street（街道）'],
  // 280
  ['eet', ['sweet', '甜的', 'sheet', '传单', 'greet', '问候'], '水果 sweet（甜的），拿着 sheet（纸单），大声 greet（打招呼）'],
  // 281
  ['ea', ['tea', '茶', 'sea', '大海', 'pea', '豌豆'], '喝杯 tea（茶），面对 sea（大海），吃颗 pea（豌豆）'],
  // 282
  ['ea', ['flea', '跳蚤', 'plea', '恳求'], '身上 flea（跳蚤），发出 plea（哀求）'],
  // 283
  ['ead', ['bread', '面包', 'head', '头', 'dead', '死的'], '吃口 bread（面包），一拍 head（头），老鼠 dead（死掉了）'],
  // 284
  ['ead', ['lead', '引导', 'read', '阅读'], '前面 lead（引导），我们 read（阅读）'],
  // 285
  ['eaf', ['leaf', '叶子', 'deaf', '聋的'], '绿绿 leaf（叶子），耳朵 deaf（听不见）'],
  // 286
  ['eal', ['meal', '一餐', 'deal', '交易', 'steal', '偷'], '美味 meal（一餐），达成 deal（合同），切勿 steal（偷盗）'],
  // 287
  ['eal', ['seal', '海豹', 'heal', '治愈', 'real', '真的'], '看着 seal（海豹），伤口 heal（治愈），感觉 real（真实的）'],
  // 288
  ['eam', ['dream', '梦', 'cream', '奶油', 'steam', '蒸汽'], '做个 dream（好梦），吃点 cream（奶油），冒出 steam（蒸汽）'],
  // 289
  ['eam', ['beam', '光束', 'scream', '尖叫'], '一束 beam（光芒），吓得 scream（大叫）'],
  // 290
  ['ean', ['clean', '干净的', 'bean', '豆子', 'mean', '吝啬的'], '打扫 clean（干净），吃颗 bean（豆），别太 mean（刻薄）'],
  // 291
  ['eap', ['cheap', '便宜的', 'leap', '跳跃', 'heap', '一堆'], '价格 cheap（便宜），向上 leap（跳跃），落入 heap（大堆）'],
  // 292
  ['ear', ['bear', '熊', 'pear', '梨', 'tear', '眼泪'], '遇到 bear（大熊），丢掉 pear（梨），吓出 tear（眼泪）'],
  // 293
  ['ear', ['hear', '听见', 'ear', '耳朵', 'near', '在附近'], '让我 hear（听见），凑近 ear（耳朵），人就在 near（附近）'],
  // 294
  ['ear', ['fear', '害怕', 'gear', '齿轮', 'wear', '穿戴'], '没有 fear（恐惧），开动 gear（设备），准备 wear（衣物）'],
  // 295
  ['eas', ['peas', '豌豆（复数）', 'fleas', '跳蚤（复数）'], '剥点 peas（豌豆），除掉 fleas（跳蚤们）'],
  // 296
  ['eat', ['meat', '肉', 'eat', '吃', 'heat', '热度'], '想吃 meat（肉），开心 eat（享用），天气 heat（炎热）'],
  // 297
  ['eat', ['seat', '座位', 'beat', '打', 'neat', '整洁的'], '找到 seat（座位），随着 beat（拍子），房间 neat（整洁）'],
  // 298
  ['eat', ['wheat', '小麦', 'cheat', '骗', 'treat', '招待'], '金色 wheat（麦），别去 cheat（人），大方 treat（招待）'],
  // 299
  ['oa', ['boat', '船', 'coat', '外套', 'goat', '山羊'], '坐上 boat（小木船），穿着 coat（大衣），牵着 goat（山羊）'],
  // 300
  ['oad', ['road', '路', 'load', '装载', 'toad', '蟾蜍'], '走在 road（路），货物 load（满满），碰到 toad（蛤蟆）'],
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
  ['oi', ['coin', '硬币', 'point', '点', 'joint', '关节'], '捡个 coin（硬币），手指 point（点划），动动 joint（骨节）'],
  // 313
  ['oi', ['bois', '木头', 'exploit', '开发'], '砍伐 bois（大木），合理 exploit（开发开发）'],
  // 314
  ['oo', ['moon', '月亮', 'spoon', '勺子', 'noon', '中午'], '看着 moon（明月），拿着 spoon（铁勺），正是 noon（正午）'],
  // 315
  ['oo', ['wood', '木头', 'stood', '站立', 'hood', '兜帽'], '抱着 wood（木棍），一向 stood（挺拔），拉起 hood（兜帽）'],
  // 316
  ['oo', ['roof', '屋顶', 'proof', '证据'], '登上 roof（房顶），寻找 proof（线索）'],
  // 317
  ['oo', ['book', '书', 'look', '看', 'cook', '做饭'], '翻翻 book（童话），向外 look（瞧瞧），正在 cook（饭菜）'],
  // 318
  ['oo', ['cool', '酷的', 'pool', '水池', 'tool', '工具'], '非常 cool（凉爽），跳入 pool（泳池），拿着 tool（劳动）'],
  // 319
  ['oo', ['room', '房间', 'bloom', '花开', 'gloom', '忧郁'], '走进 room（房屋），花朵 bloom（盛开），驱散 gloom（阴郁）'],
  // 320
  ['oo', ['hoop', '圈杯', 'loop', '循环', 'soup', '汤'], '扔进 hoop（框里），无限 loop（滚动），喝碗 soup（热汤）'],
  // 321
  ['oo', ['door', '门', 'floor', '地板', 'poor', '贫穷的'], '打开 door（门），擦擦 floor（地），救助 poor（穷人）'],
  // 322
  ['oo', ['goose', '鹅', 'loose', '松的', 'choose_oo', '挑选'], '追着 goose（大鹅），纽扣 loose（松），随便 choose（挑选）'],
  // 323
  ['oo', ['foot', '脚', 'shoot', '射击', 'boot', '靴子'], '动动 foot（大脚），拼命 shoot（射击），穿着 boot（靴子）'],
  // 324
  ['oo', ['tooth', '牙齿', 'booth', '小售货棚'], '揉揉 tooth（牙），守在 booth（哨所）'],
  // 325
  ['ou', ['mouth', '嘴', 'south', '南方', 'youth', '青年人'], '张开 mouth（口），面向 south（南），正值 youth（芳华）'],
  // 326
  ['ou', ['cloud', '云', 'loud', '大声的', 'proud', '骄傲的'], '白白 cloud（云层），声音 loud（响亮），使人 proud（自豪）'],
  // 327
  ['ou', ['touch', '触碰', 'ouch', '哎哟', 'couch', '沙发'], '伸手 touch（抚摸），大喊 ouch（哎哟），陷进 couch（软椅）'],
  // 328
  ['ou', ['ground', '地面', 'round', '球形', 'found', '寻找到'], '躺在 ground（地上），地球 round（圆圈），终于 found（摸到）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART3: WordCard[] = RAW_TEXTBOOK_PAGES_3.map((page, index) => {
  const pageNum = index + 273; // Continues from 273
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
