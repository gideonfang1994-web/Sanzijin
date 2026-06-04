import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'cab': 'taxi',
    'lab': 'chemistry',
    'crab': 'crab',
    'dad': 'father',
    'pad': 'tablet',
    'glad': 'happy',
    'mad': 'angry',
    'cat': 'cat',
    'rat': 'mouse',
    'fat': 'obese',
    'mat': 'rug',
    'bat': 'baseball-bat',
    'hat': 'fedora',
    'pat': 'massage',
    'flat': 'apartment',
    'chat': 'chat-bubble',
    'bag': 'shopping-bag',
    'tag': 'price-tag',
    'brag': 'shouting',
    'rag': 'cloth',
    'flag': 'flag',
    'wag': 'dog-wagging-tail',
    'ham': 'ham',
    'jam': 'jam',
    'exam': 'exam',
    'man': 'man',
    'pan': 'frypan',
    'tan': 'sun-bath',
    'plan': 'todo-list',
    'van': 'delivery-van',
    'fan': 'fan',
    'ban': 'ban',
    'can': 'can',
    'scan': 'barcode-scanner',
    'cap': 'baseball-cap',
    'tap': 'faucet',
    'rap': 'singer',
    'map': 'map',
    'wrap': 'gift',
    'gap': 'crack',
    'trap': 'mousetrap',
    'lap': 'massage',
    'has': 'checkmark',
    'gas': 'gas-station',
    'relax': 'yoga',
    'ax': 'axe',
    'tax': 'tax',
    'act': 'theatre',
    'impact': 'meteor',
    'fact': 'parchnment',
    'exact': 'checkmark',
    'calf': 'cow',
    'half': 'pie-chart',
    'lamp': 'lamp',
    'stamp': 'stamp',
    'camp': 'tent',
    'ramp': 'ramp',
    'damp': 'umbrella',
    'hand': 'hand',
    'sand': 'beach',
    'land': 'globe',
    'band': 'drums',
    'stand': 'man',
    'grand': 'palace',
    'brand': 'price-tag',
    'understand': 'brain',
    'ant': 'ant',
    'plant': 'seedling',
    'chant': 'singing',
    'pant': 'pants',
    'ask': 'question-mark',
    'task': 'checked-checkbox',
    'class': 'classroom',
    'glass': 'glass',
    'grass': 'grass',
    'pass': 'ticket',
    'fast': 'fast-forward',
    'breakfast': 'breakfast',
    'last': 'exit',
    'past': 'hourglass',
    'vast': 'landscape',
    'cast': 'fishing',
    'broadcast': 'broadcast',
    'forecast': 'weather',
    'paste': 'paste',
    'taste': 'clover',
    'waste': 'garbage',
    'contact': 'handshake',
    'intact': 'shield',
    'contract': 'contract',
    'attract': 'magnet',
    'distract': 'headache',
    'sled': 'sleigh',
    'bed': 'bed',
    'red': 'color-wheel',
    'leg': 'foot',
    'peg': 'clothespin',
    'beg': 'praying',
    'egg': 'egg',
    'gem': 'gem',
    'them': 'people',
    'hen': 'chicken',
    'pen': 'pen',
    'ten': 'number-10',
    'when': 'clock',
    'then': 'arrow',
    'bet': 'dice',
    'get': 'hand',
    'pet': 'dog',
    'set': 'settings',
    'vet': 'veterinarian',
    'upset': 'sad',
    'net': 'tennis-net',
    'wet': 'raindrop',
    'forget': 'brain',
    'sex': 'gender-symbols',
    'complex': 'maze',
    'subject': 'book',
    'connect': 'link',
    'affect': 'star',
    'tell': 'chat-bubble',
    'spell': 'magic',
    'well': 'good',
    'shell': 'seashell',
    'bell': 'bell',
    'sell': 'money',
    'swell': 'headache',
    'smell': 'perfume',
    'help': 'first-aid',
    'yelp': 'crying',
    'melt': 'fire',
    'belt': 'belt',
    'left': 'left-arrow',
    'theft': 'thief',
    'deft': 'hand',
    'lend': 'hand',
    'friend': 'friend',
    'send': 'mail',
    'chess': 'chess',
    'guess': 'question-mark',
    'dress': 'dress',
    'address': 'home',
    'mess': 'trash',
    'bless': 'angel',
    'less': 'minus',
    'stress': 'headache',
    'progress': 'chart',
    'press': 'button',
    'success': 'trophy',
    'unless': 'ban',
    'rest': 'bed',
    'test': 'exam',
    'best': 'medal',
    'west': 'west-arrow',
    'guest': 'hotel',
    'text': 'align-left',
    'context': 'parchment',
    'next': 'right-arrow',
    'infect': 'virus',
    'effect': 'sparkles',
    'perfect': 'checkmark',
    'project': 'rocket',
    'reject': 'cancel',
    'object': 'target',
    'expect': 'waiting',
    'aspect': 'cube',
    'respect': 'respect',
    'collect': 'box',
    'neglect': 'sad',
    'reflect': 'mirror',
    'direct': 'compass',
    'correct': 'checked-checkbox',
    'insect': 'insect',
    'dissect': 'scalpel',
    'architect': 'blueprint',
    'detect': 'magnifying-glass',
    'protect': 'shield',
    'concept': 'idea',
    'accept': 'handshake',
    'except': 'exclude',
    'recent': 'new',
    'cent': 'coin',
    'percent': 'percentage',
    'spend': 'wallet',
    'depend': 'team',
    'suspend': 'pause',
    'attend': 'meeting',
    'extend': 'expand',
    'intend': 'target',
    'pretend': 'theatre',
    'prevent': 'ban',
    'invent': 'bulb',
    'event': 'calendar',
    'suggest': 'idea',
    'digest': 'stomach',
    'contest': 'stadium',
    'protest': 'megaphone',
    'arrest': 'handcuffs',
    'forest': 'forest',
    'letter': 'envelope',
    'better': 'thumb-up',
    'impress': 'heart',
    'express': 'lips',
    'depress': 'sad',
    'commend': 'medal',
    'recommend': 'star',
    'kid': 'baby',
    'lid': 'lid',
    'hid': 'hide',
    'pig': 'pig',
    'big': 'fat',
    'dig': 'shovel',
    'bin': 'trash-can',
    'spin': 'spinner',
    'win': 'trophy',
    'twin': 'twins',
    'thin': 'slender',
    'pin': 'pin',
    'him': 'man',
    'swim': 'swimming',
    'slim': 'slender',
    'gym': 'dumbbell',
    'drip': 'water-drop',
    'slip': 'slippery-floor',
    'skip': 'jump-rope',
    'tip': 'light-bulb',
    'whip': 'leather-whip',
    'hip': 'pelvis',
    'zip': 'zipper',
    'ship': 'ship',
    'trip': 'traveler',
    'flip': 'gymnastics',
    'if': 'help',
    'cliff': 'cliff',
    'stiff': 'shield',
    'this': 'arrow',
    'tennis': 'tennis',
    'his': 'man',
    'hit': 'punch',
    'kit': 'toolbox',
    'fit': 'fitness',
    'edit': 'edit',
    'unit': 'blocks',
    'knit': 'knitting',
    'wit': 'brain',
    'mix': 'beaker2',
    'fix': 'wrench',
    'rapid': 'fast',
    'stupid': 'brain',
    'milk': 'milk',
    'silk': 'fabric',
    'login': 'enter',
    'begin': 'start',
    'pumpkin': 'pumpkin',
    'napkin': 'napkin',
    'skin': 'skin',
    'sink': 'sink',
    'pink': 'color-wheel',
    'find': 'magnifying-glass',
    'kind': 'heart'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Sequential Raw Card Database representing the pages of the PDF
