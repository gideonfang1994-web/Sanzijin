import { WordCard, WordItem } from './types';

// Helper to get illustration URLs from Icons8
const getImageUrl = (name: string) => {
  const nameMap: Record<string, string> = {
    'slice': 'pizza-slice',
    'spice': 'chili',
    'nice': 'checkmark',
    'rice': 'rice',
    'twice': 'repeat',
    'choice': 'hand',
    'dice': 'dice',
    'price': 'price-tag',
    'vice': 'handcuffs',
    'voice': 'microphone',
    'advice': 'bulb',
    'slide': 'playground-slide',
    'hide': 'hide',
    'side': 'right-arrow',
    'guide': 'lighthouse',
    'ride': 'bicycle',
    'wide': 'expand',
    'divide': 'math',
    'beside': 'friend',
    'outside': 'home',
    'inside': 'box',
    'wife': 'wife',
    'life': 'heart',
    'knife': 'knife',
    'bike': 'bicycle',
    'hike': 'backpack',
    'like': 'thumb-up',
    'strike': 'fist',
    'alike': 'twins',
    'dislike': 'thumb-down',
    'pile': 'box',
    'smile': 'happy',
    'file': 'file',
    'mile': 'road',
    'fragile': 'glass',
    'tile': 'surface',
    'profile': 'user',
    'fertile': 'wheat',
    'reptile': 'dinosaur',
    'exile': 'cage',
    'time': 'clock',
    'dime': 'coin',
    'line': 'line',
    'lime': 'lime',
    'prime': 'star',
    'crime': 'handcuffs',
    'grime': 'dust',
    'slime': 'ghost',
    'choke': 'cough',
    'fine': 'happy',
    'pine': 'pine',
    'mine': 'chest',
    'nine': 'number-9',
    'wine': 'wine',
    'shine': 'sun',
    'spine': 'skeleton',
    'dine': 'restaurant',
    'vine': 'grapes',
    'shrine': 'temple',
    'sunshine': 'sun',
    'divine': 'angel',
    'refine': 'chemistry',
    'machine': 'engine',
    'pipe': 'pipe',
    'ripe': 'fruit',
    'wipe': 'cloth',
    'stripe': 'color-wheel',
    'fire': 'fire',
    'wire': 'wire',
    'hire': 'contract',
    'tire': 'tire',
    'expire': 'hourglass',
    'desire': 'heart',
    'exercise': 'weights',
    'size': 'ruler',
    'rise': 'sunrise',
    'wise': 'owl',
    'surprise': 'gift',
    'advertise': 'megaphone',
    'bite': 'teeth',
    'kite': 'kite',
    'write': 'pen',
    'polite': 'respect',
    'website': 'browser',
    'invite': 'envelope',
    'quite': 'checkmark',
    'excite': 'sparkles',
    'five': 'number-5',
    'dive': 'swimming',
    'hive': 'bee',
    'drive': 'car',
    'alive': 'heart',
    'active': 'runner',
    'give': 'gift',
    'live': 'home',
    'size_z': 'ruler',
    'prize': 'trophy',
    'choke_o': 'cough',
    'smoke': 'smoke',
    'broke': 'broken-heart',
    'joke': 'clown',
    'poke': 'hand',
    'woke': 'sun',
    'hole': 'hole',
    'mole': 'animal',
    'pole': 'pole',
    'sole': 'foot',
    'whole': 'globe',
    'home': 'home',
    'dome': 'castle',
    'chrome': 'browser',
    'welcome': 'handshake',
    'bone': 'bone',
    'cone': 'ice-cream',
    'stone': 'stone',
    'alone': 'lonely',
    'zone': 'map',
    'phone': 'phone',
    'hope': 'sun',
    'rope': 'rope',
    'cope': 'brain',
    'scope': 'microscope',
    'slope': 'mountain',
    'more': 'plus',
    'score': 'target',
    'shore': 'beach',
    'store': 'shop',
    'ignore': 'ban',
    'explore': 'compass',
    'nose': 'nose',
    'rose': 'rose',
    'close': 'close',
    'pose': 'camera',
    'expose': 'sun',
    'choose': 'checkmark',
    'note': 'note',
    'vote': 'ballot',
    'quote': 'chat-bubble',
    'devote': 'heart',
    'remote': 'remote-control',
    'cove': 'beach',
    'love': 'heart',
    'dove': 'dove',
    'glove': 'gloves',
    'shove': 'hand',
    'tube': 'beaker',
    'cube': 'cube',
    'rude': 'angry',
    'huge': 'fat',
    'mule': 'horse',
    'rule': 'ruler',
    'fume': 'smoke',
    'tune': 'music',
    'june': 'calendar',
    'dune': 'desert',
    'cure': 'potion',
    'pure': 'water',
    'sure': 'checkmark',
    'secure': 'shield',
    'flute': 'music',
    'mute': 'mute',
    'cute': 'baby',
    'salute': 'respect',
    'pollute': 'garbage',
    'suit': 'suit',
    'squeeze': 'hand',
    'freeze': 'ice',
    'breeze': 'wind',
    'try': 'arrow',
    'dry': 'desert',
    'cry': 'crying',
    'fly': 'insect',
    'sky': 'sky',
    'spy': 'glasses',
    'why': 'question-mark',
    'reply': 'mail',
    'supply': 'box',
    'apply': 'pen',
    'bye': 'wave',
    'eye': 'eye',
    'die': 'skeleton',
    'tie': 'tie',
    'rain': 'cloud-with-rain',
    'train': 'train',
    'brain': 'brain',
    'pain': 'headache',
    'gain': 'chart',
    'plain': 'desert',
    'complain': 'angry',
    'explain': 'bulb',
    'play': 'tennis',
    'day': 'sun',
    'say': 'chat-bubble',
    'way': 'road',
    'may': 'calendar',
    'pay': 'money',
    'stay': 'home',
    'clay': 'pottery',
    'gray': 'color-wheel',
    'spray': 'perfume',
    'delay': 'clock',
    'display': 'screen',
    'bee': 'bee',
    'see': 'eye',
    'tree': 'tree',
    'free': 'cage',
    'three': 'number-3',
    'agree': 'handshake',
    'degree': 'medal',
    'feed': 'baby',
    'seed': 'seedling',
    'need': 'heart',
    'weed': 'grass',
    'bleed': 'blood',
    'speed': 'fast-forward',
    'feel': 'heart',
    'wheel': 'wheel',
    'heel': 'foot',
    'peel': 'banana',
    'steel': 'anvil',
    'seem': 'think',
    'dream': 'sleeping'
  };
  const keyword = nameMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  return `https://img.icons8.com/fluency/200/${keyword}.png`;
};

