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

// Raw content representing the textbook pages 151 to 300
const RAW_TEXTBOOK_PAGES_2: [string, string[], string][] = [
  // Page 151: post, most, host
  ['ost', ['post', '邮寄', 'most', '多半', 'host', '主人'], '收到 post（邮寄），其中 most（大部分），都给 host（主人）'],
  // Page 152: fox, box, ox
  ['ox', ['fox', '狐狸', 'box', '盒子', 'ox', '公牛'], '一只 fox（狐狸），躲进 box（盒子），躲过 ox（公牛）'],
  // Page 153: club, pub
  ['ub', ['club', '社团', 'pub', '酒吧'], '跟着 club(社团,俱乐部)，去了 pub（酒吧）'],
  // Page 154: tub, rub
  ['ub', ['tub', '浴缸', 'rub', '摩擦'], '这个 tub（浴缸），可以 rub（按摩）'],
  // Page 155: mud, bud
  ['ud', ['mud', '淤泥', 'bud', '芽'], '从那 mud（淤泥），长出 bud（芽）'],
  // Page 156: bug, hug, dug
  ['ug', ['bug', '防虫', 'hug', '拥抱', 'dug', '挖掘'], '一只 bug（虫子），把我 hug（拥抱），把洞 dug（挖）'],
  // Page 157: mum, yum
  ['um', ['mum', '妈妈', 'yum', '好吃'], '我的 mum（妈妈），做饭 yum（好吃的）'],
  // Page 158: drum, gum, hum
  ['um', ['drum', '打鼓', 'gum', '口香糖', 'hum', '哼'], '敲着 drum（鼓），嚼着 gum（口香糖），把歌 hum（哼）'],
  // Page 159: sun, run, fun
  ['un', ['sun', '太阳', 'run', '跑步', 'fun', '乐趣'], '晒着 sun（太阳），不停 run（跑步），心情 fun（开心）'],
  // Page 160: cup, up
  ['up', ['cup', '杯子', 'up', '向上'], '拿着 cup（杯子），不断 up（向上）'],
  // Page 161: bus, us, plus
  ['us', ['bus', '巴士', 'us', '我们', 'plus', '增加'], '一辆 bus（巴士），来接 us（我们），去学 plus（加法）'],
  // Page 162: cut, nut, put
  ['ut', ['cut', '切割', 'nut', '坚果', 'put', '放置'], '水果 cut（切），然后 put（放），各种 nut（坚果）'],
  // Page 163: hut, but, shut
  ['ut', ['hut', '小屋', 'but', '但是', 'shut', '关门'], '回到 hut（小屋），没想 but（但是），门已 shut（关闭）'],
  // Page 164: adult, result
  ['ult', ['adult', '成人', 'result', '结果'], '作为 adult（成年人），承担 result（结果）'],
  // Page 165: blunt, hunt
  ['unt', ['blunt', '钝的', 'hunt', '打猎'], '工具 blunt（机智），无法 hunt（打猎）'],
  // Page 166: just, trust, must
  ['ust', ['just', '只', 'trust', '信任', 'must', '必须'], '你呀 just（只要），对我 trust（信任），这是 must（必须）'],
  // Page 167: just, dust, crust, rust
  ['ust', ['just', '只是', 'dust', '灰尘', 'crust', '表皮', 'rust', '生锈'], '因为 just（只是），打扫 dust（灰尘），机器 crust（表皮），开始 rust（生锈）'],
  // Page 168: conduct, product
  ['duct', ['conduct', '行为', 'product', '产品'], '根据 conduct（引导），生产 product（产品）'],
  // Page 169: music, magic, comic
  ['ic', ['music', '音乐', 'magic', '魔术', 'comic', '连环画'], '听听 music（音乐），变变 magic（魔术），看看 comic（连环画）'],
  // Page 170: music, basic, classic
  ['sic', ['music', '音乐', 'basic', '基础', 'classic', '传统'], '这首 music（音乐），虽然 basic（基础的），但是 classic (经典的)'],
  // Page 171: traffic, terrific
  ['fic', ['traffic', '交通', 'terrific', '极棒'], '今天 traffic(交通)，实在 terrific（极好的）'],
  // Page 172: scientific, specific
  ['fic', ['scientific', '科学', 'specific', '精确'], '结果 specific（明确的），非常 scientific(科学的)'],
  // Page 173: republic, relic, public
  ['lic', ['republic', '共和国', 'relic', '遗迹', 'public', '公共'], '这个 republic (共和国)，全部 relic（遗迹），开放 public（公众）'],
  // Page 174: picnic, panic, clinic
  ['nic', ['picnic', '野餐', 'panic', '惊恐', 'clinic', '诊所'], '野外 picnic（野餐），遭受 panic（恐慌），送到 clinic（诊所）'],
  // Page 175: topic, epic
  ['pic', ['topic', '话题', 'epic', '史诗'], '这个 topic（话题），非常 epic（宏大的 ）'],
  // Page 176: Arctic, energetic, fantastic
  ['tic', ['Arctic', '北极', 'energetic', '有活力', 'fantastic', '极棒'], '来到 Arctic（北极），身体 energetic(精力充沛的)，状态 fantastic（极好的）'],
  // Page 177: romantic, dramatic
  ['tic', ['romantic', '浪漫', 'dramatic', '夸张'], '非常 romantic（浪漫的），有点 dramatic(戏剧化的)'],
  // Page 178: artistic, realistic
  ['istic', ['artistic', '艺术', 'realistic', '写实'], '有点 artistic(艺术的)，不太 realistic(现实的)'],
  // Page 179: mice, rice
  ['ice', ['mice', '老鼠', 'rice', '大米'], '一群 mice（老鼠），看到 rice（米）'],
  // Page 180: juice, ice, nice
  ['ice', ['juice', '果汁', 'ice', '冰块', 'nice', '极棒'], '倒杯 juice（果汁），加点 ice（冰块），味道 nice（很棒）'],
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
  ['eem', ['seem', '好像', 'dream', '梦想'], '好像 seem（可能），实现 dream（梦想）'],
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
  ['oad', ['road', '路', 'load', '装载', 'toad', '蟾蜍'], '走在 road（路），货物 load（满满），碰到 toad（蛤蟆）']
];

export const INTERMEDIATE_TEXTBOOK_CARDS_PART2: WordCard[] = RAW_TEXTBOOK_PAGES_2.map((page, index) => {
  const pageNum = index + 151; // Continues from 151
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