const RAW_TEXTBOOK_PAGES: [string, string[], string][] = [
  // Page 1
  ['ab', ['cab', '出租车', 'lab', '实验室', 'crab', '螃蟹'], '搭上 cab（出租车），前往 lab（实验室），研究 crab（螃蟹）'],
  // Page 2
  ['ad', ['bad', '坏的', 'dad', '爸爸', 'sad', '伤心的'], '表现 bad（坏的），让我 dad（爸爸），非常 sad（伤心的）'],
  // Page 3
  ['ad', ['pad', '平板', 'glad', '高兴的', 'mad', '生气的'], '玩着 pad（平板），心情 glad（高兴的），爸爸 mad（生气的）'],
  // Page 4
  ['at', ['cat', '猫', 'rat', '老鼠', 'fat', '胖'], '有只 cat（猫），专吃 rat（老鼠），非常 fat（胖）'],
  // Page 5
  ['at', ['rat', '老鼠', 'mat', '垫子', 'bat', '蝙蝠'], '一只 rat（老鼠），绑上 mat（垫子），假装 bat（蝙蝠）'],
  // Page 6
  ['at', ['bat', '球棒', 'hat', '帽子', 'pat', '轻拍'], '拿上 bat（球棒），带上 hat（帽子），把球 pat（轻拍）'],
  // Page 7
  ['at', ['flat', '平坦的', 'mat', '垫子', 'chat', '聊天'], '地面 flat（平坦），铺上 mat（垫子），开心 chat（聊天）'],
  // Page 8
  ['ag', ['bag', '包', 'tag', '标签', 'brag', '吹牛'], '买来 bag（包），拆下 tag（标签），开始 brag（吹牛）'],
  // Page 9
  ['ag', ['rag', '破布', 'flag', '旗子', 'wag', '摇摆'], '找来 rag（破布），做成 flag（旗子），随风 wag（摇摆）'],
  // Page 10
  ['am', ['ham', '火腿', 'jam', '果酱', 'exam', '考试'], '吃点 ham（火腿），配上 jam（果酱），出发 exam（考试）'],
  // Page 11
  ['an', ['man', '男人', 'pan', '锅', 'tan', '焦褐色'], '有个 man（男人），没看 pan（锅），烧成 tan（焦褐色）'],
  // Page 12
  ['an', ['plan', '计划', 'van', '货车', 'fan', '风扇'], '有个 plan（计划），买辆 van（货车），能吹 fan（风扇）'],
  // Page 13
  ['an', ['pan', '锅', 'than', '比', 'fan', '风扇'], '这口 pan（锅），更贵 than（比），那台 fan（风扇）'],
  // Page 14
  ['an', ['ban', '禁令', 'can', '可以', 'scan', '扫视'], '出了 ban（禁令），没人 can（可以），偷偷 scan（扫视）'],
  // Page 15
  ['ap', ['cap', '帽子', 'tap', '轻拍', 'rap', '说唱'], '带上 cap（帽子），用手 tap（轻拍），哼着 rap（说唱）'],
  // Page 16
  ['ap', ['map', '地图', 'wrap', '包裹', 'gap', '空隙'], '找到 map（地图），用纸 wrap（包裹），藏进 gap（空隙）'],
  // Page 17
  ['ap', ['trap', '陷阱', 'gap', '空隙', 'lap', '大腿'], '有个 trap（陷阱），掉进 gap（空隙），伤到 lap（大腿）'],
  // Page 18
  ['as', ['has', '有', 'gas', '汽油'], '已经 has（有） 一桶 gas（汽油）'],
  // Page 19
  ['ax', ['relax', '放松', 'ax', '斧头', 'tax', '税收'], '请你 relax（放松），这把 ax（斧头），不收 tax（税收）'],
  // Page 20
  ['act', ['act', '行动', 'impact', '影响'], '小小 act（行动），巨大 impact（影响）'],
  // Page 21
  ['act', ['act', '表演', 'fact', '事实', 'exact', '准确地'], '她的 act (表演)，根据 fact（事实），非常 exact (准确的)'],
  // Page 22
  ['alf', ['calf', '小牛', 'half', '一半'], '这群 calf（小牛），少了 half（一半）'],
  // Page 23
  ['amp', ['lamp', '灯', 'stamp', '邮票'], '打开 lamp（灯），贴上 stamp（邮票）'],
  // Page 24
  ['amp', ['camp', '露营', 'ramp', '斜坡', 'damp', '潮湿的'], '出来 camp (露营)，只剩 ramp (斜坡)，还很 damp (潮湿的)'],
  // Page 25
  ['and', ['hand', '手', 'sand', '沙子', 'land', '陆地'], '我用 hand（手），拿来 sand（沙子），填出 land（陆地）'],
  // Page 26
  ['and', ['band', '乐队', 'stand', '站着', 'grand', '宏大'], '这个 band（乐队），台上 stand（站着），气场 grand（宏大）'],
  // Page 27
  ['rand', ['brand', '品牌', 'grand', '豪华'], '这个 brand（品牌），非常 grand（豪华）'],
  // Page 28
  ['stand', ['stand', '站着', 'understand', '理解'], '旁边 stand（站着），表示 understand（理解）'],
  // Page 29
  ['ant', ['ant', '蚂蚁', 'plant', '植物', 'chant', '吟唱'], '这只 ant（蚂蚁），爬上 plant（植物），开始 chant（吟唱）'],
  // Page 30
  ['ant', ['plant', '工厂', 'pant', '裤子'], '这家 plant（工厂），生产 pant（裤子）'],
  // Page 31
  ['ask', ['ask', '问', 'task', '任务'], '过去 ask（问），今天 task（任务）'],
  // Page 32
  ['ass', ['class', '课', 'glass', '玻璃镜', 'grass', '草'], '这节 class（课），拿上 glass（玻璃镜），观察 grass（草）'],
  // Page 33
  ['ass', ['glass', '玻璃', 'pass', '经过'], '看到 glass（玻璃），小心 pass（经过）'],
  // Page 34
  ['ast', ['fast', '快的', 'breakfast', '早餐', 'last', '最后'], '尽管 fast（快的），吃完 breakfast（早餐），还是 last（最后的）'],
  // Page 35
  ['ast', ['fast', '快的', 'past', '过去', 'last', '最后'], '请你 fast（快的），别像 past（过去），老是 last（最后的）'],
  // Page 36
  ['ast', ['vast', '巨大的', 'cast', '投掷', 'fast', '快'], '操场 vast（巨大的），把球 cast（投掷），速度 fast（快）'],
  // Page 37
  ['cast', ['broadcast', '广播', 'forecast', '预报'], '打开 broadcast（广播），收听 forecast（预报）'],
  // Page 38
  ['aste', ['paste', '面糊', 'taste', '味道', 'waste', '浪费'], '这碗 paste（面糊），奇怪 taste（味道），只能 waste（浪费）'],
  // Page 39
  ['tact', ['contact', '接触', 'intact', '完好'], '虽然 contact（接触），仍然 intact (完好无损)'],
  // Page 40
  ['tract', ['contract', '合同', 'attract', '吸引', 'distract', '分心'], '这份 contract（合同），把他 attract（吸引），让他 distract（分心）'],
  // Page 41
  ['ed', ['sled', '雪橇', 'bed', '床', 'red', '红色'], '找来 sled（雪橇），拉上 bed（床)，颜色 red（红色）'],
  // Page 42
  ['eg', ['leg', '腿', 'peg', '夹子', 'beg', '求饶'], '两只 leg（腿），夹上 peg（夹子），只想 beg（求饶）'],
  // Page 43
  ['eg', ['beg', '祈求', 'egg', '鸡蛋'], '向我 beg（祈求，乞讨），给他 egg（鸡蛋）'],
  // Page 44
  ['em', ['gem', '宝石', 'them', '他们'], '找到 gem（宝石），收藏 them（他们）'],
  // Page 45
  ['en', ['hen', '母鸡', 'pen', '钢笔', 'ten', '十'], '一只 hen（母鸡），买了 pen（钢笔），花了 ten（十）'],
  // Page 46
  ['en', ['when', '什么时候', 'then', '那时候'], '别问 when（什么时候），就在 then（那时候）'],
  // Page 47
  ['et', ['bet', '打赌', 'get', '拿到', 'pet', '宠物'], '和他 bet（打赌），最后 get（拿到），一只 pet（宠物）'],
  // Page 48
  ['et', ['pet', '宠物', 'set', '设定', 'vet', '兽医'], '喜欢 pet（宠物），目标 set（设定），要当 vet（兽医）'],
  // Page 49
  ['et', ['bet', '打赌', 'upset', '不高兴'], '输了 bet（打赌），非常 upset（不高兴的）'],
  // Page 50
  ['et', ['pet', '宠物', 'net', '网', 'wet', '潮湿'], '养了 pet（宠物），结出 net（网），喜欢 wet（潮湿的）'],
  // Page 51
  ['get', ['forget', '忘记', 'get', '拿'], '东西 forget（忘记），回去 get（拿到）'],
  // Page 52
  ['ex', ['sex', '性别', 'complex', '复杂的'], '不同 sex（性别），差异 complex(复杂的)'],
  // Page 53
  ['ect', ['subject', '学科', 'connect', '联系', 'affect', '影响'], '各个 subject（学科），都有 connect（联系），相互 affect（影响）'],
  // Page 54
  ['ell', ['tell', '告诉', 'spell', '拼写', 'well', '好'], '让我 tell（告诉），如何 spell（拼写），表现 well（好）'],
  // Page 55
  ['ell', ['shell', '贝壳', 'bell', '钟铃', 'sell', '卖出'], '捡到 shell（贝壳），就像 bell（钟，铃），高价 sell（卖出）'],
  // Page 56
  ['ell', ['swell', '肿胀', 'smell', '味道'], '伤口 swell（肿胀），散发 smell（味道）'],
  // Page 57
  ['elp', ['help', '帮助', 'yelp', '尖叫'], '需要 help（帮助），大声 yelp（尖叫）'],
  // Page 58
  ['elt', ['melt', '融化', 'belt', '腰带'], '把铁 melt (融化)，做成 belt（腰带）'],
  // Page 59
  ['eft', ['left', '左边', 'theft', '小偷', 'deft', '熟练的'], '在我 left（左边），有个 theft（小偷），动作 deft（熟练的）'],
  // Page 60
  ['end', ['lend', '借出', 'friend', '朋友', 'send', '送'], '把钱 lend（借出），给我 friend（朋友），专门 send（送）'],
  // Page 61
  ['ess', ['chess', '国际象棋', 'guess', '猜'], '想赢 chess（棋），需要 guess (猜)'],
  // Page 62
  ['ess', ['dress', '裙子', 'address', '地址', 'mess', '杂乱'], '想退 dress（裙子），忘了 address（地址），一团 mess（杂乱）'],
  // Page 63
  ['ess', ['bless', '保佑', 'less', '更少', 'stress', '压力'], '老天 bless（保佑），想要 less（更少），学习 stress（压力）'],
  // Page 64
  ['ess', ['stress', '压力', 'progress', '进步', 'press', '压', 'success', '成功'], '没有 stress（压力），身上 press（压），怎么 progress（进步），别说 success（成功）'],
  // Page 65
  ['ess', ['success', '成功', 'unless', '除非', 'progress', '进步'], '想要 success（无忧无虑），那你 unless（除非），持续 progress（进步）'],
  // Page 66
  ['est', ['rest', '休息', 'test', '考试', 'best', '最好'], '好好 rest（休息），参加 test（考试），才能 best（最好）'],
  // Page 67
  ['est', ['west', '西边', 'rest', '休息', 'guest', '客人'], '太阳 west（西边的），想要 rest（休息），来了 guest（客人）'],
  // Page 68
  ['ext', ['text', '文本', 'context', '上下文', 'next', '下一个'], '拿到 text（文本），看完 context（上下文），期待 next（下一个）'],
  // Page 69
  ['fect', ['infect', '感染', 'effect', '效果', 'perfect', '完美'], '针对 infect（感染），产生 effect（效果），效果 perfect（完美的）'],
  // Page 70
  ['ject', ['project', '项目', 'reject', '拒绝', 'object', '目标'], '这个 project（项目），没法 reject（拒绝），完成 object（目标）'],
  // Page 71
  ['pect', ['expect', '期待', 'aspect', '方面', 'respect', '尊重'], '非常 expect（期待），各个 aspect（方面），受到 respect（尊重）'],
  // Page 72
  ['lect', ['collect', '收集', 'neglect', '忽视', 'reflect', '反思'], '问题 collect （收集），经常 reflect（反思），不能 neglect（忽视）'],
  // Page 73
  ['rect', ['direct', '指导', 'correct', '正确'], '通过 direct（指导），答案 correct（正确的）'],
  // Page 74
  ['sect', ['insect', '昆虫', 'dissect', '解剖'], '有只 insect（昆虫），把它 dissect（解剖）'],
  // Page 75
  ['tect', ['architect', '建筑师', 'detect', '探测', 'protect', '保护'], '这个 architect (建筑师)，经过 detect（探测），建筑 protect（保护）'],
  // Page 76
  ['cept', ['concept', '概念', 'accept', '接受', 'except', '除了'], '这些 concept（概念），可以 accept（接受），那个 except（除了）'],
  // Page 77
  ['cent', ['recent', '最近', 'cent', '分币', 'percent', '百分数'], '就在 recent（最近），学习 cent（分币），还有 percent（百分数）'],
  // Page 78
  ['pend', ['lend', '借出', 'spend', '花费'], '把钱 lend（借出），没钱 spend（花费）'],
  // Page 79
  ['pend', ['spend', '花费', 'depend', '依靠', 'suspend', '暂停'], '过多 spend（花费），没人 depend（依靠），只能 suspend（暂停）'],
  // Page 80
  ['tend', ['attend', '参加', 'extend', '扩大'], '有人 attend（参加），团队 extend（扩大）'],
  // Page 81
  ['tend', ['attend', '参加', 'intend', '打算', 'pretend', '假装'], '不想 attend（参加），所以 intend（打算），就先 pretend（假装）'],
  // Page 82
  ['vent', ['prevent', '阻止', 'invent', '发明', 'event', '事件'], '没法 prevent（阻止），他想 invent（发明），这个 event（事件）'],
  // Page 83
  ['gest', ['suggest', '建议', 'digest', '消化'], '他的 suggest（建议），慢慢 digest（消化）'],
  // Page 84
  ['test', ['contest', '竞赛', 'test', '考试', 'protest', '抗议'], '数学 contest（竞赛），天天 test（考试），我要 protest（抗议）'],
  // Page 85
  ['test', ['arrest', '逮捕', 'forest', '森林', 'rest', '休息'], '逃避 arrest（逮捕），逃到 forest（森林），才敢 rest（休息）'],
  // Page 86
  ['etter', ['letter', '信', 'better', '更好'], '修改 letter（信），这次 better（更好的）'],
  // Page 87
  ['press', ['impress', '留下印象', 'express', '表达', 'depress', '使沮丧'], '伤害 impress(留下印象)，无法 express（表达），慢慢 depress（使沮丧）'],
  // Page 88
  ['commend', ['commend', '称赞', 'recommend', '推荐'], '一直 commend（称赞），把你 recommend(推荐)'],
  // Page 89
  ['id', ['kid', '孩子', 'lid', '盖子', 'hid', '躲藏'], '这个 kid（孩子），打开 lid（盖子），往里 hid（躲藏）'],
  // Page 90
  ['ig', ['pig', '猪', 'big', '大', 'dig', '挖'], '这只 pig（猪），非常 big（大），喜欢 dig（挖）'],
  // Page 91
  ['in', ['bin', '桶', 'spin', '旋转', 'win', '赢'], '顶着 bin（桶），比赛 spin（旋转），看谁 win（赢）'],
  // Page 92
  ['in', ['twin', '双胞胎', 'thin', '瘦', 'pin', '曲别针'], '一对 twin(双胞胎），一样 thin（瘦的），就像 pin（曲别针）'],
  // Page 93
  ['im', ['him', '他', 'swim', '游泳', 'slim', '苗条'], '跟着 him（他），每天 swim（游泳），身材 slim（苗条的）'],
  // Page 94
  ['im', ['gym', '健身房', 'him', '他'], '常在 gym（健身房），碰到 him（他）'],
  // Page 95
  ['ip', ['drip', '滴下', 'slip', '滑', 'skip', '跳过'], '水滴 drip（滴下），地上 slip（滑的），赶紧 skip（跳过）'],
  // Page 96
  ['ip', ['tip', '小费', 'whip', '鞭子', 'hip', '屁股'], '没给 tip（小费），就用 whip（鞭子），抽你 hip（屁股）'],
  // Page 97
  ['ip', ['tip', '建议', 'lip', '嘴唇', 'zip', '拉链'], '给错 tip（建议），把你 lip（嘴唇），装上 zip（拉链）'],
  // Page 98
  ['ip', ['ship', '船', 'trip', '旅行', 'flip', '翻转'], '跳上 ship（船），开启 trip（旅行），浪花 flip（翻转）'],
  // Page 99
  ['if', ['if', '如果', 'cliff', '悬崖', 'stiff', '僵硬'], '他问 if（如果），站在 cliff（悬崖），是否 stiff（僵硬的）'],
  // Page 100
  ['is', ['this', '这个', 'tennis', '网球', 'his', '他的'], '想问 this（这个），绿色 tennis（网球），是否 his（他的）'],
  // Page 101
  ['it', ['hit', '打', 'kit', '工具箱', 'fit', '健康的'], '找出 kit（工具箱），练习 hit（击打），保持 fit（健康的）'],
  // Page 102: hit, edit, unit
  ['it', ['hit', '击打', 'edit', '编辑', 'unit', '单元'], '键盘 hit（击打），开始 edit（编辑），这个 unit（单元）'],
  // Page 103: knit, wit, fit
  ['it', ['knit', '编织', 'wit', '机智', 'fit', '健康的'], '多去 knit（编织），头脑 wit（机智），身体 fit（健康的）'],
  // Page 104: mix, fix
  ['ix', ['mix', '混合', 'fix', '修理'], '已经 mix（混合），赶紧 fix（修复）'],
  // Page 105: rapid, stupid
  ['pid', ['rapid', '迅速的', 'stupid', '傻'], '请你 rapid（迅速的），别再 stupid（傻）'],
  // Page 106: milk, silk
  ['ilk', ['milk', '牛奶', 'silk', '丝绸'], '这杯 milk（牛奶），滑如 silk（丝绸）'],
  // Page 107: login, begin
  ['gin', ['login', '登录', 'begin', '开始'], '账号 login（登录 ），游戏 begin（开始）'],
  // Page 108: pumpkin, napkin, skin
  ['kin', ['pumpkin', '南瓜', 'napkin', '纸巾', 'skin', '皮肤'], '吃完 pumpkin（南瓜），拿张 napkin（纸巾），擦擦 skin（皮肤）'],
  // Page 109: sink, pink
  ['ink', ['sink', '水槽', 'pink', '粉红'], '我家 sink (水槽)，颜色 pink (粉红色)'],
  // Page 110: find, kind
  ['ind', ['find', '发现', 'kind', '善良'], '慢慢 find（发现），他很 kind（善良的，友好的）'],
  // Page 111: blind, find, behind
  ['ind', ['blind', '盲', 'find', '发现', 'behind', '后面'], '眼睛 blind（盲的），没法 find（发现），它在 behind（后面）'],
  // Page 112: remind, mind, behind
  ['ind', ['remind', '提醒', 'mind', '脑子', 'behind', '后面'], '反复 remind（提醒），别把 mind（脑子），落在 behind（后面）'],
  // Page 113: ill, pill, hill, bill
  ['ill', ['ill', '生病', 'pill', '药丸', 'hill', '小山', 'bill', '账单'], '身体 ill（生病的），买来 pill（药丸），堆成 hill（小山），欠下 bill（账单）'],
  // Page 114: pill, still, kill
  ['ill', ['pill', '药', 'still', '仍然', 'kill', '杀死'], '吃了 pill（药），疾病 still（仍然），把他 kill（杀死）'],
  // Page 115: chill, will, hill
  ['ill', ['chill', '放松', 'will', '将会', 'hill', '小山'], '请你 chill（放松），马上 will（将会），登上 hill（小山）'],
  // Page 116: grill, skill, spill
  ['ill', ['grill', '烤架', 'skill', '技能', 'spill', '溢出'], '架上 grill（烤架），展示 skill（技能），香味 spill（溢出）'],
  // Page 117: fill, spill, thrill
  ['ill', ['fill', '填充', 'spill', '溢出', 'thrill', '激动'], '一直 fill（填充），就要 spill（溢出），非常 thrill（激动）'],
  // Page 118: disk, risk
  ['isk', ['disk', '硬盘', 'risk', '风险'], '你的 disk（硬盘），发现 risk（风险）'],
  // Page 119: miss, kiss
  ['iss', ['miss', '想念', 'kiss', '亲吻'], '非常 miss（想念），见面 kiss（亲吻）'],
  // Page 120: miss, dismiss
  ['miss', ['miss', '错过', 'dismiss', '解雇'], '会议 miss（错过），他被 dismiss（解雇）'],
  // Page 121: rabbit, habit, a bit
  ['bit', ['rabbit', '兔子', 'habit', '习惯', 'bit', '一点点'], '有只 rabbit（兔子），有个 habit（习惯），只吃 a bit（一点点）'],
  // Page 122: fit, profit, benefit
  ['fit', ['fit', '合适', 'profit', '利润', 'benefit', '好处'], '策略 fit（合适的），产生 benefit（好处），实现 profit（利润）'],
  // Page 123: grit, spirit
  ['rit', ['grit', '咬牙', 'spirit', '精神'], '努力 grit（咬紧牙），振作 spirit（精神）'],
  // Page 124: gift, lift, swift
  ['ift', ['gift', '礼物', 'lift', '电梯', 'swift', '快'], '收到 gift（礼物），装满 lift（电梯），打开 swift（快的）'],
  // Page 125: list, gist
  ['ist', ['list', '清单', 'gist', '要点'], '写下 list（清单），列出 gist（要点）'],
  // Page 126: sit, visit
  ['sit', ['sit', '坐', 'visit', '游览'], '别又 sit（坐），多去 visit（游览）'],
  // Page 127: addict, predict
  ['dict', ['addict', '上瘾', 'predict', '预测'], '最近 addict（上瘾），进行 predict（预测）'],
  // Page 128: restrict, strict
  ['strict', ['restrict', '限制', 'strict', '严格'], '进行 restrict（限制），非常 strict（严格的）'],
  // Page 129: middle, riddle
  ['iddle', ['middle', '中间', 'riddle', '谜'], '坐在 middle（中间），出个 riddle（谜）'],
  // Page 130: scientist, dentist
  ['tist', ['scientist', '科学家', 'dentist', '牙医'], '这位 scientist（科学家），去看 dentist（牙医）'],
  // Page 131: job, rob, sob
  ['ob', ['job', '工作', 'rob', '抢劫', 'sob', '哭泣'], '丢了 job（工作），还被 rob（抢劫），天天 sob（哭泣）'],
  // Page 132: god, nod, cod
  ['od', ['god', '上帝', 'nod', '点头', 'cod', '鳕鱼'], '看到 god（上帝），朝我 nod（点头），变成 cod（鳕鱼）'],
  // Page 133: jog, dog, frog
  ['og', ['jog', '慢跑', 'dog', '狗', 'frog', '青蛙'], '清晨 jog（慢跑），溜着 dog（狗），踩到 frog（青蛙）'],
  // Page 134: fog, jog, log
  ['og', ['fog', '雾', 'jog', '跑步', 'log', '木头'], '迎着 fog（雾），开始 jog（跑步），撞到 log（木头）'],
  // Page 135: fog, smog
  ['og', ['fog', '雾', 'smog', '烟雾'], '不是 fog（雾），那是 smog（烟雾）'],
  // Page 136: vlog, dialog
  ['log', ['vlog', '视频', 'dialog', '对话'], '这个 vlog（视频博客），没有 dialog（对话）'],
  // Page 137: doll, loll
  ['oll', ['doll', '洋娃娃', 'loll', '倚靠'], '这个 doll（洋娃娃），在那 loll（懒洋洋倚靠）'],
  // Page 138: troll, roll
  ['roll', ['troll', '喷子', 'roll', '滚蛋'], '面对 troll（恶意帖子），让他 roll（滚）'],
  // Page 139: folk, yolk
  ['olk', ['folk', '民间', 'yolk', '蛋黄'], '根据 folk（民间的），不吃 yolk（蛋黄）'],
  // Page 140: mop, hop, pop
  ['op', ['mop', '拖把', 'hop', '跳', 'pop', '流行'], '拿着 mop（拖把），轻轻 hop（跳），唱起 pop（流行音乐）'],
  // Page 141: shop, stop
  ['op', ['shop', '购物', 'stop', '停下'], '拼命 shop（购物），不能 stop（停下）'],
  // Page 142: crop, drop, chop
  ['rop', ['crop', '庄稼', 'drop', '掉落', 'chop', '砍'], '秋天 crop（庄稼），不断 drop（掉），需要 chop（砍）'],
  // Page 143: hot, rot
  ['ot', ['hot', '热', 'rot', '烂了'], '天气 hot（热），食物 rot（烂了）'],
  // Page 144: pot, hot, lot
  ['ot', ['pot', '锅', 'hot', '辣', 'lot', '许多'], '端上 pot（锅），火锅 hot（辣的），吃了 lot（许多）'],
  // Page 145: golf, wolf
  ['olf', ['golf', '高尔夫', 'wolf', '狼'], '去打 golf（高尔夫），碰到 wolf（狼）'],
  // Page 146: loft, soft
  ['oft', ['loft', '阁楼', 'soft', '软'], '来到 loft（阁楼），沙发 soft（软的）'],
  // Page 147: pond, fond, bond
  ['ond', ['pond', '池塘', 'fond', '喜欢', 'bond', '连结'], '跳进 pond（池塘），玩的 fond（愉悦的），关系 bond（连接）'],
  // Page 148: moss, cross
  ['oss', ['moss', '苔藓', 'cross', '穿过'], '路上 moss（苔藓），慢慢 cross（穿过）'],
  // Page 149: boss, loss
  ['oss', ['boss', '老板', 'loss', '损失'], '这个 boss（老板），遭受 loss（损失）'],
  // Page 150: cost, almost, most
  ['ost', ['cost', '花费', 'almost', '几乎', 'most', '大部分'], '我的 cost（花费），最近 almost（几乎），花了 most（大部分）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS: WordCard[] = RAW_TEXTBOOK_PAGES.map((page, index) => {
  const pageNum = index + 1;
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