// Raw content representing the textbook pages 181 to 400
const RAW_TEXTBOOK_PAGES_2: [string, string[], string][] = [
  // 181
  ['ice', ['slice', '薄片', 'spice', '香料', 'nice', '好的'], '切片 slice（薄片），洒点 spice（香料），味道 nice（好的）'],
  // 182
  ['ice', ['rice', '米饭', 'twice', '两次', 'choice', '选择'], '吃碗 rice（米饭），来了 twice（两次），我的 choice（选择）'],
  // 183
  ['ice', ['dice', '骰子', 'spice', '香料', 'price', '价格'], '掷个 dice（骰子），买包 spice（香料），问问 price（价格）'],
  // 184
  ['ice', ['vice', '恶行', 'price', '代价', 'twice', '两次'], '犯下 vice（罪行），付出 price（代价），后悔 twice（两次）'],
  // 185
  ['ice', ['voice', '声音', 'choice', '选择', 'advice', '建议'], '听听 voice（声音），做出 choice（选择），采纳 advice（建议）'],
  // 186
  ['ice', ['slice', '一盘', 'price', '价格', 'twice', '两次'], '要这 slice（一盘），再付 price（价格），已经 twice（两次）'],
  // 187
  ['ide', ['slide', '滑梯', 'hide', '躲藏', 'side', '旁边'], '滑下 slide（滑梯），不要 hide（躲藏），就在 side（旁边）'],
  // 188
  ['ide', ['guide', '导游', 'ride', '骑行', 'wide', '宽阔的'], '跟着 guide（导游），练习 ride（骑车），道路 wide（宽阔）'],
  // 189
  ['ide', ['side', '身旁', 'wide', '宽广的', 'slide', '滑动'], '留在 side（身旁），世界 wide（宽广），自由 slide（滑动）'],
  // 190
  ['ide', ['divide', '分', 'beside', '在旁边', 'outside', '在外面'], '把它 divide（平分），就在 beside（旁边），摆在 outside（外面）'],
  // 191
  ['ide', ['hide', '躲藏', 'inside', '在里面', 'guide', '指南'], '把物 hide（躲藏），放在 inside（里面），需要 guide（指南）'],
  // 192
  ['ife', ['wife', '妻子', 'life', '生活', 'knife', '刀'], '我的 wife（妻子），热爱 life（生活），不用 knife（刀子）'],
  // 193
  ['ike', ['bike', '自行车', 'hike', '远足', 'like', '喜欢'], '骑上 bike（自行车），出门 hike（远足），格外 like（喜欢）'],
  // 194
  ['ike', ['strike', '罢工', 'alike', '相似的', 'dislike', '讨厌'], '举行 strike（罢工），脸色 alike（相似），都很 dislike（讨厌）'],
  // 195
  ['ile', ['pile', '堆', 'smile', '微笑', 'file', '文件'], '堆成 pile（一卷），带着 smile（微笑），整理 file（文件）'],
  // 196
  ['ile', ['mile', '英里', 'smile', '微笑', 'pile', '一堆'], '跑了一 mile（英里），露出 smile（微笑），坐在 pile（一堆）'],
  // 197
  ['ile', ['fragile', '易碎的', 'tile', '瓷砖', 'profile', '写照'], '它是 fragile（易碎的），这块 tile（瓷砖），生活的 profile（写照）'],
  // 198
  ['ile', ['fertile', '肥沃的', 'reptile', '爬行动物', 'exile', '流放'], '土地 fertile（肥沃的），看到 reptile（爬行动物），面临 exile（流放）'],
  // 199
  ['ime', ['time', '时间', 'dime', '一角硬币', 'line', '线'], '还有 time（时间），捡到 dime（一角），排好 line（队）'],
  // 200
  ['ime', ['lime', '青柠', 'slide', '滑动', 'time', '时间'], '吃个 lime（青柠），快乐 slide（滑动），抓紧 time（时间）'],
  // 201
  ['ime', ['prime', '最好的', 'crime', '犯罪', 'grime', '污垢'], '时间 prime（黄金），远离 crime（犯罪），擦去 grime（污垢）'],
  // 202
  ['ime', ['slime', '黏液', 'choke', '窒息', 'time', '时间'], '踩到 slime（黏液），令人 choke（窒息），浪费 time（时间）'],
  // 203
  ['ine', ['fine', '好的', 'line', '线', 'pine', '松树', 'mine', '我的'], '天气 fine（好的），站在 line（线上），怀抱 pine（松树），属于 mine（我的）'],
  // 204
  ['ine', ['nine', '九', 'wine', '葡萄酒', 'shine', '闪亮'], '数到 nine（九点），喝完 wine（酒），眼睛 shine（闪耀）'],
  // 205
  ['ine', ['spine', '脊柱', 'line', '队', 'dine', '进餐'], '挺直 spine（脊柱），排好 line（队），前去 dine（进餐）'],
  // 206
  ['ine', ['vine', '藤蔓', 'mine', '矿井', 'define', '定义'], '绕满 vine（藤蔓），这个 mine（矿），怎样 define（定义）'],
  // 207
  ['ine', ['shine', '发光', 'shrine', '神殿', 'sunshine', '阳光'], '光芒 shine（闪烁），走入 shrine（神殿），沐浴 sunshine（阳光）'],
  // 208
  ['ine', ['divine', '神圣的', 'refine', '精炼', 'machine', '机器'], '歌声 divine（神圣），正在 refine（提炼），制造 machine（机器）'],
  // 209
  ['ipe', ['pipe', '管道', 'ripe', '成熟的', 'wipe', '擦拭'], '拆掉 pipe（管子），吃着 ripe（成熟的水果），动手 wipe（擦拭）'],
  // 210
  ['ipe', ['stripe', '条纹', 'wipe', '擦'], '彩色 stripe（条纹），细心 wipe（擦洗）'],
  // 211
  ['ire', ['fire', '火', 'wire', '金属线', 'hire', '雇佣'], '遇到 fire（火），拉起 wire（线），开始 hire（雇人）'],
  // 212
  ['ire', ['tire', '轮胎', 'expire', '过期', 'desire', '渴望'], '车坏 tire（轮胎），就要 expire（过期），充满 desire（渴望）'],
  // 213
  ['ise', ['exercise', '锻炼', 'size', '尺码', 'rise', '上升'], '坚持 exercise（大班锻炼），衣服 size（尺寸），不停 rise（上升）'],
  // 214
  ['ise', ['wise', '明智的', 'surprise', '惊喜', 'advertise', '刊登广告'], '为人 wise（聪明），送上 surprise（惊喜），不做 advertise（广告）'],
  // 215
  ['ite', ['bite', '咬', 'kite', '风筝', 'write', '写'], '别去 bite（咬），拉着 kite（风筝），安心 write（写字）'],
  // 216
  ['ite', ['polite', '有礼貌的', 'website', '网站', 'invite', '邀请'], '说话 polite（有礼貌），打开 website（网页），发出 invite（邀请）'],
  // 217
  ['ite', ['quite', '相当', 'excite', '使兴奋'], '感觉 quite（相当），让人 excite（兴奋）'],
  // 218
  ['ive', ['five', '五', 'dive', '潜水', 'hive', '蜂房'], '拿到 five（五分），开始 dive（潜水），避开 hive（蜂巢）'],
  // 219
  ['ive', ['drive', '驾驶', 'alive', '活着', 'active', '活跃的'], '继续 drive（开车），生命 alive（活着），保持 active（活跃的）'],
  // 220
  ['ive', ['give', '给', 'live', '生活'], '大方 give（施舍），快乐 live（生活）'],
  // 221
  ['ize', ['size', '大小', 'prize', '奖品'], '不管 size（尺寸），都有 prize（奖励）'],
  // 222
  ['oke', ['choke', '呛', 'smoke', '烟', 'broke', '破产的'], '差点 choke（窒息），因为 smoke（大烟），几乎 broke（破产）'],
  // 223
  ['oke', ['joke', '笑话', 'poke', '戳', 'woke', '醒来'], '讲个 joke（笑话），用手 poke（戳），立马 woke（醒来）'],
  // 224
  ['ole', ['hole', '洞', 'mole', '鼹鼠', 'pole', '杆'], '挖个 hole（洞），藏个 mole（鼹鼠），立个 pole（杆子）'],
  // 225
  ['ole', ['sole', '唯一的', 'whole', '全部的'], '作为 sole（唯一），想要 whole（全部）'],
  // 226
  ['ome', ['home', '家', 'dome', '圆屋顶', 'chrome', '铬'], '回到 home（家），看着 dome（圆顶），闪耀 chrome（亮光）'],
  // 227
  ['ome', ['welcome', '欢迎', 'home', '到家'], '热情 welcome（欢迎），终于 home（到家）'],
  // 228
  ['one', ['bone', '骨头', 'cone', '松果', 'stone', '石头'], '抱着 bone（骨），看那 cone（松果），坐在 stone（石）'],
  // 229
  ['one', ['alone', '独自的', 'zone', '地区', 'phone', '电话'], '独自 alone（孤单），身处 zone（区域），接听 phone（电话）'],
  // 230
  ['ope', ['hope', '希望', 'rope', '绳子', 'cope', '应付'], '抱着 hope（希望），拉着 rope（绳子），学会 cope（应付）'],
  // 231
  ['ope', ['scope', '范围', 'slope', '斜坡'], '观察 scope（范围），爬上 slope（斜坡）'],
  // 232
  ['ore', ['more', '更多的', 'score', '得分', 'shore', '岸'], '想要 more（更多），赢下 score（得分），就在 shore（岸边）'],
  // 233
  ['ore', ['store', '商店', 'ignore', '忽视', 'explore', '探险'], '来到 store（店里），不要 ignore（无视），一起 explore（探索）'],
  // 234
  ['ose', ['nose', '鼻子', 'rose', '玫瑰', 'close', '关'], '耸耸 nose（鼻），闻闻 rose（红玫瑰），把眼 close（闭上）'],
  // 235
  ['ose', ['pose', '姿势', 'expose', '暴露', 'choose', '选择'], '摆好 pose（姿势），不要 expose（暴露），自愿 choose（挑选）'],
  // 236
  ['ote', ['note', '笔记', 'vote', '投票', 'quote', '引用'], '写完 note（笔记），开始 vote（投票），引用 quote（金句）'],
  // 237
  ['ote', ['devote', '献身于', 'remote', '偏远的'], '愿意 devote（奉献），前往 remote（偏远山村）'],
  // 238
  ['ove', ['cove', '小湾', 'love', '爱', 'dove', '鸽子'], '来到 cove（海湾），充满 love（爱），放飞 dove（鸽子）'],
  // 239
  ['ove', ['glove', '手套', 'shove', '推'], '戴上 glove（手套），用力 shove（推）'],
  // 240
  ['ube', ['tube', '管子', 'cube', '立方体'], '拿起 tube（试管），装满 cube（魔方）'],
  // 241
  ['ude', ['rude', '粗鲁的', 'attitude', '态度'], '不能 rude（粗鲁），端正 attitude（态度）'],
  // 242
  ['uge', ['huge', '巨大的', 'refuge', '避难所'], '身体 huge（巨大），寻找 refuge（避难所）'],
  // 243
  ['ule', ['mule', '骡子', 'rule', '规则'], '拉着 mule（老骡子），遵守 rule（规则）'],
  // 244
  ['ume', ['fume', '烟', 'perfume', '香水'], '伴随 fume（浓烟），喷点 perfume（香水）'],
  // 245
  ['une', ['tune', '曲调', 'june', '六月', 'dune', '沙丘'], '拨动 tune（曲调），正值 june（六月），漫步 dune（沙丘）'],
  // 246
  ['upe', ['dupe', '欺骗', 'envelope', '信封'], '不要 dupe（欺骗），拆开 envelope（信封）'],
  // 247
  ['ure', ['cure', '治愈', 'pure', '纯洁的', 'sure', '确信的'], '实现 cure（治愈），水质 pure（纯净），我很 sure（确信）'],
  // 248
  ['ure', ['secure', '安全的', 'future', '未来'], '感觉 secure（安全），展望 future（未来）'],
  // 249
  ['ute', ['flute', '长笛', 'mute', '静音', 'cute', '可爱的'], '演奏 flute（笛），按键 mute（静音），非常 cute（可爱）'],
  // 250
  ['ute', ['salute', '敬礼', 'pollute', '污染'], '向他 salute（敬礼），切勿 pollute（污染环境）'],
  // 251
  ['uze', ['squeeze', '挤压', 'freeze', '结冰', 'breeze', '微风'], '用力 squeeze（挤压），让水 freeze（结冰），吹着 breeze（微风）'],
  // 252
  ['y', ['try', '尝试', 'dry', '干燥的', 'cry', '哭泣'], '继续 try（尝试），保持 dry（干燥），不要 cry（哭泣）'],
  // 253
  ['y', ['fly', '飞', 'sky', '天空', 'spy', '特工'], '向上 fly（飞翔），高高 sky（白云），看着 spy（间谍）'],
  // 254
  ['y', ['why', '为什么', 'reply', '回答'], '别问 why（为什么），立刻 reply（回答）'],
  // 255
  ['y', ['supply', '供应', 'apply', '申请'], '充足 supply（供应），可以 apply（申请）'],
  // 256
  ['ye', ['bye', '再见', 'eye', '眼睛', 'dye', '印染'], '说声 bye（再见），揉揉 eye（眼），进行 dye（染衣）'],
  // 257
  ['ye', ['die', '死', 'tie', '领带'], '直至 die（死去），打着 tie（领带）'],
  // 258
  ['ai', ['rain', '雨', 'train', '火车', 'brain', '大脑'], '下起 rain（雨），坐上 train（列车），动动 brain（脑子）'],
  // 259
  ['ai', ['pain', '疼痛', 'gain', '收获', 'trail', '足迹'], '感觉 pain（痛苦），终有 gain（收获），留下 trail（足迹）'],
  // 260
  ['ai', ['plain', '平原', 'complain', '抱怨', 'explain', '解释'], '广阔 plain（平原），别去 complain（抱怨），认真 explain（解释）'],
  // 261
  ['ay', ['play', '玩', 'day', '天', 'say', '说'], '开心 play（玩耍），每天 day（白昼），听听 say（言语）'],
  // 262
  ['ay', ['way', '路', 'may', '可以', 'pay', '付款'], '在这 way（路上），我们 may（可以），掏钱 pay（付款）'],
  // 263
  ['ay', ['stay', '停留', 'clay', '黏土', 'gray', '灰色的'], '选择 stay（停留），捏着 clay（泥巴），天空 gray（灰色）'],
  // 264
  ['ay', ['spray', '喷雾', 'delay', '延期', 'display', '展览'], '使用 spray（喷雾），没有 delay（延迟），精彩 display（展览）'],
  // 265
  ['ee', ['bee', '蜜蜂', 'see', '看', 'tree', '树'], '一只 bee（蜜蜂），让我 see（看见），飞向 tree（大树）'],
  // 266
  ['ee', ['free', '自由的', 'three', '三'], '心情 free（自由），树下 three（三只小动物）'],
  // 267
  ['ee', ['agree', '同意', 'degree', '学位'], '表示 agree（同意），拿到 degree（证件）'],
  // 268
  ['eed', ['feed', '喂养', 'seed', '种子', 'need', '需要'], '用来 feed（喂养），种下 seed（种子），我们 need（需要）'],
  // 269
  ['eed', ['weed', '杂草', 'bleed', '流血', 'speed', '速度'], '拔掉 weed（杂草），手在 bleed（流血），加快 speed（速度）'],
  // 270
  ['eel', ['feel', '感觉', 'wheel', '轮子', 'heel', '脚后跟'], '非常 feel（舒适），转着 wheel（轮子），踩着 heel（高跟）'],
  // 271
  ['eel', ['peel', '削皮', 'steel', '钢'], '动手 peel（削皮），切着 steel（钢铁）'],
  // 272
  ['eem', ['seem', '好像', 'dream', '梦想'], '好像 seem（可能），实现 dream（梦想）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART2: WordCard[] = RAW_TEXTBOOK_PAGES_2.map((page, index) => {
  const pageNum = index + 181; // Continues from 181
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
