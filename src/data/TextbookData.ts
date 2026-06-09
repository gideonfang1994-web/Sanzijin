export interface TextbookWord {
  english: string;
  chinese: string;
  phonetic?: string;
}

export interface TextbookUnit {
  id: string; // e.g. 'pep_3a_u1'
  title: string; // e.g. 'Unit 1 Hello!'
  chineseTitle: string; // e.g. '你好！'
  words: TextbookWord[];
  rhythmicChant?: string; // Standard three-word rhythmic chant if available
}

export interface TextbookBook {
  id: string; // e.g. 'pep_3a'
  title: string; // e.g. '三年级上册'
  units: TextbookUnit[];
}

export interface TextbookVersion {
  id: string; // e.g. 'pep'
  name: string; // e.g. '人教版 (PEP)'
  books: TextbookBook[];
}

export interface TextbookSchoolStage {
  id: 'primary' | 'junior' | 'senior';
  name: string; // e.g. '小学'
  versions: TextbookVersion[];
}

export const TEXTBOOK_STAGES: TextbookSchoolStage[] = [
  {
    id: 'primary',
    name: '小学 (Primary)',
    versions: [
      {
        id: 'pep',
        name: '人教版 (PEP)',
        books: [
          {
            id: 'pep_3a',
            title: '三年级上册 (Grade 3 Vol 1)',
            units: [
              {
                id: 'pep_3a_u1',
                title: 'Unit 1 Making Friends',
                chineseTitle: '我的朋友们',
                words: [
                  { english: 'name', chinese: '名字', phonetic: 'neɪm' },
                  { english: 'nice', chinese: '令人愉快的；友好的', phonetic: 'naɪs' },
                  { english: 'ear', chinese: '耳朵', phonetic: 'ɪə(r)' },
                  { english: 'hand', chinese: '手', phonetic: 'hænd' },
                  { english: 'eye', chinese: '眼睛', phonetic: 'aɪ' },
                  { english: 'mouth', chinese: '嘴', phonetic: 'maʊθ' },
                  { english: 'arm', chinese: '胳膊', phonetic: 'ɑːm' },
                  { english: 'can', chinese: '可以', phonetic: 'kæn, kən' },
                  { english: 'share', chinese: '分享', phonetic: 'ʃeə(r)' },
                  { english: 'smile', chinese: '微笑；笑', phonetic: 'smaɪl' },
                  { english: 'listen', chinese: '听；倾听', phonetic: 'ˈlɪsn' },
                  { english: 'help', chinese: '帮助', phonetic: 'help' },
                  { english: 'say', chinese: '说；讲', phonetic: 'seɪ' },
                  { english: 'and', chinese: '和；与', phonetic: 'ænd, ənd' },
                  { english: 'goodbye', chinese: '再见', phonetic: 'ˌɡʊdˈbaɪ' },
                  { english: 'toy', chinese: '玩具', phonetic: 'tɔɪ' },
                  { english: 'friend', chinese: '朋友', phonetic: 'frend' },
                  { english: 'good', chinese: '好的', phonetic: 'ɡʊd' }
                ],
                rhythmicChant: "大声说 name，见面真 nice。指指你 ear，摸摸我 hand，睁大双 eye，笑开你 mouth，举起强 arm。只要 you can，乐于去 share，带上这 smile，用心去 listen，互相去 help，快乐地 say，手拉手 and，挥挥手 goodbye。抢一个 toy，结交新 friend，世界很 good。"
              },
              {
                id: 'pep_3a_u2',
                title: 'Unit 2 Colours',
                chineseTitle: '彩虹颜色 (我的家庭)',
                words: [
                  { english: 'mum', chinese: '（口语）妈妈', phonetic: 'mʌm' },
                  { english: 'dad', chinese: '（口语）爸爸；爹爹', phonetic: 'dæd' },
                  { english: 'grandma', chinese: '奶奶；姥姥', phonetic: 'ˈɡrænmɑː' },
                  { english: 'grandpa', chinese: '爷爷；姥爷', phonetic: 'ˈɡrænpɑː' },
                  { english: 'grandfather', chinese: '（外）祖父；爷爷；姥爷；外公', phonetic: 'ˈɡrænfɑːðə(r)' },
                  { english: 'grandmother', chinese: '（外）祖母；奶奶；姥姥；外婆', phonetic: 'ˈɡrænmʌðə(r)' },
                  { english: 'mother', chinese: '母亲；妈妈', phonetic: 'ˈmʌðə(r)' },
                  { english: 'father', chinese: '父亲；爸爸', phonetic: 'ˈfɑːðə(r)' },
                  { english: 'me', chinese: '我', phonetic: 'miː' },
                  { english: 'sister', chinese: '姐；妹', phonetic: 'ˈsɪstə(r)' },
                  { english: 'family', chinese: '家；家庭', phonetic: 'ˈfæməli' },
                  { english: 'have', chinese: '有', phonetic: 'hæv' },
                  { english: 'big', chinese: '大的', phonetic: 'bɪɡ' },
                  { english: 'cousin', chinese: '堂（表）兄弟；堂（表）姐妹', phonetic: 'ˈkʌzn' },
                  { english: 'brother', chinese: '哥；弟', phonetic: 'ˈbrʌðə(r)' },
                  { english: 'baby', chinese: '婴儿', phonetic: 'ˈbeɪbi' },
                  { english: 'uncle', chinese: '伯父；叔父；舅父；姑父；姨父', phonetic: 'ˈʌŋkl' },
                  { english: 'aunt', chinese: '伯母；婶母；舅母；姑母；姨母', phonetic: 'ɑːnt' },
                  { english: 'some', chinese: '一些', phonetic: 'sʌm, səm' },
                  { english: 'small', chinese: '小的', phonetic: 'smɔːl' }
                ],
                rhythmicChant: "亲爱的 mum，威严的 dad。慈祥的 grandma，幽默的 grandpa。尊敬的 grandfather，温和的 grandmother。辛劳的 mother，伟大的 father。张开手 me，牵着我 sister。这就是 family，温暖常 have。家业很 big，表哥是 cousin，堂弟是 brother，怀抱着 baby。找一找 uncle，看一看 aunt，分一些 some，快乐不 small。"
              },
              {
                id: 'pep_3a_u3',
                title: 'Unit 3 Schoolbag & Items',
                chineseTitle: '我的学习用品 (神奇动物)',
                words: [
                  { english: 'like', chinese: '喜欢', phonetic: 'laɪk' },
                  { english: 'dog', chinese: '狗', phonetic: 'dɒɡ' },
                  { english: 'pet', chinese: '宠物', phonetic: 'pet' },
                  { english: 'cat', chinese: '猫', phonetic: 'kæt' },
                  { english: 'fish', chinese: '鱼；鱼肉', phonetic: 'fɪʃ' },
                  { english: 'bird', chinese: '鸟', phonetic: 'bɜːd' },
                  { english: 'rabbit', chinese: '兔', phonetic: 'ˈræbɪt' },
                  { english: 'go', chinese: '去；走', phonetic: 'ɡəʊ' },
                  { english: 'zoo', chinese: '动物园', phonetic: 'zuː' },
                  { english: 'fox', chinese: '狐狸', phonetic: 'fɒks' },
                  { english: 'Miss', chinese: '（学生对女教师的称呼）老师；女士', phonetic: 'mɪs' },
                  { english: 'panda', chinese: '大熊猫', phonetic: 'ˈpændə' },
                  { english: 'red panda', chinese: '小熊猫', phonetic: 'red ˈpændə' },
                  { english: 'cute', chinese: '可爱的', phonetic: 'kjuːt' },
                  { english: 'monkey', chinese: '猴子', phonetic: 'ˈmʌŋki' },
                  { english: 'tiger', chinese: '老虎', phonetic: 'ˈtaɪɡə(r)' },
                  { english: 'elephant', chinese: '大象', phonetic: 'ˈelɪfənt' },
                  { english: 'lion', chinese: '狮；狮子', phonetic: 'ˈlaɪən' },
                  { english: 'animal', chinese: '动物', phonetic: 'ˈænɪml' },
                  { english: 'giraffe', chinese: '长颈鹿', phonetic: 'dʒəˈrɑːf' },
                  { english: 'tall', chinese: '高的', phonetic: 'tɔːl' },
                  { english: 'fast', chinese: '快的', phonetic: 'fɑːst' }
                ],
                rhythmicChant: "喜欢 like，小狗 dog，它是好 pet。可爱 cat，水里 fish，空中 bird，蹦跳 rabbit。我们要 go，来到那 zoo，狡猾 fox，指给那 Miss。胖大 panda，和小 red panda，长得真 cute。淘气 monkey，凶猛 tiger，温顺 elephant，威风 lion，都是好 animal。高高 giraffe，身子特别 tall，跑得非常 fast。"
              },
              {
                id: 'pep_3a_u4',
                title: 'Unit 4 Body & Face',
                chineseTitle: '我的身体与脸庞 (植物世界)',
                words: [
                  { english: 'apple', chinese: '苹果', phonetic: 'ˈæpl' },
                  { english: 'banana', chinese: '香蕉', phonetic: 'bəˈnɑːnə' },
                  { english: 'farm', chinese: '农场', phonetic: 'fɑːm' },
                  { english: 'air', chinese: '空气', phonetic: 'eə(r)' },
                  { english: 'orange', chinese: '橙子；柑橘', phonetic: 'ˈɒrɪndʒ' },
                  { english: 'grape', chinese: '葡萄', phonetic: 'ɡreɪp' },
                  { english: 'school', chinese: '学校', phonetic: 'skuːl' },
                  { english: 'garden', chinese: '花园', phonetic: 'ˈɡɑːdn' },
                  { english: 'need', chinese: '需要', phonetic: 'niːd' },
                  { english: 'water', chinese: '给……浇水；水', phonetic: 'ˈwɔːtə(r)' },
                  { english: 'flower', chinese: '花；花朵', phonetic: 'ˈflaʊə(r)' },
                  { english: 'grass', chinese: '草；草地', phonetic: 'ɡrɑːs' },
                  { english: 'plant', chinese: '种植；植物', phonetic: 'plɑːnt' },
                  { english: 'new', chinese: '新的', phonetic: 'njuː' },
                  { english: 'tree', chinese: '树', phonetic: 'triː' },
                  { english: 'sun', chinese: '阳光；太阳', phonetic: 'sʌn' },
                  { english: 'give', chinese: '给', phonetic: 'ɡɪv' },
                  { english: 'us', chinese: '我们', phonetic: 'ʌs' },
                  { english: 'them', chinese: '它们；他们；她们', phonetic: 'ðəm, ðem' }
                ],
                rhythmicChant: "红红 apple，甜甜 banana，长在 farm。呼吸 air，摘个 orange，剥串 grape。放学回 school，走进 garden。我们 need，动手 water，浇灌 flower，修剪 grass。亲手去 plant，一棵 new 的 tree。沐浴着 sun，它 give 我们 us，丰收的 them。"
              },
              {
                id: 'pep_3a_u5',
                title: 'Unit 5 Beautiful Colours',
                chineseTitle: '缤纷色彩',
                words: [
                  { english: 'colour', chinese: '颜色', phonetic: 'ˈkʌlə(r)' },
                  { english: 'orange', chinese: '橙红色；橙红色的', phonetic: 'ˈɒrɪndʒ' },
                  { english: 'green', chinese: '绿色；绿色的', phonetic: 'ɡriːn' },
                  { english: 'red', chinese: '红色；红色的', phonetic: 'red' },
                  { english: 'blue', chinese: '蓝色；蓝色的', phonetic: 'bluː' },
                  { english: 'make', chinese: '使出现；做', phonetic: 'meɪk' },
                  { english: 'purple', chinese: '紫色；紫色的', phonetic: 'ˈpɜːpl' },
                  { english: 'brown', chinese: '棕色；棕色的', phonetic: 'braʊn' },
                  { english: 'bear', chinese: '熊', phonetic: 'beə(r)' },
                  { english: 'yellow', chinese: '黄色；黄色的', phonetic: 'ˈjeləʊ' },
                  { english: 'duck', chinese: '鸭', phonetic: 'dʌk' },
                  { english: 'sea', chinese: '海；海洋', phonetic: 'siː' },
                  { english: 'pink', chinese: '粉色；粉色的', phonetic: 'pɪŋk' },
                  { english: 'draw', chinese: '画', phonetic: 'drɔː' },
                  { english: 'white', chinese: '白色；白色的', phonetic: 'waɪt' },
                  { english: 'black', chinese: '黑色；黑色的', phonetic: 'blæk' }
                ],
                rhythmicChant: "奇妙 colour，橙红 orange，翠绿 green，火红 red，深蓝 blue。让我们 make，调出 purple，画像 brown 给大 bear，涂上 yellow 给小 duck。迎着大 sea，染成 pink。铺好画纸 draw，一朵 white 云，一匹 black 马。"
              },
              {
                id: 'pep_3a_u6',
                title: 'Unit 6 Happy Birthday',
                chineseTitle: '生日数字',
                words: [
                  { english: 'old', chinese: '（多少）岁；年纪；旧的', phonetic: 'əʊld' },
                  { english: 'five', chinese: '五', phonetic: 'faɪv' },
                  { english: 'year', chinese: '年纪；年', phonetic: 'jɪə(r)' },
                  { english: 'one', chinese: '一', phonetic: 'wʌn' },
                  { english: 'two', chinese: '二', phonetic: 'tuː' },
                  { english: 'three', chinese: '三', phonetic: 'θriː' },
                  { english: 'four', chinese: '四', phonetic: 'fɔː(r)' },
                  { english: 'ten', chinese: '十', phonetic: 'ten' },
                  { english: 'six', chinese: '六', phonetic: 'sɪks' },
                  { english: 'seven', chinese: '七', phonetic: 'ˈsevn' },
                  { english: 'eight', chinese: '八', phonetic: 'eɪt' },
                  { english: 'nine', chinese: '九', phonetic: 'naɪn' },
                  { english: 'o\'clock', chinese: '（表示整点）……点钟', phonetic: 'əˈklɒk' },
                  { english: 'cut', chinese: '切块', phonetic: 'kʌt' },
                  { english: 'eat', chinese: '吃', phonetic: 'iːt' },
                  { english: 'cake', chinese: '蛋糕', phonetic: 'keɪk' }
                ],
                rhythmicChant: "你几岁 old，我到 five 的 year。数 one, two, three, 还有 four。双手合 ten，数字 six, seven, eight, 还有 nine。钟敲几 o'clock，用刀 cut，大家 eat，美味 cake！"
              }
            ]
          },
          {
            id: 'pep_3b',
            title: '三年级下册 (Grade 3 Vol 2)',
            units: [
              {
                id: 'pep_3b_u1',
                title: 'Unit 1 Classmates & Origin',
                chineseTitle: '同学与主要来源',
                words: [
                  { english: 'where', chinese: '在哪里；到哪里', phonetic: 'weə(r)' },
                  { english: 'from', chinese: '来自，从……来', phonetic: 'frɒm' },
                  { english: 'about', chinese: '关于；大约', phonetic: 'ˈəbaʊt' },
                  { english: 'today', chinese: '今天', phonetic: 'təˈdeɪ' },
                  { english: 'teacher', chinese: '教师', phonetic: 'ˈtiːtʃə(r)' },
                  { english: 'student', chinese: '学生', phonetic: 'ˈstjuːdnt' },
                  { english: 'after', chinese: '在……后面', phonetic: 'ˈɑːftə(r)' },
                  { english: 'who', chinese: '谁；什么人', phonetic: 'huː' },
                  { english: 'girl', chinese: '女孩', phonetic: 'ɡɜːl' },
                  { english: 'neighbour', chinese: '邻居', phonetic: 'ˈneɪbə(r)' },
                  { english: 'boy', chinese: '男孩', phonetic: 'bɔɪ' },
                  { english: 'woman', chinese: '成年女子；妇女', phonetic: 'ˈwʊmən' },
                  { english: 'man', chinese: '成年男子；男人', phonetic: 'mæn' },
                  { english: 'Mr', chinese: '先生', phonetic: 'ˈmɪstə(r)' },
                  { english: 'classmate', chinese: '同班同学', phonetic: 'ˈklɑːsmeɪt' },
                  { english: 'he', chinese: '他', phonetic: 'hiː' },
                  { english: 'also', chinese: '也', phonetic: 'ˈɔːlsəʊ' },
                  { english: 'English', chinese: '英语的；英语', phonetic: 'ˈɪŋɡlɪʃ' },
                  { english: 'she', chinese: '她', phonetic: 'ʃiː' },
                  { english: 'very', chinese: '很；非常；十分', phonetic: 'ˈveri' },
                  { english: 'UK', chinese: '英国', phonetic: 'ˌjuː ˈkeɪ' },
                  { english: 'China', chinese: '中国', phonetic: 'ˈtʃaɪnə' },
                  { english: 'Canada', chinese: '加拿大', phonetic: 'ˈkænədə' },
                  { english: 'USA', chinese: '美国', phonetic: 'ˌjuː es ˈeɪ' }
                ],
                rhythmicChant: "人在 where，你 from 哪，听 talk about，精彩 today。温和 teacher，好学 student，走在 after。谁是 who，那个 girl，我的 neighbour。帅气 boy，高雅 woman，成熟 man，那是 Mr。我的 classmate，he 喜欢，also 讲 English，she 觉得 very 棒。来自 UK，还有 China，去往 Canada，玩在 USA。"
              },
              {
                id: 'pep_3b_u2',
                title: 'Unit 2 My Body & Pets',
                chineseTitle: '我的身体与宠物',
                words: [
                  { english: 'has', chinese: '具有（某种外表、特性或特征）', phonetic: 'hæz' },
                  { english: 'long', chinese: '（长度或距离）长的', phonetic: 'lɒŋ' },
                  { english: 'body', chinese: '身体', phonetic: 'ˈbɒdi' },
                  { english: 'short', chinese: '短的；个子矮的', phonetic: 'ʃɔːt' },
                  { english: 'leg', chinese: '腿', phonetic: 'leg' },
                  { english: 'right', chinese: '指判断准确，确切，恰当', phonetic: 'raɪt' },
                  { english: 'fat', chinese: '肥的；肥胖的', phonetic: 'fæt' },
                  { english: 'thin', chinese: '瘦的', phonetic: 'θɪn' },
                  { english: 'slow', chinese: '缓慢的；慢的', phonetic: 'sləʊ' },
                  { english: 'love', chinese: '喜爱；爱', phonetic: 'lʌv' },
                  { english: 'tail', chinese: '尾；尾巴', phonetic: 'teɪl' },
                  { english: 'her', chinese: '她；她的', phonetic: 'hɜː(r)' },
                  { english: 'gift', chinese: '礼物', phonetic: 'ɡɪft' },
                  { english: 'picture', chinese: '图画；绘画', phonetic: 'ˈpɪktʃə(r)' },
                  { english: 'card', chinese: '贺卡；卡片', phonetic: 'kɑːd' },
                  { english: 'sing', chinese: '唱；演唱', phonetic: 'sɪŋ' },
                  { english: 'dance', chinese: '跳舞', phonetic: 'dɑːns' },
                  { english: 'talk', chinese: '说话；谈话', phonetic: 'tɔːk' },
                  { english: 'face', chinese: '脸；面孔', phonetic: 'feɪs' },
                  { english: 'all', chinese: '所有；全部', phonetic: 'ɔːl' },
                  { english: 'song', chinese: '歌；歌曲', phonetic: 'sɒŋ' },
                  { english: 'or', chinese: '或；或者；还是', phonetic: 'ɔː(r)' },
                  { english: 'so', chinese: '这么，那么', phonetic: 'səʊ' },
                  { english: 'much', chinese: '许多；大量', phonetic: 'mʌtʃ' }
                ],
                rhythmicChant: "它 has 尾巴，很 long 的 body，还有 short 的 leg。你说 right，不 fat 也不 thin，跑得 slow，但很可爱。我 love，摇着 tail，它是 her 的 gift。看这 picture，做张 card，大声 sing，快乐 dance，开心 talk。红红 face，我们 all，唱支 song，这 or 那，so 开心，非常 much。"
              },
              {
                id: 'pep_3b_u3',
                title: 'Unit 3 Learning Tools & Senses',
                chineseTitle: '学习用品与感官',
                words: [
                  { english: 'eraser', chinese: '橡皮', phonetic: 'ɪˈreɪzə(r)' },
                  { english: 'find', chinese: '找到；找回', phonetic: 'faɪnd' },
                  { english: 'ruler', chinese: '直尺', phonetic: 'ˈruːlə(r)' },
                  { english: 'pen', chinese: '钢笔', phonetic: 'pen' },
                  { english: 'pencil', chinese: '铅笔', phonetic: 'ˈpensl' },
                  { english: 'book', chinese: '书；书籍', phonetic: 'bʊk' },
                  { english: 'bag', chinese: '包；袋', phonetic: 'bæɡ' },
                  { english: 'paper', chinese: '纸', phonetic: 'ˈpeɪpə(r)' },
                  { english: 'these', chinese: '这些', phonetic: 'ðiːz' },
                  { english: 'see', chinese: '看见', phonetic: 'siː' },
                  { english: 'smell', chinese: '闻（气味）', phonetic: 'smel' },
                  { english: 'taste', chinese: '尝（味道）', phonetic: 'taste' },
                  { english: 'hear', chinese: '听见；听到', phonetic: 'hɪə(r)' },
                  { english: 'touch', chinese: '触摸；碰', phonetic: 'touch' },
                  { english: 'nose', chinese: '鼻；鼻子', phonetic: 'nəʊz' },
                  { english: 'tongue', chinese: '舌；舌头', phonetic: 'tongue' },
                  { english: 'class', chinese: '课；班级', phonetic: 'klɑːs' },
                  { english: 'in class', chinese: '在课堂上', phonetic: 'in class' },
                  { english: 'computer', chinese: '计算机；电脑', phonetic: 'kəmˈpjuːtə(r)' },
                  { english: 'learn', chinese: '学；学习', phonetic: 'lɜːn' }
                ],
                rhythmicChant: "拿块 eraser，去 find 丢失的 ruler。准备 pen，削好 pencil，翻开 book，塞进 bag，铺平 paper。把 these 东西收齐，用 eye 来看 see，用 nose 闻 smell，用 tongue 尝 taste，用 ear 听 hear，用 hand 摸 touch。我们在 class，in class 里面，用 computer 去 learn 新知识。"
              },
              {
                id: 'pep_3b_u4',
                title: 'Unit 4 Healthy Food & Fruit',
                chineseTitle: '健康食品与水果',
                words: [
                  { english: 'breakfast', chinese: '早餐；早饭', phonetic: 'ˈbrekfəst' },
                  { english: 'time', chinese: '时间', phonetic: 'taɪm' },
                  { english: 'bread', chinese: '面包', phonetic: 'bred' },
                  { english: 'egg', chinese: '（作食物用的）蛋；鸡蛋', phonetic: 'eɡ' },
                  { english: 'milk', chinese: '（牛或羊等的）奶', phonetic: 'milk' },
                  { english: 'noodle', chinese: '面条', phonetic: 'ˈnuːdl' },
                  { english: 'juice', chinese: '果汁', phonetic: 'dʒuːs' },
                  { english: 'rice', chinese: '大米；米饭', phonetic: 'raɪs' },
                  { english: 'meat', chinese: '肉', phonetic: 'miːt' },
                  { english: 'vegetable', chinese: '蔬菜', phonetic: 'ˈvedʒtəbl' },
                  { english: 'healthy', chinese: '健康的', phonetic: 'ˈhelθi' },
                  { english: 'plate', chinese: '盘子', phonetic: 'plate' },
                  { english: 'soup', chinese: '汤', phonetic: 'suːp' },
                  { english: 'fruit', chinese: '水果', phonetic: 'fruːt' },
                  { english: 'colourful', chinese: '五彩缤纷的', phonetic: 'colourful' },
                  { english: 'candy', chinese: '糖果', phonetic: 'ˈkændi' },
                  { english: 'yummy', chinese: '很好吃的', phonetic: 'yummy' }
                ],
                rhythmicChant: "吃些 breakfast，到了 time。松软 bread，营养 egg，浓纯 milk，热气 noodle，鲜榨 juice。还有大米 rice，美味 meat，新鲜 vegetable，都是 healthy 食品。端来 plate，盛碗 soup，摆好 fruit，色彩 colourful，少吃 candy，真的 yummy。"
              },
              {
                id: 'pep_3b_u5',
                title: 'Unit 5 Room & Placement',
                chineseTitle: '房间物品与方位',
                words: [
                  { english: 'boat', chinese: '小船；舟', phonetic: 'bəʊt' },
                  { english: 'cool', chinese: '酷的，绝妙的', phonetic: 'kuːl' },
                  { english: 'keep', chinese: '保有；留着', phonetic: 'kiːp' },
                  { english: 'at', chinese: '在（某处）', phonetic: 'æt' },
                  { english: 'home', chinese: '家；住所', phonetic: 'həʊm' },
                  { english: 'ball', chinese: '球', phonetic: 'bɔːl' },
                  { english: 'doll', chinese: '玩偶；玩具娃娃', phonetic: 'dɒl' },
                  { english: 'car', chinese: '小汽车；轿车', phonetic: 'kɑː(r)' },
                  { english: 'on', chinese: '在……上', phonetic: 'ɒn' },
                  { english: 'shelf', chinese: '架子', phonetic: 'ʃelf' },
                  { english: 'in', chinese: '在……内；在……中', phonetic: 'ɪn' },
                  { english: 'box', chinese: '盒子', phonetic: 'boks' },
                  { english: 'cap', chinese: '帽子', phonetic: 'kæp' },
                  { english: 'map', chinese: '地图', phonetic: 'mæp' },
                  { english: 'under', chinese: '在……下面', phonetic: 'ˈʌndə(r)' },
                  { english: 'still', chinese: '还是；仍然', phonetic: 'stɪl' },
                  { english: 'put', chinese: '放；安置', phonetic: 'pʊt' }
                ],
                rhythmicChant: "折只 boat，长得 cool，我想 keep，留在 at our home。皮球 ball，洋娃娃 doll，小汽车 car，摆放在 on the shelf。收在 in the box。我的 cap，我的 map，掉到 under 椅子下，still 在那里，赶紧 put 好。"
              },
              {
                id: 'pep_3b_u6',
                title: 'Unit 6 Numbers & Saving',
                chineseTitle: '数字与储蓄',
                words: [
                  { english: 'fifteen', chinese: '十五', phonetic: 'fifteen' },
                  { english: 'twelve', chinese: '十二', phonetic: 'twelve' },
                  { english: 'fourteen', chinese: '十四', phonetic: 'fourteen' },
                  { english: 'thirteen', chinese: '十三', phonetic: 'thirteen' },
                  { english: 'eleven', chinese: '十一', phonetic: 'eleven' },
                  { english: 'twenty', chinese: '二十', phonetic: 'twenty' },
                  { english: 'seventeen', chinese: '十七', phonetic: 'seventeen' },
                  { english: 'sixteen', chinese: '十六', phonetic: 'sixteen' },
                  { english: 'eighteen', chinese: '十八', phonetic: 'eighteen' },
                  { english: 'nineteen', chinese: '十九', phonetic: 'nineteen' },
                  { english: 'piggy bank', chinese: '猪形储钱罐', phonetic: 'piggy bank' },
                  { english: 'pay', chinese: '付费', phonetic: 'peɪ' },
                  { english: 'back', chinese: '回到原处', phonetic: 'bæk' }
                ],
                rhythmicChant: "数到 fifteen，还有 twelve，接着 fourteen, thirteen, eleven 和 twenty。再数 seventeen, sixteen, eighteen 以及 nineteen。全装进 piggy bank，需要 pay 钱，再拿 back 出来。"
              }
            ]
          },
          {
            id: 'pep_4a',
            title: '四年级上册 (Grade 4 Vol 1)',
            units: [
              {
                id: 'pep_4a_u1',
                title: 'Unit 1 Professions & Chores',
                chineseTitle: '职业与家务',
                words: [
                  { english: 'PE', chinese: '体育（课）', phonetic: 'PE' },
                  { english: 'job', chinese: '工作；职业', phonetic: 'dʒɒb' },
                  { english: 'doctor', chinese: '医生', phonetic: 'ˈdɒktə(r)' },
                  { english: 'farmer', chinese: '农场主；农民', phonetic: 'ˈfɑːmər' },
                  { english: 'nurse', chinese: '护士', phonetic: 'nɜːs' },
                  { english: 'office worker', chinese: '公司职员', phonetic: 'office worker' },
                  { english: 'factory worker', chinese: '工厂工人', phonetic: 'factory worker' },
                  { english: 'busy', chinese: '忙碌的', phonetic: 'ˈbɪzi' },
                  { english: 'tired', chinese: '疲倦的', phonetic: 'ˈtaɪəd' },
                  { english: 'chore', chinese: '家庭杂务', phonetic: 'tʃɔː(r)' },
                  { english: 'cook', chinese: '烹饪；煮', phonetic: 'kʊk' },
                  { english: 'clean', chinese: '打扫；干净的', phonetic: 'clean' },
                  { english: 'room', chinese: '房间', phonetic: 'ruːm' },
                  { english: 'look after', chinese: '照顾', phonetic: 'look after' },
                  { english: 'sweep', chinese: '扫', phonetic: 'suːp' },
                  { english: 'floor', chinese: '地板；地面', phonetic: 'flɔː(r)' },
                  { english: 'together', chinese: '在一起；共同', phonetic: 'together' },
                  { english: 'people', chinese: '人；人们', phonetic: 'ˈpiːpl' },
                  { english: 'child', chinese: '儿童；小孩', phonetic: 'tʃaɪld' }
                ],
                rhythmicChant: "上完 PE，梦想 job。当个 doctor，做个 farmer，或者 nurse，或是 office worker 与 factory worker。每天 busy，觉得 tired，来做 chore：动手 cook，打扫 clean 整个 room。我们 look after 彼此，赶紧 sweep 干净 floor。我们 together，让所有 people，以及 child，都开开心心。"
              },
              {
                id: 'pep_4a_u2',
                title: 'Unit 2 Friends & Actions',
                chineseTitle: '朋友与活动',
                words: [
                  { english: 'his', chinese: '他的', phonetic: 'hɪz' },
                  { english: 'strong', chinese: '强壮的', phonetic: 'strɒŋ' },
                  { english: 'hair', chinese: '头发', phonetic: 'heə(r)' },
                  { english: 'also', chinese: '也', phonetic: 'ˈɔːlsəʊ' },
                  { english: 'kind', chinese: '友好的', phonetic: 'kaɪnd' },
                  { english: 'quiet', chinese: '文静的', phonetic: 'ˈkwaɪət' },
                  { english: 'best', chinese: '最好的', phonetic: 'best' },
                  { english: 'read', chinese: '阅读', phonetic: 'riːd' },
                  { english: 'Chinese', chinese: '中文；中国人；中国的', phonetic: 'Chinese' },
                  { english: 'play', chinese: '玩耍', phonetic: 'play' },
                  { english: 'game', chinese: '游戏', phonetic: 'ɡeɪm' },
                  { english: 'football', chinese: '足球运动', phonetic: 'ˈfʊtbɔːl' },
                  { english: 'basketball', chinese: '篮球运动', phonetic: 'ˈbɑːskɪtbɔːl' },
                  { english: 'always', chinese: '总是', phonetic: 'ˈɔːlweɪz' }
                ],
                rhythmicChant: "看 his 身影，多么 strong 的身体，理着短 hair。他 also 很好，态度 kind，作风 quiet，是我 best 的朋友。我们一起 read 课本，学好 Chinese。大家 play 新 game，踢踢 football，打打 basketball，我们 always 欢快无比。"
              },
              {
                id: 'pep_4a_u3',
                title: 'Unit 3 School, Parks & Communities',
                chineseTitle: '设施与场所',
                words: [
                  { english: 'afternoon', chinese: '下午', phonetic: 'ˌɑːftəˈnuːn' },
                  { english: 'there', chinese: '在那里', phonetic: 'ðeə(r)' },
                  { english: 'playground', chinese: '游乐场；操场', phonetic: 'ˈpleɪɡraʊnd' },
                  { english: 'park', chinese: '公园', phonetic: 'pɑːk' },
                  { english: 'over', chinese: '在……的远端或对面', phonetic: 'ˈəʊvə(r)' },
                  { english: 'hospital', chinese: '医院', phonetic: 'ˈhɒspɪtl' },
                  { english: 'shop', chinese: '商店', phonetic: 'ʃɒp' },
                  { english: 'toilet', chinese: '厕所；卫生间', phonetic: 'ˈtɪələt' },
                  { english: 'bus stop', chinese: '公共汽车站', phonetic: 'bus stop' },
                  { english: 'library', chinese: '图书馆', phonetic: 'ˈlaɪbrəri' },
                  { english: 'sport', chinese: '体育运动', phonetic: 'spɔːt' },
                  { english: 'walk', chinese: '散步；行走', phonetic: 'walk' },
                  { english: 'community', chinese: '社区', phonetic: 'community' },
                  { english: 'favourite', chinese: '最喜欢的', phonetic: 'ˈfeɪvərɪt' },
                  { english: 'place', chinese: '地方；场所', phonetic: 'pleɪs' },
                  { english: 'photo', chinese: '照片', phonetic: 'ˈfəʊtəʊ' },
                  { english: 'story', chinese: '故事', phonetic: 'ˈstɔːri' },
                  { english: 'buy', chinese: '购买', phonetic: 'baɪ' }
                ],
                rhythmicChant: "在这个 afternoon，我们来到 there 的 playground，穿过 park。在那边的 over，有 hospital，还有 busy 的 shop，以及 clean 的 toilet 和 bus stop。走进 library，开展 sport，自在 walk。在我们的 community，每个人有 favourite 的 place，拍张 photo，听听 story，还去 buy 点糖果。"
              },
              {
                id: 'pep_4a_u4',
                title: 'Unit 4 Community Workers',
                chineseTitle: '身边的劳动者',
                words: [
                  { english: 'firefighter', chinese: '消防队员', phonetic: 'firefighter' },
                  { english: 'why', chinese: '为什么', phonetic: 'waɪ' },
                  { english: 'driver', chinese: '司机', phonetic: 'ˈdraɪvə(r)' },
                  { english: 'cleaner', chinese: '清洁工', phonetic: 'cleaner' },
                  { english: 'cook', chinese: '厨师', phonetic: 'kʊk' },
                  { english: 'delivery worker', chinese: '快递员', phonetic: 'delivery worker' },
                  { english: 'police officer', chinese: '警察；警员', phonetic: 'police officer' },
                  { english: 'a lot of', chinese: '大量；许多', phonetic: 'a lot of' },
                  { english: 'now', chinese: '现在', phonetic: 'naʊ' },
                  { english: 'make the bed', chinese: '铺床', phonetic: 'make the bed' },
                  { english: 'old', chinese: '过去的；年纪大的', phonetic: 'əʊld' },
                  { english: 'tell', chinese: '讲述；告诉', phonetic: 'tel' },
                  { english: 'everyone', chinese: '每人', phonetic: 'everyone' }
                ],
                rhythmicChant: "勇敢 firefighter，你知道 why 吗？辛劳 driver，辛勤 cleaner，快乐 cook，穿梭 delivery worker，威严 police officer。他们做了 a lot of 贡献。而 now，我要学会 make the bed。听听 old 的光荣，让我们 tell 给 everyone 吧。"
              },
              {
                id: 'pep_4a_u5',
                title: 'Unit 5 Weather & Activities',
                chineseTitle: '天气与户外活动',
                words: [
                  { english: 'speak', chinese: '说话；发言', phonetic: 'spiːk' },
                  { english: 'weather', chinese: '天气', phonetic: 'ˈweðə(r)' },
                  { english: 'sunny', chinese: '阳光充足的', phonetic: 'ˈsʌni' },
                  { english: 'hot', chinese: '热的', phonetic: 'hɒt' },
                  { english: 'bad', chinese: '令人不快的；坏的', phonetic: 'bæd' },
                  { english: 'cold', chinese: '冷的', phonetic: 'kəʊld' },
                  { english: 'windy', chinese: '多风的', phonetic: 'ˈwɪndi' },
                  { english: 'cloudy', chinese: '多云的', phonetic: 'ˈklaʊdi' },
                  { english: 'rainy', chinese: '阴雨的', phonetic: 'rainy' },
                  { english: 'snowy', chinese: '多雪的', phonetic: 'snowy' },
                  { english: 'cool', chinese: '凉爽的', phonetic: 'kuːl' },
                  { english: 'warm', chinese: '温暖的', phonetic: 'wɔːm' },
                  { english: 'tomorrow', chinese: '在明天', phonetic: 'təˈmɒrəʊ' },
                  { english: 'rain', chinese: '下雨；雨', phonetic: 'reɪn' },
                  { english: 'closed', chinese: '关闭的', phonetic: 'closed' },
                  { english: 'film', chinese: '电影', phonetic: 'fɪlm' },
                  { english: 'idea', chinese: '想法；主意', phonetic: 'aɪˈdɪə' },
                  { english: 'fly', chinese: '飞', phonetic: 'flaɪ' },
                  { english: 'kite', chinese: '风筝', phonetic: 'kaɪt' },
                  { english: 'snowman', chinese: '雪人', phonetic: 'snowman' },
                  { english: 'fun', chinese: '乐趣', phonetic: 'fʌn' },
                  { english: 'their', chinese: '他们的', phonetic: 'ðeə(r)' },
                  { english: 'swim', chinese: '游泳', phonetic: 'swɪm' },
                  { english: 'Ms', chinese: '女士', phonetic: 'Ms' },
                  { english: 'Sydney', chinese: '悉尼', phonetic: 'Sydney' }
                ],
                rhythmicChant: "听我 speak，今天 weather：有时 sunny 有时 hot，别怕 bad 天气。虽然 cold，狂风 windy，天空 cloudy，还有 rainy 和 snowy。最爱 cool 凉爽与 warm 温暖。等到 tomorrow，如果 rain，公园 closed，我们就去看 film。这好 idea！去户外 fly，放起 kite，堆个 snowman，真是大 fun。这是 their 的选择，我们去 swim。Ms 告诉我们，那是美丽的 Sydney。"
              },
              {
                id: 'pep_4a_u6',
                title: 'Unit 6 Seasons & Clothes',
                chineseTitle: '季节与服饰',
                words: [
                  { english: 'whose', chinese: '谁的', phonetic: 'huːz' },
                  { english: 'sweater', chinese: '毛衣', phonetic: 'ˈswetə(r)' },
                  { english: 'sock', chinese: '短袜', phonetic: 'sɒk' },
                  { english: 'mine', chinese: '我的', phonetic: 'maɪn' },
                  { english: 'wear', chinese: '穿；戴', phonetic: 'wear' },
                  { english: 'shirt', chinese: '衬衫', phonetic: 'ʃɜːt' },
                  { english: 'coat', chinese: '大衣；外套', phonetic: 'kəʊt' },
                  { english: 'dress', chinese: '连衣裙', phonetic: 'dres' },
                  { english: 'which', chinese: '哪一个', phonetic: 'wɪtʃ' },
                  { english: 'season', chinese: '季节', phonetic: 'ˈsiːzn' },
                  { english: 'winter', chinese: '冬天', phonetic: 'ˈwɪntə(r)' },
                  { english: 'snow', chinese: '下雪；雪', phonetic: 'snəʊ' },
                  { english: 'get together', chinese: '聚会', phonetic: 'get together' },
                  { english: 'spring', chinese: '春天', phonetic: 'sprɪŋ' },
                  { english: 'summer', chinese: '夏天', phonetic: 'ˈsʌmə(r)' },
                  { english: 'autumn', chinese: '秋天', phonetic: 'ˈɔːtəm' },
                  { english: 'T-shirt', chinese: 'T恤衫', phonetic: 'T-shirt' },
                  { english: 'fall', chinese: '落下', phonetic: 'fɔːl' },
                  { english: 'leaf', chinese: '叶', phonetic: 'leaf' },
                  { english: 'glove', chinese: '手套', phonetic: 'glove' },
                  { english: 'then', chinese: '然后；那时', phonetic: 'ðen' }
                ],
                rhythmicChant: "猜猜 whose 衣服？温暖 sweater，舒适 sock，都是 mine 的。穿戴 wear 整齐：帅气 shirt，保暖 coat，好看 dress。你们 which 喜欢？四季 season 在轮换：寒冷 winter，白净 snow，大家 get together。绿意 spring，酷热 summer，金黄 autumn，穿上 T-shirt。看着秋叶 fall，一片片 leaf，戴好 glove，then 我们再出发。"
              }
            ]
          },
          {
            id: 'pep_4b',
            title: '四年级下册 (Grade 4 Vol 2)',
            units: [
              {
                id: 'pep_4b_u1',
                title: 'Unit 1 Classroom Rules',
                chineseTitle: '教室规则与环境',
                words: [
                  { english: 'sorry', chinese: '对不起', phonetic: 'ˈsɒri' },
                  { english: 'hurry up', chinese: '快点；赶快', phonetic: 'hurry up' },
                  { english: 'late', chinese: '迟到', phonetic: 'leɪt' },
                  { english: 'class', chinese: '课；课程；班级', phonetic: 'klɑːs' },
                  { english: 'ready', chinese: '准备好', phonetic: 'ˈredi' },
                  { english: 'rule', chinese: '规则；规章', phonetic: 'ruːl' },
                  { english: 'classroom', chinese: '教室', phonetic: 'ˈklɑːsruːm' },
                  { english: 'turn off', chinese: '关掉', phonetic: 'turn off' },
                  { english: 'light', chinese: '灯；光', phonetic: 'laɪt' },
                  { english: 'blackboard', chinese: '黑板', phonetic: 'ˈblækbɔːd' },
                  { english: 'desk', chinese: '书桌', phonetic: 'desk' },
                  { english: 'chair', chinese: '椅子', phonetic: 'tʃeə(r)' },
                  { english: 'tidy', chinese: '整洁的；整理', phonetic: 'ˈtaɪdi' },
                  { english: 'music', chinese: '音乐', phonetic: 'ˈmjuːzɪk' },
                  { english: 'door', chinese: '门', phonetic: 'dɔː(r)' },
                  { english: 'window', chinese: '窗', phonetic: 'ˈwɪndəʊ' },
                  { english: 'fan', chinese: '风扇', phonetic: 'fæn' },
                  { english: 'when', chinese: '当……时', phonetic: 'wen' },
                  { english: 'understand', chinese: '懂；理解', phonetic: 'ˌʌndəˈstænd' },
                  { english: 'wall', chinese: '墙；壁', phonetic: 'wɔːl' },
                  { english: 'newspaper', chinese: '报纸', phonetic: 'ˈnjuːzpeɪpə(r)' },
                  { english: 'hand out', chinese: '分发', phonetic: 'hand out' },
                  { english: 'workbook', chinese: '练习册；作业本', phonetic: 'workbook' }
                ],
                rhythmicChant: "说声 sorry，赶紧 hurry up，免得 late 赶不上 class。上课 ready，遵守 rule。来到 classroom，动手 turn off 头顶 light，擦净 blackboard，摆好 desk 和 chair，整个房间真 tidy。听着 music，关好 door 与 window，开启 fan。当 when 老师讲课，我都 understand。黑板贴在 wall 上，看着 newspaper。等老师 hand out 发完 workbook 吧。"
              },
              {
                id: 'pep_4b_u2',
                title: 'Unit 2 Home Activities',
                chineseTitle: '家庭生活与习惯',
                words: [
                  { english: 'watch', chinese: '看', phonetic: 'wɒtʃ' },
                  { english: 'TV', chinese: '电视', phonetic: 'ˌtiː ˈviː' },
                  { english: 'homework', chinese: '家庭作业', phonetic: 'ˈhəʊmwɜːk' },
                  { english: 'first', chinese: '首先；第一', phonetic: 'fɜːst' },
                  { english: 'wet', chinese: '湿的；未干的', phonetic: 'wet' },
                  { english: 'run', chinese: '跑了；奔跑', phonetic: 'rʌn' },
                  { english: 'living room', chinese: '客厅；起居室', phonetic: 'living room' },
                  { english: 'safe', chinese: '安全的', phonetic: 'seɪf' },
                  { english: 'word', chinese: '单词；字', phonetic: 'wɜːd' },
                  { english: 'wash', chinese: '洗', phonetic: 'wɒʃ' },
                  { english: 'helpful', chinese: '有帮助的', phonetic: 'ˈhelpfl' },
                  { english: 'loud', chinese: '吵闹的', phonetic: 'loud' },
                  { english: 'sleep', chinese: '睡觉', phonetic: 'sliːp' },
                  { english: 'bedroom', chinese: '卧室', phonetic: 'ˈbedruːm' },
                  { english: 'kitchen', chinese: '厨房', phonetic: 'ˈkɪtʃɪn' },
                  { english: 'study', chinese: '书房', phonetic: 'ˈstʌdi' },
                  { english: 'bathroom', chinese: '浴室；洗手间', phonetic: 'ˈbɑːθruːm' },
                  { english: 'think', chinese: '想；思考', phonetic: 'θɪŋk' },
                  { english: 'work', chinese: '工作', phonetic: 'wɜːk' },
                  { english: 'hard', chinese: '努力地', phonetic: 'hɑːd' },
                  { english: 'follow', chinese: '遵循', phonetic: 'ˈfɒləʊ' },
                  { english: 'feel', chinese: '觉得；感到', phonetic: 'feel' }
                ],
                rhythmicChant: "我想 watch 精彩 TV，但 homework 必须 first 写完。外边好 wet，不要乱 run。坐在 comfortable 的 living room，这里多么 safe。读个 word，去 wash 双手，争做 helpful 的孩子。不要大声 loud，保持安静。到了 time 去 sleep。卧室 bedroom，厨房 kitchen，还有 study 和 bathroom。我 think，应该 work，更加 hard。follow 规则，feel 快乐。"
              },
              {
                id: 'pep_4b_u3',
                title: 'Unit 3 Daily Schedule',
                chineseTitle: '一日作息',
                words: [
                  { english: 'over', chinese: '结束（的）', phonetic: 'ˈəʊvə(r)' },
                  { english: 'kid', chinese: '小孩', phonetic: 'kɪd' },
                  { english: 'dinner', chinese: '正餐', phonetic: 'ˈdɪnə(r)' },
                  { english: 'art', chinese: '美术；艺术', phonetic: 'ɑːt' },
                  { english: 'lunch', chinese: '午餐', phonetic: 'lʌntʃ' },
                  { english: 'maths', chinese: '数学', phonetic: 'mæθs' },
                  { english: 'get up', chinese: '起床', phonetic: 'get up' },
                  { english: 'go to school', chinese: '上学', phonetic: 'go to school' },
                  { english: 'go home', chinese: '回家', phonetic: 'go home' },
                  { english: 'go to bed', chinese: '上床睡觉', phonetic: 'go to bed' },
                  { english: 'want', chinese: '想要', phonetic: 'wɒnt' },
                  { english: 'clock', chinese: '时钟', phonetic: 'klɒk' },
                  { english: 'just', chinese: '只是；仅仅', phonetic: 'dʒʌst' },
                  { english: 'minute', chinese: '分钟', phonetic: 'ˈmɪnɪt' }
                ],
                rhythmicChant: "一局 over 啦，所有的 kid，来吃 dinner 吧！下午学 art，上午吃 lunch，还有 maths 课。清晨 get up，按时 go to school，放学 go home，准时 go to bed。如果你 want，看看墙上 clock，刚刚 just 过去一 minute。"
              },
              {
                id: 'pep_4b_u4',
                title: 'Unit 4 Shopping & Sizes',
                chineseTitle: '逛街购物与尺码',
                words: [
                  { english: 'trousers', chinese: '裤子', phonetic: 'ˈtraʊzəz' },
                  { english: 'pair', chinese: '一条；一副', phonetic: 'peə(r)' },
                  { english: 'clothes', chinese: '衣服；服装', phonetic: 'kləʊðz' },
                  { english: 'those', chinese: '那些', phonetic: 'ðəʊz' },
                  { english: 'shorts', chinese: '短裤', phonetic: 'shorts' },
                  { english: 'jacket', chinese: '夹克衫；短上衣', phonetic: 'jacket' },
                  { english: 'skirt', chinese: '裙子', phonetic: 'skɜːt' },
                  { english: 'dear', chinese: '亲爱的', phonetic: 'dɪə(r)' },
                  { english: 'expensive', chinese: '昂贵的', phonetic: 'expensive' },
                  { english: 'take', chinese: '买下', phonetic: 'teɪk' },
                  { english: 'cheap', chinese: '便宜的', phonetic: 'cheap' },
                  { english: 'shoe', chinese: '鞋', phonetic: 'ʃuː' },
                  { english: 'beautiful', chinese: '美丽的', phonetic: 'ˈbjuːtɪfl' },
                  { english: 'hat', chinese: '帽子', phonetic: 'hat' },
                  { english: 'sunglasses', chinese: '太阳镜；墨镜', phonetic: 'sunglasses' },
                  { english: 'free', chinese: '免费的', phonetic: 'friː' },
                  { english: 'large', chinese: '大型号的', phonetic: 'large' },
                  { english: 'size', chinese: '尺码；号', phonetic: 'saɪz' },
                  { english: 'list', chinese: '清单；目录', phonetic: 'lɪst' },
                  { english: 'try on', chinese: '试穿', phonetic: 'try on' },
                  { english: 'any', chinese: '任何的；任一的', phonetic: 'ˈeni' }
                ],
                rhythmicChant: "试穿 trousers，买上一 pair 新 clothes。选选 those，有 shorts，有 jacket，还有 skirt。哎呀 dear，这件 expensive 吗？我想要 take。如果 cheap 些更好。穿上新 shoe，配上 beautiful 礼服，戴上 hat 和 sunglasses，这些是 free 吗？挑个 large 的 size。对照购物 list，赶紧 try on 吧，无需 any 拘束。"
              },
              {
                id: 'pep_4b_u5',
                title: 'Unit 5 Farm Animals & Crops',
                chineseTitle: '农场动物与作物',
                words: [
                  { english: 'cow', chinese: '奶牛', phonetic: 'kaʊ' },
                  { english: 'horse', chinese: '马', phonetic: 'hɒs' },
                  { english: 'sheep', chinese: '羊；绵羊', phonetic: 'ʃiːp' },
                  { english: 'pig', chinese: '猪', phonetic: 'pɪɡ' },
                  { english: 'chicken', chinese: '鸡；鸡肉', phonetic: 'ˈtɪkɪn' },
                  { english: 'tomato', chinese: '西红柿', phonetic: 'təˈmɑːtəʊ' },
                  { english: 'bee', chinese: '蜜蜂', phonetic: 'biː' },
                  { english: 'mouse', chinese: '老鼠', phonetic: 'maʊs' },
                  { english: 'carrot', chinese: '胡萝卜', phonetic: 'ˈkærət' },
                  { english: 'potato', chinese: '土豆', phonetic: 'pəˈteɪtəʊ' },
                  { english: 'green bean', chinese: '青刀豆；四季豆', phonetic: 'green bean' },
                  { english: 'can', chinese: '金属罐', phonetic: 'kæn' },
                  { english: 'a box of', chinese: '一盒；一箱', phonetic: 'a box of' }
                ],
                rhythmicChant: "健壮 cow，奔驰 horse，温顺 sheep，肥嘟 piggy。捉到 chicken，摘个 tomato，听听 bee 叫。别跑 mouse，拔根 carrot，挖颗 potato，摘串 green bean。装进 can 罐头，拿来 a box of 美食。"
              },
              {
                id: 'pep_4b_u6',
                title: 'Unit 6 Table Manners & Kitchen',
                chineseTitle: '餐桌礼仪与超市',
                words: [
                  { english: 'feed', chinese: '给（人或动物）食物；饲养', phonetic: 'feed' },
                  { english: 'pass', chinese: '给；递', phonetic: 'pass' },
                  { english: 'pick', chinese: '采；摘', phonetic: 'pick' },
                  { english: 'milk', chinese: '挤奶；牛奶', phonetic: 'mɪlk' },
                  { english: 'knife', chinese: '刀', phonetic: 'naɪf' },
                  { english: 'fork', chinese: '餐叉', phonetic: 'fɔːk' },
                  { english: 'chopstick', chinese: '筷子', phonetic: 'ˈtʃɒpstɪk' },
                  { english: 'waste', chinese: '浪费', phonetic: 'weɪst' },
                  { english: 'food', chinese: '菜肴；食物', phonetic: 'fuːd' },
                  { english: 'delicious', chinese: '美味的；可口的', phonetic: 'delicious' },
                  { english: 'clear the table', chinese: '收拾餐桌', phonetic: 'clear the table' },
                  { english: 'set the table', chinese: '摆放餐具', phonetic: 'set the table' },
                  { english: 'bowl', chinese: '碗', phonetic: 'bəʊl' },
                  { english: 'spoon', chinese: '勺；匙', phonetic: 'spoon' },
                  { english: 'supermarket', chinese: '超市', phonetic: 'ˈsuːpəmɑːkɪt' },
                  { english: 'herself', chinese: '她自己', phonetic: 'herself' },
                  { english: 'week', chinese: '周；星期', phonetic: 'wiːk' },
                  { english: 'salad', chinese: '蔬菜沙拉', phonetic: 'ˈsæləd' }
                ],
                rhythmicChant: "餐前 set the table，摆好 bowl 和 spoon。饭后我们要 clear the table，平时陪妈妈去 supermarket ，学习自己打理 herself 的生活，一整个 week 都在吃美味的 salad，不要 waste 食物哦。"
              }
            ]
          }
        ]
      },
      {
        id: 'yilin',
        name: '译林版 (Yilin)',
        books: [
          {
            id: 'yilin_3a',
            title: '三年级上册',
            units: [
              {
                id: 'yilin_3a_u1',
                title: 'Unit 1 Hello!',
                chineseTitle: '你好，魔法世界',
                words: [
                  { english: 'boy', chinese: '男孩' },
                  { english: 'toy', chinese: '玩具' },
                  { english: 'joy', chinese: '欢乐' }
                ],
                rhythmicChant: "那个 boy，抱着 toy，满脸是 joy。"
              },
              {
                id: 'yilin_3a_u2',
                title: 'Unit 2 This is My Family',
                chineseTitle: '温馨家庭时光',
                words: [
                  { english: 'man', chinese: '男人' },
                  { english: 'pan', chinese: '平底锅' },
                  { english: 'fan', chinese: '电风扇' }
                ],
                rhythmicChant: "帅气 man，举着 pan，吹着大风 fan。"
              },
              {
                id: 'yilin_3a_u3',
                title: 'Unit 3 My Colors',
                chineseTitle: '彩虹精灵色彩',
                words: [
                  { english: 'red', chinese: '红色' },
                  { english: 'bed', chinese: '床' },
                  { english: 'led', chinese: '引导' }
                ],
                rhythmicChant: "漆成 red，放在 bed，把人 led 走。"
              }
            ]
          },
          {
            id: 'yilin_3b',
            title: '三年级下册',
            units: [
              {
                id: 'yilin_3b_u1',
                title: 'Unit 1 In the Classroom',
                chineseTitle: '在智慧教室',
                words: [
                  { english: 'desk', chinese: '课桌' },
                  { english: 'book', chinese: '书本' },
                  { english: 'hook', chinese: '挂钩' }
                ],
                rhythmicChant: "擦擦 desk，看本 book，挂在墙上 hook。"
              },
              {
                id: 'yilin_3b_u2',
                title: 'Unit 2 My Schoolbag',
                chineseTitle: '我的贴身背包',
                words: [
                  { english: 'ruler', chinese: '直尺' },
                  { english: 'pencil', chinese: '铅笔' },
                  { english: 'bag', chinese: '包' }
                ],
                rhythmicChant: "放进 ruler，别着 pencil，背着神气 bag。"
              }
            ]
          }
        ]
      },
      {
        id: 'external',
        name: '外研版 (NSE)',
        books: [
          {
            id: 'nse_3a',
            title: '三年级上册',
            units: [
              {
                id: 'nse_3a_u1',
                title: 'Unit 1 Classroom Play',
                chineseTitle: '课室里的小话剧',
                words: [
                  { english: 'book', chinese: '书' },
                  { english: 'cook', chinese: '厨师/烹饪' },
                  { english: 'hook', chinese: '钩子' }
                ],
                rhythmicChant: "拿着 book，看着 cook，手里攥着 hook。"
              },
              {
                id: 'nse_3a_u2',
                title: 'Unit 2 School Toys',
                chineseTitle: '校园玩具总动员',
                words: [
                  { english: 'ball', chinese: '皮球' },
                  { english: 'tall', chinese: '高挂的' },
                  { english: 'wall', chinese: '墙壁' }
                ],
                rhythmicChant: "丢个 ball，飞得 tall，击中坚硬 wall。"
              },
              {
                id: 'nse_3a_u3',
                title: 'Unit 3 How many cats?',
                chineseTitle: '有几只聪明猫？',
                words: [
                  { english: 'cat', chinese: '猫' },
                  { english: 'rat', chinese: '老鼠' },
                  { english: 'fat', chinese: '胖嘟嘟的' }
                ],
                rhythmicChant: "机智 cat，扑向 rat，气喘非常 fat。"
              }
            ]
          },
          {
            id: 'nse_3b',
            title: '三年级下册',
            units: [
              {
                id: 'nse_3b_u1',
                title: 'Unit 1 Sports Meeting',
                chineseTitle: '运动大比拼',
                words: [
                  { english: 'run', chinese: '跑步' },
                  { english: 'sun', chinese: '太阳' },
                  { english: 'bun', chinese: '餐包' }
                ],
                rhythmicChant: "迎着 sun，飞快 run，嘴里嚼着 bun。"
              },
              {
                id: 'nse_3b_u2',
                title: 'Unit 2 At the Zoo',
                chineseTitle: '奇妙大自然',
                words: [
                  { english: 'frog', chinese: '青蛙' },
                  { english: 'dog', chinese: '小狗' },
                  { english: 'jog', chinese: '慢跑' }
                ],
                rhythmicChant: "看见 frog，遛着 dog，河边一起 jog。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'junior',
    name: '初中 (Junior High)',
    versions: [
      {
        id: 'pep_junior',
        name: '人教新目标版',
        books: [

  {
    "id": "pep_7a",
    "title": "七年级上册 (Grade 7 Vol 1)",
    "units": [
      {
        "id": "pep_7a_us1",
        "title": "Starter Unit 1",
        "chineseTitle": "问好与问候",
        "words": [
          {
            "english": "hello",
            "phonetic": "həˈləʊ",
            "chinese": "interj.你好；喂"
          },
          {
            "english": "how",
            "phonetic": "haʊ",
            "chinese": "adv.怎样；如何"
          },
          {
            "english": "do",
            "phonetic": "duː; də",
            "chinese": "aux v. & v.做；干"
          },
          {
            "english": "you",
            "phonetic": "juː; jʊ",
            "chinese": "pron.你；您；你们"
          },
          {
            "english": "people",
            "phonetic": "ˈpiːpl",
            "chinese": "n.人；人们"
          },
          {
            "english": "hi",
            "phonetic": "haʊ",
            "chinese": "interj.嗨；喂"
          },
          {
            "english": "good",
            "phonetic": "ɡʊd",
            "chinese": "adj.好的"
          },
          {
            "english": "morning",
            "phonetic": "ˈmɔːnɪŋ",
            "chinese": "n.早晨；上午"
          },
          {
            "english": "and",
            "phonetic": "ænd; ənd",
            "chinese": "conj.和；又"
          },
          {
            "english": "Ms",
            "phonetic": "mɪz; məz",
            "chinese": "女士（用于女子的姓氏或姓名前，不指明婚否）"
          },
          {
            "english": "class",
            "phonetic": "klɑːs",
            "chinese": "n.班级；课"
          },
          {
            "english": "sit",
            "phonetic": "sɪt",
            "chinese": "v.坐"
          },
          {
            "english": "down",
            "phonetic": "daʊn",
            "chinese": "adv.下；向下"
          },
          {
            "english": "please",
            "phonetic": "pliːz",
            "chinese": "interj.请"
          },
          {
            "english": "can",
            "phonetic": "kæn; kən",
            "chinese": "modal v.能；会"
          },
          {
            "english": "say",
            "phonetic": "seɪ",
            "chinese": "v.说"
          },
          {
            "english": "to",
            "phonetic": "tuː; tə",
            "chinese": "prep.朝；至；（常用以构成动词不定式）"
          },
          {
            "english": "the",
            "phonetic": "ðiː; ðə; ðɪ",
            "chinese": "art.这；那（指已知或易领会到的人或事物）"
          },
          {
            "english": "I",
            "phonetic": "aɪ",
            "chinese": "pron.我"
          },
          {
            "english": "am",
            "phonetic": "æm; əm",
            "chinese": "v.是"
          },
          {
            "english": "thank",
            "phonetic": "θæŋk",
            "chinese": "v.感谢；谢谢"
          },
          {
            "english": "now",
            "phonetic": "naʊ",
            "chinese": "adv.现在；目前"
          },
          {
            "english": "my",
            "phonetic": "maɪ",
            "chinese": "pron.我的"
          },
          {
            "english": "name",
            "phonetic": "neɪm",
            "chinese": "n.名字；名称"
          },
          {
            "english": "is",
            "phonetic": "ɪz",
            "chinese": "v.是"
          },
          {
            "english": "nice",
            "phonetic": "naɪs",
            "chinese": "adj.令人愉快的；宜人的"
          },
          {
            "english": "meet",
            "phonetic": "miːt",
            "chinese": "v.遇见；相逢"
          },
          {
            "english": "so",
            "phonetic": "səʊ",
            "chinese": "conj.所以 *adv.这么；那么"
          },
          {
            "english": "what",
            "phonetic": "wɒt",
            "chinese": "pron. & adj.什么"
          },
          {
            "english": "your",
            "phonetic": "jɔː(r); jə(r)",
            "chinese": "pron.你的；您的；你们的"
          },
          {
            "english": "too",
            "phonetic": "tuː",
            "chinese": "adv.也；又；太"
          },
          {
            "english": "a",
            "phonetic": "eɪ; ə",
            "chinese": "(**an*/æn; ən/) *art.一（个，件，人，事，物）"
          },
          {
            "english": "are",
            "phonetic": "ɑː(r); ə(r)",
            "chinese": "v.是"
          },
          {
            "english": "goodbye",
            "phonetic": "ˌɡʊdˈbaɪ",
            "chinese": "interj. & n.再见；再会"
          },
          {
            "english": "may",
            "phonetic": "meɪ",
            "chinese": "modal v.可以；可能"
          },
          {
            "english": "have",
            "phonetic": "hæv; həv",
            "chinese": "v.有（第三人称单数形式为 **has*/hæz; həz/）"
          },
          {
            "english": "call",
            "phonetic": "kɔːl",
            "chinese": "v.把……叫作；给……打电话；呼唤 *n.打电话；大声呼喊"
          },
          {
            "english": "me",
            "phonetic": "miː; mɪ",
            "chinese": "pron.我（I的宾格）"
          },
          {
            "english": "fine",
            "phonetic": "faɪn",
            "chinese": "adj.健康的；美好的"
          },
          {
            "english": "great",
            "phonetic": "ɡreɪt",
            "chinese": "adj.美妙的；伟大的"
          },
          {
            "english": "that",
            "phonetic": "ðæt",
            "chinese": "pron.那；那个"
          },
          {
            "english": "let",
            "phonetic": "let",
            "chinese": "v.允许；让"
          },
          {
            "english": "us",
            "phonetic": "ʌs; əs",
            "chinese": "pron.我们（we的宾格）"
          },
          {
            "english": "go",
            "phonetic": "ɡəʊ",
            "chinese": "v.去；走"
          },
          {
            "english": "bye",
            "phonetic": "baɪ",
            "chinese": "(= goodbye) *interj.再见"
          },
          {
            "english": "it",
            "phonetic": "ɪt",
            "chinese": "pron.它"
          },
          {
            "english": "time",
            "phonetic": "taɪm",
            "chinese": "n.时间；次"
          },
          {
            "english": "for",
            "phonetic": "fɔː(r); fə(r)",
            "chinese": "prep.为了；给；对"
          }
        ],
        "rhythmicChant": "大声说 hello，见面要 how。懂得 do，还要 you。"
      },
      {
        "id": "pep_7a_us2",
        "title": "Starter Unit 2",
        "chineseTitle": "整洁与颜色装饰",
        "words": [
          {
            "english": "keep",
            "phonetic": "kiːp",
            "chinese": "v.（使）保持；保留"
          },
          {
            "english": "tidy",
            "phonetic": "ˈtaɪdi",
            "chinese": "adj.整洁的；井井有条的"
          },
          {
            "english": "in",
            "phonetic": "ɪn",
            "chinese": "prep.在……里；表示某事完成或发生的方式"
          },
          {
            "english": "schoolbag",
            "phonetic": "ˈskuːlbæɡ",
            "chinese": "n.书包"
          },
          {
            "english": "cap",
            "phonetic": "kæp",
            "chinese": "n.帽子（无帽沿或有帽舌的）；棒球帽"
          },
          {
            "english": "ruler",
            "phonetic": "ˈruːlə(r)",
            "chinese": "n.尺；直尺"
          },
          {
            "english": "pencil",
            "phonetic": "ˈpensl",
            "chinese": "n.铅笔"
          },
          {
            "english": "brown",
            "phonetic": "braʊn",
            "chinese": "adj. & n.棕色（的）；褐色（的）"
          },
          {
            "english": "black",
            "phonetic": "blæk",
            "chinese": "adj. & n.黑色（的）"
          },
          {
            "english": "yellow",
            "phonetic": "ˈjeləʊ",
            "chinese": "adj. & n.黄色（的）"
          },
          {
            "english": "orange",
            "phonetic": "ˈɒrɪndʒ",
            "chinese": "adj. & n.橙红色（的）；橘黄色（的） *n.橙子；柑橘"
          },
          {
            "english": "green",
            "phonetic": "ɡriːn",
            "chinese": "adj. & n.绿色（的）"
          },
          {
            "english": "blue",
            "phonetic": "bluː",
            "chinese": "adj. & n.蓝色（的）"
          },
          {
            "english": "white",
            "phonetic": "waɪt",
            "chinese": "adj. & n.白色（的）"
          },
          {
            "english": "red",
            "phonetic": "red",
            "chinese": "adj. & n.红色（的）"
          },
          {
            "english": "colour",
            "phonetic": "ˈkʌlə(r)",
            "chinese": "(= color) *n.颜色"
          },
          {
            "english": "trousers",
            "phonetic": "ˈtraʊzəz",
            "chinese": "n. (pl.)裤子"
          },
          {
            "english": "they",
            "phonetic": "ðeɪ",
            "chinese": "pron.他（她、它）们"
          },
          {
            "english": "bicycle",
            "phonetic": "ˈbaɪsɪkl",
            "chinese": "(= bike /baɪk/) *n.自行车；脚踏车"
          },
          {
            "english": "shoe",
            "phonetic": "ʃuː",
            "chinese": "n.鞋"
          },
          {
            "english": "where",
            "phonetic": "weə(r)",
            "chinese": "adv.在哪里；到哪里"
          },
          {
            "english": "put",
            "phonetic": "pʊt",
            "chinese": "v.放"
          },
          {
            "english": "bed",
            "phonetic": "bed",
            "chinese": "n.床"
          },
          {
            "english": "desk",
            "phonetic": "desk",
            "chinese": "n.书桌"
          },
          {
            "english": "chair",
            "phonetic": "tʃeə(r)",
            "chinese": "n.椅子"
          },
          {
            "english": "book",
            "phonetic": "bʊk",
            "chinese": "n.书"
          },
          {
            "english": "box",
            "phonetic": "bɒks",
            "chinese": "n.箱；盒；方框"
          },
          {
            "english": "sock",
            "phonetic": "sɒk",
            "chinese": "n.短袜"
          },
          {
            "english": "some",
            "phonetic": "sʌm; səm",
            "chinese": "adj.一些；某些 *pron.有些；有的"
          },
          {
            "english": "pair",
            "phonetic": "peə(r)",
            "chinese": "n.一双；一对"
          },
          {
            "english": "of",
            "phonetic": "ɒv; əv",
            "chinese": "prep.属于（某人）；关于（某人）"
          },
          {
            "english": "on",
            "phonetic": "ɒn",
            "chinese": "prep.在……上"
          },
          {
            "english": "under",
            "phonetic": "ˈʌndə(r)",
            "chinese": "prep.在……下"
          },
          {
            "english": "mum",
            "phonetic": "mʌm",
            "chinese": "(= mom /mɒm/) *n.妈妈"
          },
          {
            "english": "not",
            "phonetic": "nɒt",
            "chinese": "adv.不；没有"
          },
          {
            "english": "find",
            "phonetic": "faɪnd",
            "chinese": "v.找到；发现"
          },
          {
            "english": "new",
            "phonetic": "njuː",
            "chinese": "adj.新的；刚出现的"
          },
          {
            "english": "no",
            "phonetic": "nəʊ",
            "chinese": "interj.不；不要 *adj.没有；不是"
          },
          {
            "english": "here",
            "phonetic": "hɪə(r)",
            "chinese": "adv.在这里"
          },
          {
            "english": "room",
            "phonetic": "ruːm",
            "chinese": "n.房间"
          },
          {
            "english": "OK",
            "phonetic": "əʊˈkeɪ",
            "chinese": "interj.好；行 *adj. & adv.可以（的）"
          },
          {
            "english": "sorry",
            "phonetic": "ˈsɒri",
            "chinese": "adj.抱歉的；惋惜的"
          },
          {
            "english": "dad",
            "phonetic": "dæd",
            "chinese": "n.爸爸"
          },
          {
            "english": "glasses",
            "phonetic": "ˈɡlɑːsɪz",
            "chinese": "n. (pl.)眼镜"
          },
          {
            "english": "see",
            "phonetic": "siː",
            "chinese": "v.看见"
          },
          {
            "english": "them",
            "phonetic": "ðem; ðəm",
            "chinese": "pron.他（她、它）们（they的宾格）"
          },
          {
            "english": "wait",
            "phonetic": "weɪt",
            "chinese": "v.等待；等候"
          },
          {
            "english": "minute",
            "phonetic": "ˈmɪnɪt",
            "chinese": "n.分；分钟"
          },
          {
            "english": "head",
            "phonetic": "hed",
            "chinese": "n.头"
          },
          {
            "english": "welcome",
            "phonetic": "ˈwelkəm",
            "chinese": "adj.受欢迎的 *interj., v. & n.欢迎"
          },
          {
            "english": "her",
            "phonetic": "hɜː(r); hə(r)",
            "chinese": "pron.她的"
          },
          {
            "english": "nose",
            "phonetic": "nəʊz",
            "chinese": "n.鼻子"
          }
        ],
        "rhythmicChant": "大声说 keep，见面要 tidy。懂得 in，还要 schoolbag。"
      },
      {
        "id": "pep_7a_us3",
        "title": "Starter Unit 3",
        "chineseTitle": "植物花草与农场",
        "words": [
          {
            "english": "cat",
            "phonetic": "kæt",
            "chinese": "n.猫"
          },
          {
            "english": "these",
            "phonetic": "ðiːz",
            "chinese": "pron.这些"
          },
          {
            "english": "plant",
            "phonetic": "plɑːnt",
            "chinese": "n.植物 *v.种植"
          },
          {
            "english": "baby",
            "phonetic": "ˈbeɪbi",
            "chinese": "n.动物幼崽；婴儿"
          },
          {
            "english": "chicken",
            "phonetic": "ˈtʃɪkɪn",
            "chinese": "n.鸡；鸡肉"
          },
          {
            "english": "dog",
            "phonetic": "dɒɡ",
            "chinese": "n.狗"
          },
          {
            "english": "rabbit",
            "phonetic": "ˈræbɪt",
            "chinese": "n.兔子"
          },
          {
            "english": "tomato",
            "phonetic": "təˈmɑːtəʊ; təˈmeɪtəʊ",
            "chinese": "n. (pl. tomatoes)西红柿"
          },
          {
            "english": "flower",
            "phonetic": "ˈflaʊə(r)",
            "chinese": "n.花"
          },
          {
            "english": "apple",
            "phonetic": "ˈæpl",
            "chinese": "n.苹果"
          },
          {
            "english": "tree",
            "phonetic": "triː",
            "chinese": "n.树"
          },
          {
            "english": "this",
            "phonetic": "ðɪs",
            "chinese": "pron.这；这个"
          },
          {
            "english": "those",
            "phonetic": "ðəʊz",
            "chinese": "pron.那些"
          },
          {
            "english": "animal",
            "phonetic": "ˈænɪml",
            "chinese": "n.动物"
          },
          {
            "english": "duck",
            "phonetic": "dʌk",
            "chinese": "n.鸭子"
          },
          {
            "english": "potato",
            "phonetic": "pəˈteɪtəʊ",
            "chinese": "n. (pl. potatoes)土豆"
          },
          {
            "english": "many",
            "phonetic": "ˈmeni",
            "chinese": "adj. & pron.许多"
          },
          {
            "english": "grandpa",
            "phonetic": "ˈɡrænpɑː",
            "chinese": "(= grandfather /ˈɡrænfɑːðə(r)/) *n.爷爷；外公"
          },
          {
            "english": "farm",
            "phonetic": "fɑːm",
            "chinese": "n.农场"
          },
          {
            "english": "cow",
            "phonetic": "kaʊ",
            "chinese": "n.奶牛"
          },
          {
            "english": "small",
            "phonetic": "smɔːl",
            "chinese": "adj.小的"
          },
          {
            "english": "lake",
            "phonetic": "leɪk",
            "chinese": "n.湖"
          },
          {
            "english": "house",
            "phonetic": "haʊs",
            "chinese": "n.房子"
          },
          {
            "english": "horse",
            "phonetic": "hɔːs",
            "chinese": "n.马"
          },
          {
            "english": "sheep",
            "phonetic": "ʃiːp",
            "chinese": "n. (pl. sheep)羊；绵羊"
          },
          {
            "english": "big",
            "phonetic": "bɪɡ",
            "chinese": "adj.大的"
          },
          {
            "english": "look",
            "phonetic": "lʊk",
            "chinese": "v.看"
          },
          {
            "english": "uncle",
            "phonetic": "ˈʌŋkl",
            "chinese": "n.舅父；叔父；伯父；姑父；姨父"
          },
          {
            "english": "grass",
            "phonetic": "ɡrɑːs",
            "chinese": "n.草"
          },
          {
            "english": "kind",
            "phonetic": "kaɪnd",
            "chinese": "n.种类 *adj.体贴的；亲切的"
          },
          {
            "english": "he",
            "phonetic": "hiː; hɪ",
            "chinese": "pron.他"
          },
          {
            "english": "pig",
            "phonetic": "pɪɡ",
            "chinese": "n.猪"
          },
          {
            "english": "there",
            "phonetic": "ðeə(r)",
            "chinese": "adv.在那里"
          },
          {
            "english": "behind",
            "phonetic": "bɪˈhaɪnd",
            "chinese": "prep.在……的后面"
          },
          {
            "english": "home",
            "phonetic": "həʊm",
            "chinese": "n.家"
          },
          {
            "english": "beautiful",
            "phonetic": "ˈbjuːtɪfl",
            "chinese": "adj.美丽的"
          },
          {
            "english": "like",
            "phonetic": "laɪk",
            "chinese": "v.喜欢 *prep.例如；像……一样"
          },
          {
            "english": "his",
            "phonetic": "hɪz; ɪz",
            "chinese": "pron.他的"
          },
          {
            "english": "at",
            "phonetic": "æt; ət",
            "chinese": "prep.向；朝；在（某处、某时间或时刻）"
          }
        ],
        "rhythmicChant": "大声说 cat，见面要 these。懂得 plant，还要 baby。"
      },
      {
        "id": "pep_7a_u1",
        "title": "Unit 1",
        "chineseTitle": "结交挚友",
        "words": [
          {
            "english": "we",
            "phonetic": "wiː; wɪ",
            "chinese": "pron.我们"
          },
          {
            "english": "make",
            "phonetic": "meɪk",
            "chinese": "v.使成为；制造"
          },
          {
            "english": "friend",
            "phonetic": "frend",
            "chinese": "n.朋友"
          },
          {
            "english": "get",
            "phonetic": "ɡet",
            "chinese": "v.去取（或带来）；得到"
          },
          {
            "english": "know",
            "phonetic": "nəʊ",
            "chinese": "v.知道"
          },
          {
            "english": "from",
            "phonetic": "frɒm; frəm",
            "chinese": "prep.从……来；从……开始"
          },
          {
            "english": "old",
            "phonetic": "əʊld",
            "chinese": "adj.老的；旧的"
          },
          {
            "english": "last",
            "phonetic": "lɑːst",
            "chinese": "adj.最后的；末尾的"
          },
          {
            "english": "year",
            "phonetic": "jɪə(r); jɜː(r)",
            "chinese": "n.年"
          },
          {
            "english": "yes",
            "phonetic": "jes",
            "chinese": "interj.是的；可以"
          },
          {
            "english": "Mr",
            "phonetic": "ˈmɪstə(r)",
            "chinese": "先生（用于男子的姓氏或姓名前）"
          },
          {
            "english": "our",
            "phonetic": "aʊə(r); ˈaʊə(r)",
            "chinese": "pron.我们的"
          },
          {
            "english": "English",
            "phonetic": "ˈɪŋɡlɪʃ",
            "chinese": "n.英语；英国人 *adj.英语的；英国的"
          },
          {
            "english": "teacher",
            "phonetic": "ˈtiːtʃə(r)",
            "chinese": "n.教师"
          },
          {
            "english": "which",
            "phonetic": "wɪtʃ",
            "chinese": "pron.哪一个；哪一些"
          },
          {
            "english": "who",
            "phonetic": "huː",
            "chinese": "pron.谁；什么人"
          },
          {
            "english": "job",
            "phonetic": "dʒɒb",
            "chinese": "n.工作"
          },
          {
            "english": "student",
            "phonetic": "ˈstjuːdnt",
            "chinese": "n.学生"
          },
          {
            "english": "age",
            "phonetic": "eɪdʒ",
            "chinese": "n.年龄"
          },
          {
            "english": "she",
            "phonetic": "ʃiː; ʃɪ",
            "chinese": "pron.她"
          }
        ],
        "rhythmicChant": "大声说 we，见面要 make。懂得 friend，还要 get。"
      },
      {
        "id": "pep_7a_u2",
        "title": "Unit 2",
        "chineseTitle": "我的可爱宠物与家",
        "words": [
          {
            "english": "favourite",
            "phonetic": "ˈfeɪvərɪt",
            "chinese": "(= favorite) *adj.最喜欢的；最爱的"
          },
          {
            "english": "pet",
            "phonetic": "pet",
            "chinese": "n.宠物"
          },
          {
            "english": "very",
            "phonetic": "ˈveri",
            "chinese": "adv.很；非常"
          },
          {
            "english": "cute",
            "phonetic": "kjuːt",
            "chinese": "adj.可爱的"
          },
          {
            "english": "much",
            "phonetic": "mʌtʃ",
            "chinese": "adv.非常；十分 *pron. & adj.许多；大量；多少"
          },
          {
            "english": "school",
            "phonetic": "skuːl",
            "chinese": "n.学校"
          },
          {
            "english": "China",
            "phonetic": "ˈtʃaɪnə",
            "chinese": "中国"
          },
          {
            "english": "panda",
            "phonetic": "ˈpændə",
            "chinese": "n.熊猫"
          },
          {
            "english": "hot",
            "phonetic": "hɒt",
            "chinese": "adj.热的；炎热的"
          },
          {
            "english": "also",
            "phonetic": "ˈɔːlsəʊ",
            "chinese": "adv.也；而且"
          },
          {
            "english": "live",
            "phonetic": "lɪv",
            "chinese": "v.居住；生活"
          },
          {
            "english": "with",
            "phonetic": "wɪð; wɪθ",
            "chinese": "prep.和……在一起；带有；使用"
          },
          {
            "english": "parent",
            "phonetic": "ˈpeərənt",
            "chinese": "n.父（母）亲"
          },
          {
            "english": "Chinese",
            "phonetic": "ˌtʃaɪˈniːz",
            "chinese": "adj.中国的 *n.中国人；汉语"
          },
          {
            "english": "food",
            "phonetic": "fuːd",
            "chinese": "n.食物"
          },
          {
            "english": "lot",
            "phonetic": "lɒt",
            "chinese": "pron.大量；许多"
          },
          {
            "english": "about",
            "phonetic": "əˈbaʊt",
            "chinese": "prep.关于 *adv.大约"
          },
          {
            "english": "wall",
            "phonetic": "wɔːl",
            "chinese": "n.墙"
          },
          {
            "english": "all",
            "phonetic": "ɔːl",
            "chinese": "pron. & adj.所有（的）；全部（的）"
          },
          {
            "english": "hour",
            "phonetic": "ˈaʊə(r)",
            "chinese": "n.小时"
          },
          {
            "english": "ago",
            "phonetic": "əˈɡəʊ",
            "chinese": "adv.以前"
          },
          {
            "english": "family",
            "phonetic": "ˈfæməli",
            "chinese": "n.家庭"
          },
          {
            "english": "bird",
            "phonetic": "bɜːd",
            "chinese": "n.鸟"
          },
          {
            "english": "speak",
            "phonetic": "spiːk",
            "chinese": "v.说（某种语言）；说话"
          },
          {
            "english": "sport",
            "phonetic": "spɔːt",
            "chinese": "n.运动"
          },
          {
            "english": "often",
            "phonetic": "ˈɒfn; ˈɒftən",
            "chinese": "adv.时常；常常"
          },
          {
            "english": "play",
            "phonetic": "pleɪ",
            "chinese": "v.玩"
          },
          {
            "english": "after",
            "phonetic": "ˈɑːftə(r)",
            "chinese": "prep. & conj.在……以后"
          },
          {
            "english": "want",
            "phonetic": "wɒnt",
            "chinese": "v.想要"
          },
          {
            "english": "be",
            "phonetic": "biː; bɪ",
            "chinese": "v.是"
          },
          {
            "english": "place",
            "phonetic": "pleɪs",
            "chinese": "n.地方；地点"
          },
          {
            "english": "music",
            "phonetic": "ˈmjuːzɪk",
            "chinese": "n.音乐"
          },
          {
            "english": "love",
            "phonetic": "lʌv",
            "chinese": "v. & n.喜爱；爱"
          },
          {
            "english": "write",
            "phonetic": "raɪt",
            "chinese": "v.写"
          },
          {
            "english": "or",
            "phonetic": "ɔː(r)",
            "chinese": "conj.或者；也不（用于否定句）"
          },
          {
            "english": "mother",
            "phonetic": "ˈmʌðə(r)",
            "chinese": "n.母亲"
          },
          {
            "english": "child",
            "phonetic": "tʃaɪld",
            "chinese": "n. (pl. children /ˈtʃɪldrən/)儿童；小孩"
          },
          {
            "english": "sister",
            "phonetic": "ˈsɪstə(r)",
            "chinese": "n.姐；妹"
          },
          {
            "english": "brother",
            "phonetic": "ˈbrʌðə(r)",
            "chinese": "n.兄；弟"
          },
          {
            "english": "cousin",
            "phonetic": "ˈkʌzn",
            "chinese": "n.堂兄（弟、姊、妹）；表兄（弟、姊、妹）"
          },
          {
            "english": "aunt",
            "phonetic": "ɑːnt",
            "chinese": "n.姑（姨、伯、婶、舅）母"
          },
          {
            "english": "grandmother",
            "phonetic": "ˈɡrænmʌðə(r)",
            "chinese": "(= grandma /ˈɡrænmɑː/) *n.奶奶；外婆"
          },
          {
            "english": "come",
            "phonetic": "kʌm",
            "chinese": "v.来；来到"
          },
          {
            "english": "ping-pong",
            "phonetic": "ˈpɪŋ pɒŋ",
            "chinese": "n.乒乓球运动"
          },
          {
            "english": "whose",
            "phonetic": "huːz",
            "chinese": "pron.谁的"
          },
          {
            "english": "well",
            "phonetic": "wel",
            "chinese": "interj.嗯；好吧 *adv.好；令人满意地 *adj.健康的"
          },
          {
            "english": "every",
            "phonetic": "ˈevri",
            "chinese": "adj.每一；每个"
          },
          {
            "english": "day",
            "phonetic": "deɪ",
            "chinese": "n.一天；白天"
          },
          {
            "english": "week",
            "phonetic": "wiːk",
            "chinese": "n.周"
          },
          {
            "english": "fish",
            "phonetic": "fɪʃ",
            "chinese": "v.钓鱼 *n.鱼；鱼肉"
          },
          {
            "english": "father",
            "phonetic": "ˈfɑːðə(r)",
            "chinese": "n.父亲；爸爸"
          },
          {
            "english": "piano",
            "phonetic": "piˈænəʊ",
            "chinese": "n. (pl. pianos)钢琴"
          },
          {
            "english": "basketball",
            "phonetic": "ˈbɑːskɪtbɔːl",
            "chinese": "n.篮球；篮球运动"
          },
          {
            "english": "read",
            "phonetic": "riːd",
            "chinese": "v.读；阅读"
          },
          {
            "english": "garden",
            "phonetic": "ˈɡɑːdn",
            "chinese": "v.做园艺工作；种植花木 *n.园圃；庭园"
          },
          {
            "english": "classroom",
            "phonetic": "ˈklɑːsruːm",
            "chinese": "n.教室"
          },
          {
            "english": "their",
            "phonetic": "ðeə(r)",
            "chinese": "pron.他（她、它）们的"
          },
          {
            "english": "clean",
            "phonetic": "kliːn",
            "chinese": "adj.干净的 *v.使……干净；打扫"
          },
          {
            "english": "little",
            "phonetic": "ˈlɪtl",
            "chinese": "adj.小的；年幼的"
          },
          {
            "english": "ball",
            "phonetic": "bɔːl",
            "chinese": "n.球"
          },
          {
            "english": "playground",
            "phonetic": "ˈpleɪɡraʊnd",
            "chinese": "n.游乐场；操场"
          },
          {
            "english": "wear",
            "phonetic": "weə(r)",
            "chinese": "v.穿；戴"
          },
          {
            "english": "talk",
            "phonetic": "tɔːk",
            "chinese": "v. & n.说话；交谈"
          },
          {
            "english": "tall",
            "phonetic": "tɔːl",
            "chinese": "adj.高的"
          },
          {
            "english": "short",
            "phonetic": "ʃɔːt",
            "chinese": "adj.短的；矮的"
          },
          {
            "english": "hair",
            "phonetic": "heə(r)",
            "chinese": "n.头发"
          },
          {
            "english": "long",
            "phonetic": "lɒŋ",
            "chinese": "adj.长的"
          },
          {
            "english": "quiet",
            "phonetic": "ˈkwaɪət",
            "chinese": "adj.安静的"
          },
          {
            "english": "girl",
            "phonetic": "ɡɜːl",
            "chinese": "n.女孩"
          },
          {
            "english": "but",
            "phonetic": "bʌt; bət",
            "chinese": "conj.但是"
          },
          {
            "english": "any",
            "phonetic": "ˈeni",
            "chinese": "adj. & pron.任何（的）；任一（的）"
          },
          {
            "english": "photo",
            "phonetic": "ˈfəʊtəʊ",
            "chinese": "(= photograph /ˈfəʊtəɡrɑːf/) *n. (pl. photos)照片"
          },
          {
            "english": "pink",
            "phonetic": "pɪŋk",
            "chinese": "adj. & n.粉红色（的）"
          },
          {
            "english": "left",
            "phonetic": "left",
            "chinese": "n.左边 *adv.向左边"
          },
          {
            "english": "right",
            "phonetic": "raɪt",
            "chinese": "n.右边 *adv.向右边 *adj.正确的；适当的"
          },
          {
            "english": "always",
            "phonetic": "ˈɔːlweɪz",
            "chinese": "adv.总是"
          },
          {
            "english": "story",
            "phonetic": "ˈstɔːri",
            "chinese": "n.故事"
          },
          {
            "english": "night",
            "phonetic": "naɪt",
            "chinese": "n.夜晚"
          },
          {
            "english": "middle",
            "phonetic": "ˈmɪdl",
            "chinese": "n.中间 *adj.中间的"
          },
          {
            "english": "think",
            "phonetic": "θɪŋk",
            "chinese": "v.思考"
          },
          {
            "english": "football",
            "phonetic": "ˈfʊtbɔːl",
            "chinese": "n.足球；足球运动"
          },
          {
            "english": "happy",
            "phonetic": "ˈhæpi",
            "chinese": "adj.快乐的"
          },
          {
            "english": "eye",
            "phonetic": "aɪ",
            "chinese": "n.眼睛"
          },
          {
            "english": "clever",
            "phonetic": "ˈklevə(r)",
            "chinese": "adj.聪明的"
          },
          {
            "english": "next",
            "phonetic": "nekst",
            "chinese": "adj., adv. & n.下一个（的）"
          },
          {
            "english": "him",
            "phonetic": "hɪm; ɪm",
            "chinese": "pron.他（he的宾格）"
          },
          {
            "english": "help",
            "phonetic": "help",
            "chinese": "v. & n.帮助"
          }
        ],
        "rhythmicChant": "大声说 favourite，见面要 pet。懂得 very，还要 cute。"
      },
      {
        "id": "pep_7a_u3",
        "title": "Unit 3",
        "chineseTitle": "校园里外",
        "words": [
          {
            "english": "front",
            "phonetic": "frʌnt",
            "chinese": "n.前面"
          },
          {
            "english": "art",
            "phonetic": "ɑːt",
            "chinese": "n.艺术；美术"
          },
          {
            "english": "between",
            "phonetic": "bɪˈtwiːn",
            "chinese": "prep.在……之间"
          },
          {
            "english": "library",
            "phonetic": "ˈlaɪbrəri",
            "chinese": "n.图书馆"
          },
          {
            "english": "blackboard",
            "phonetic": "ˈblækbɔːd",
            "chinese": "n.黑板"
          },
          {
            "english": "up",
            "phonetic": "ʌp",
            "chinese": "adv.向上"
          },
          {
            "english": "back",
            "phonetic": "bæk",
            "chinese": "n.后面；背部 *adj.后面的；背后的 *adv.回来；回原处"
          },
          {
            "english": "clock",
            "phonetic": "klɒk",
            "chinese": "n.时钟；钟"
          },
          {
            "english": "map",
            "phonetic": "mæp",
            "chinese": "n.地图"
          },
          {
            "english": "computer",
            "phonetic": "kəmˈpjuːtə(r)",
            "chinese": "n.电脑"
          },
          {
            "english": "window",
            "phonetic": "ˈwɪndəʊ",
            "chinese": "n.窗户"
          },
          {
            "english": "science",
            "phonetic": "ˈsaɪəns",
            "chinese": "n.科学"
          },
          {
            "english": "picture",
            "phonetic": "ˈpɪktʃə(r)",
            "chinese": "n.照片；图画"
          },
          {
            "english": "famous",
            "phonetic": "ˈfeɪməs",
            "chinese": "adj.著名的"
          },
          {
            "english": "table",
            "phonetic": "ˈteɪbl",
            "chinese": "n.桌子"
          },
          {
            "english": "today",
            "phonetic": "təˈdeɪ",
            "chinese": "adv.在今天 *n.今天"
          },
          {
            "english": "email",
            "phonetic": "ˈiːmeɪl",
            "chinese": "n.电子邮件 *v.（给某人）发电子邮件"
          },
          {
            "english": "answer",
            "phonetic": "ˈɑːnsə(r)",
            "chinese": "v.回答；答复 *n.答案"
          },
          {
            "english": "question",
            "phonetic": "ˈkwestʃən",
            "chinese": "n.问题"
          },
          {
            "english": "exercise",
            "phonetic": "ˈeksəsaɪz",
            "chinese": "n. & v.运动；锻炼；练习"
          },
          {
            "english": "way",
            "phonetic": "weɪ",
            "chinese": "n.方式；道路"
          },
          {
            "english": "best",
            "phonetic": "best",
            "chinese": "adj.最好的 *adv.最"
          },
          {
            "english": "because",
            "phonetic": "bɪˈkɒz",
            "chinese": "conj.因为"
          },
          {
            "english": "why",
            "phonetic": "waɪ",
            "chinese": "adv.为什么"
          },
          {
            "english": "dear",
            "phonetic": "dɪə(r)",
            "chinese": "adj.亲爱的"
          },
          {
            "english": "tell",
            "phonetic": "tel",
            "chinese": "v.告诉"
          },
          {
            "english": "interesting",
            "phonetic": "ˈɪntrəstɪŋ",
            "chinese": "adj.有趣的"
          }
        ],
        "rhythmicChant": "大声说 front，见面要 art。懂得 between，还要 library。"
      },
      {
        "id": "pep_7a_u4",
        "title": "Unit 4",
        "chineseTitle": "我最爱的学科",
        "words": [
          {
            "english": "subject",
            "phonetic": "ˈsʌbdʒɪkt",
            "chinese": "n.学科；科目"
          },
          {
            "english": "learn",
            "phonetic": "lɜːn",
            "chinese": "v.学习；得知"
          },
          {
            "english": "maths",
            "phonetic": "mæθs",
            "chinese": "(= mathematics /ˌmæθəˈmætɪks/, math /mæθ/) *n.数学"
          },
          {
            "english": "PE",
            "phonetic": "ˌpiː ˈiː",
            "chinese": "(= physical education) *n.体育"
          },
          {
            "english": "hard",
            "phonetic": "hɑːd",
            "chinese": "adj.困难的 *adv.努力地"
          },
          {
            "english": "difficult",
            "phonetic": "ˈdɪfɪkəlt",
            "chinese": "adj.困难的"
          },
          {
            "english": "sure",
            "phonetic": "ʃʊə(r)",
            "chinese": "adv.当然；一定"
          },
          {
            "english": "easy",
            "phonetic": "ˈiːzi",
            "chinese": "adj.容易的"
          },
          {
            "english": "use",
            "phonetic": "juːz",
            "chinese": "v.使用；利用  /juːs/ *n.使用；用途"
          },
          {
            "english": "give",
            "phonetic": "ɡɪv",
            "chinese": "v.给；送给；供给"
          },
          {
            "english": "idea",
            "phonetic": "aɪˈdɪə",
            "chinese": "n.想法；主意"
          },
          {
            "english": "listen",
            "phonetic": "ˈlɪsn",
            "chinese": "v.听"
          },
          {
            "english": "draw",
            "phonetic": "drɔː",
            "chinese": "v.画画"
          },
          {
            "english": "travel",
            "phonetic": "ˈtrævl",
            "chinese": "v. & n.旅行；游历"
          },
          {
            "english": "walk",
            "phonetic": "wɔːk",
            "chinese": "v. & n.行走；步行"
          },
          {
            "english": "afternoon",
            "phonetic": "ˌɑːftəˈnuːn",
            "chinese": "n.下午"
          },
          {
            "english": "then",
            "phonetic": "ðen",
            "chinese": "adv.那时；然后；那么"
          },
          {
            "english": "Miss",
            "phonetic": "mɪs",
            "chinese": "小姐（对未婚女子的礼貌称呼）；女士"
          },
          {
            "english": "work",
            "phonetic": "wɜːk",
            "chinese": "v. & n.工作"
          },
          {
            "english": "sometimes",
            "phonetic": "ˈsʌmtaɪmz",
            "chinese": "adv.有时"
          },
          {
            "english": "feel",
            "phonetic": "fiːl",
            "chinese": "v.感觉；觉得"
          },
          {
            "english": "busy",
            "phonetic": "ˈbɪzi",
            "chinese": "adj.忙碌的；无暇的"
          },
          {
            "english": "study",
            "phonetic": "ˈstʌdi",
            "chinese": "v. & n.学习；研究"
          },
          {
            "english": "song",
            "phonetic": "sɒŋ",
            "chinese": "n.歌曲"
          },
          {
            "english": "out",
            "phonetic": "aʊt",
            "chinese": "adv. & prep.（从……里）出来；出去"
          }
        ],
        "rhythmicChant": "大声说 subject，见面要 learn。懂得 maths，还要 PE。"
      },
      {
        "id": "pep_7a_u5",
        "title": "Unit 5",
        "chineseTitle": "快乐运动与技能",
        "words": [
          {
            "english": "sing",
            "phonetic": "sɪŋ",
            "chinese": "v.唱歌"
          },
          {
            "english": "swim",
            "phonetic": "swɪm",
            "chinese": "v. & n.游泳"
          },
          {
            "english": "run",
            "phonetic": "rʌn",
            "chinese": "v. & n.跑；跑步"
          },
          {
            "english": "fast",
            "phonetic": "fɑːst",
            "chinese": "adv.快地 *adj.快的"
          },
          {
            "english": "dance",
            "phonetic": "dɑːns",
            "chinese": "v. & n.跳舞"
          },
          {
            "english": "fly",
            "phonetic": "flaɪ",
            "chinese": "v.飞"
          },
          {
            "english": "watch",
            "phonetic": "wɒtʃ",
            "chinese": "v.注视；观看 *n.表；手表"
          },
          {
            "english": "cake",
            "phonetic": "keɪk",
            "chinese": "n.蛋糕"
          },
          {
            "english": "cook",
            "phonetic": "kʊk",
            "chinese": "v.做饭 *n.厨师"
          },
          {
            "english": "noodle",
            "phonetic": "ˈnuːdl",
            "chinese": "n. (usually pl.)面条"
          },
          {
            "english": "open",
            "phonetic": "ˈəʊpən",
            "chinese": "v.打开 *adj.开放的；敞开的"
          },
          {
            "english": "take",
            "phonetic": "teɪk",
            "chinese": "v.拍照；拿；取；买下"
          },
          {
            "english": "visit",
            "phonetic": "ˈvɪzɪt",
            "chinese": "v. & n.参观；拜访"
          },
          {
            "english": "park",
            "phonetic": "pɑːk",
            "chinese": "n.公园"
          },
          {
            "english": "when",
            "phonetic": "wen",
            "chinese": "adv.什么时候"
          },
          {
            "english": "share",
            "phonetic": "ʃeə(r)",
            "chinese": "v.分享；合用；分担"
          }
        ],
        "rhythmicChant": "大声说 sing，见面要 swim。懂得 run，还要 fast。"
      },
      {
        "id": "pep_7a_u6",
        "title": "Unit 6",
        "chineseTitle": "日常起居时钟",
        "words": [
          {
            "english": "o'clock",
            "phonetic": "əˈklɒk",
            "chinese": "adv.……点钟（表示整点）"
          },
          {
            "english": "half",
            "phonetic": "hɑːf",
            "chinese": "n.一半；半 *pron.半数"
          },
          {
            "english": "dress",
            "phonetic": "dres",
            "chinese": "v.穿衣服 *n.连衣裙"
          },
          {
            "english": "breakfast",
            "phonetic": "ˈbrekfəst",
            "chinese": "n.早餐"
          },
          {
            "english": "before",
            "phonetic": "bɪˈfɔː(r)",
            "chinese": "prep. & conj.在……以前 *adv.以前"
          },
          {
            "english": "begin",
            "phonetic": "bɪˈɡɪ",
            "chinese": "v.开始"
          },
          {
            "english": "dinner",
            "phonetic": "ˈdɪnə(r)",
            "chinese": "n.正餐；主餐"
          },
          {
            "english": "early",
            "phonetic": "ˈɜːli",
            "chinese": "adj.早的；早期的 *adv.提前；在早期"
          },
          {
            "english": "ask",
            "phonetic": "ɑːsk",
            "chinese": "v.询问；请求"
          },
          {
            "english": "lunch",
            "phonetic": "lʌntʃ",
            "chinese": "n.午餐"
          },
          {
            "english": "film",
            "phonetic": "fɪlm",
            "chinese": "n.电影"
          },
          {
            "english": "lesson",
            "phonetic": "ˈlesn",
            "chinese": "n.课；一节课"
          },
          {
            "english": "ice",
            "phonetic": "aɪs",
            "chinese": "n.冰；冰块"
          }
        ],
        "rhythmicChant": "大声说 o'clock，见面要 half。懂得 dress，还要 breakfast。"
      },
      {
        "id": "pep_7a_u7",
        "title": "Unit 7",
        "chineseTitle": "生日好礼相送",
        "words": [
          {
            "english": "birthday",
            "phonetic": "ˈbɜːθdeɪ",
            "chinese": "n.生日"
          },
          {
            "english": "month",
            "phonetic": "mʌnθ",
            "chinese": "n.月份"
          },
          {
            "english": "gift",
            "phonetic": "ɡɪft",
            "chinese": "n.礼物"
          },
          {
            "english": "party",
            "phonetic": "ˈpɑːti",
            "chinese": "n.聚会"
          },
          {
            "english": "buy",
            "phonetic": "baɪ",
            "chinese": "v.买"
          },
          {
            "english": "shop",
            "phonetic": "ʃɒp",
            "chinese": "n.商店 *v.逛商店；在商店购物"
          },
          {
            "english": "woman",
            "phonetic": "ˈwʊmən",
            "chinese": "n. (pl. women /ˈwɪmɪn/)女人"
          },
          {
            "english": "candle",
            "phonetic": "ˈkændl",
            "chinese": "n.蜡烛"
          },
          {
            "english": "will",
            "phonetic": "wɪl",
            "chinese": "modal v.将要；会"
          },
          {
            "english": "egg",
            "phonetic": "eɡ",
            "chinese": "n.蛋"
          },
          {
            "english": "juice",
            "phonetic": "dʒuːs",
            "chinese": "n.果汁"
          },
          {
            "english": "milk",
            "phonetic": "mɪlk",
            "chinese": "n.牛奶"
          },
          {
            "english": "candy",
            "phonetic": "ˈkændi",
            "chinese": "n.糖果"
          },
          {
            "english": "drink",
            "phonetic": "drɪŋk",
            "chinese": "n.饮品 *v.喝"
          },
          {
            "english": "card",
            "phonetic": "kɑːd",
            "chinese": "n.厚纸片；卡片"
          },
          {
            "english": "doll",
            "phonetic": "dɒl",
            "chinese": "n.玩偶；玩具娃娃"
          },
          {
            "english": "Mrs",
            "phonetic": "ˈmɪsɪz",
            "chinese": "夫人；太太（对已婚妇女的礼貌称呼）"
          },
          {
            "english": "eat",
            "phonetic": "iːt",
            "chinese": "v.吃"
          },
          {
            "english": "wish",
            "phonetic": "wɪʃ",
            "chinese": "v.希望；祝愿 *n.愿望"
          },
          {
            "english": "nurse",
            "phonetic": "nɜːs",
            "chinese": "n.护士"
          },
          {
            "english": "hear",
            "phonetic": "hɪə(r)",
            "chinese": "v.听到"
          },
          {
            "english": "door",
            "phonetic": "dɔː(r)",
            "chinese": "n.门"
          }
        ],
        "rhythmicChant": "大声说 birthday，见面要 month。懂得 gift，还要 party。"
      }
    ]
  },
  {
    "id": "pep_7b",
    "title": "七年级下册 (Grade 7 Vol 2)",
    "units": [
      {
        "id": "pep_7b_u1",
        "title": "Unit 1",
        "chineseTitle": "神奇荒野与生灵",
        "words": [
          {
            "english": "fox",
            "chinese": "[n.] 狐狸"
          },
          {
            "english": "giraffe",
            "chinese": "[n.] 长颈鹿"
          },
          {
            "english": "eagle",
            "chinese": "[n.] 雕；鹰"
          },
          {
            "english": "wolf",
            "chinese": "[n.] 狼 (pl. wolves)"
          },
          {
            "english": "penguin",
            "chinese": "[n.] 企鹅"
          },
          {
            "english": "care",
            "chinese": "[n. & v.] n. 照顾；护理 / v. 关心；在乎"
          },
          {
            "english": "take care of",
            "chinese": "[短语] 照顾；处理"
          },
          {
            "english": "sandwich",
            "chinese": "[n.] 三明治"
          },
          {
            "english": "snake",
            "chinese": "[n.] 蛇"
          },
          {
            "english": "scary",
            "chinese": "[adj.] 吓人的；恐怖的"
          },
          {
            "english": "neck",
            "chinese": "[n.] 脖子"
          },
          {
            "english": "guess",
            "chinese": "[v.] 猜测；估计"
          },
          {
            "english": "shark",
            "chinese": "[n.] 鲨鱼"
          },
          {
            "english": "whale",
            "chinese": "[n.] 鲸"
          },
          {
            "english": "huge",
            "chinese": "[adj.] 巨大的；极多的"
          },
          {
            "english": "dangerous",
            "chinese": "[adj.] 危险的；有危害的"
          },
          {
            "english": "save",
            "chinese": "[v.] 救；储蓄；保存"
          },
          {
            "english": "luck",
            "chinese": "[n.] 幸运；语气"
          },
          {
            "english": "Thai",
            "chinese": "[adj. & n.] adj. 泰国的；泰国人的 / n. 泰国人；泰语"
          },
          {
            "english": "trunk",
            "chinese": "[n.] 象鼻"
          },
          {
            "english": "pick",
            "chinese": "[v.] 捡；摘"
          },
          {
            "english": "pick up",
            "chinese": "[短语] 拿起；举起；接载"
          },
          {
            "english": "carry",
            "chinese": "[v.] 拿；提"
          },
          {
            "english": "playful",
            "chinese": "[adj.] 爱嬉戏的；爱玩的"
          },
          {
            "english": "swimmer",
            "chinese": "[n.] 游泳者"
          },
          {
            "english": "one another",
            "chinese": "[短语] 互相"
          },
          {
            "english": "look after",
            "chinese": "[短语] 照顾"
          },
          {
            "english": "culture",
            "chinese": "[n.] 文化；文明"
          },
          {
            "english": "however",
            "chinese": "[adv.] 然而；不过"
          },
          {
            "english": "danger",
            "chinese": "[n.] 危险"
          },
          {
            "english": "in danger",
            "chinese": "[短语] 处于危险之中"
          },
          {
            "english": "forest",
            "chinese": "[n.] 森林"
          },
          {
            "english": "cut down",
            "chinese": "[短语] 砍伐；减少"
          },
          {
            "english": "too many",
            "chinese": "[短语] 太多"
          },
          {
            "english": "kill",
            "chinese": "[v.] 杀死；弄死"
          },
          {
            "english": "ivory",
            "chinese": "[n.] 象牙"
          },
          {
            "english": "made of",
            "chinese": "[短语] 由……制成的"
          },
          {
            "english": "friendly",
            "chinese": "[adj.] 友好的"
          },
          {
            "english": "quite",
            "chinese": "[adv.] 相当；完全"
          },
          {
            "english": "quite a",
            "chinese": "[短语] 相当；非常"
          },
          {
            "english": "not ... at all",
            "chinese": "[短语] 一点也不；完全不"
          },
          {
            "english": "fur",
            "chinese": "[n.] （动物浓厚的）软毛"
          },
          {
            "english": "blind",
            "chinese": "[adj.] 瞎的；失明的"
          },
          {
            "english": "hearing",
            "chinese": "[n.] 听力；听觉"
          }
        ],
        "rhythmicChant": "小动物 fox，身子高 giraffe，让我们 eagle 拥抱大自然。"
      },
      {
        "id": "pep_7b_u2",
        "title": "Unit 2",
        "chineseTitle": "规则自律常相伴",
        "words": [
          {
            "english": "rule",
            "chinese": "[n.] 规则；规章"
          },
          {
            "english": "order",
            "chinese": "[n. & v.] n. 秩序；命令 / v. 点菜；命令"
          },
          {
            "english": "follow",
            "chinese": "[v.] 遵循；跟随"
          },
          {
            "english": "late for",
            "chinese": "[短语] 迟到"
          },
          {
            "english": "arrive",
            "chinese": "[v.] 到达"
          },
          {
            "english": "on time",
            "chinese": "[短语] 准时"
          },
          {
            "english": "hallway",
            "chinese": "[n.] 走廊"
          },
          {
            "english": "uniform",
            "chinese": "[n.] 校服；制服"
          },
          {
            "english": "litter",
            "chinese": "[v. & n.] v. 乱扔 / n. 垃圾"
          },
          {
            "english": "polite",
            "chinese": "[adj.] 有礼貌的"
          },
          {
            "english": "treat",
            "chinese": "[v. & n.] v. 对待；招待；治疗 / n. 款待"
          },
          {
            "english": "respect",
            "chinese": "[n. & v.] 尊敬"
          },
          {
            "english": "if",
            "chinese": "[conj.] 如果"
          },
          {
            "english": "jacket",
            "chinese": "[n.] 夹克衫；短上衣"
          },
          {
            "english": "have to",
            "chinese": "[短语] 不得不"
          },
          {
            "english": "everything",
            "chinese": "[pron.] 每件事；一切"
          },
          {
            "english": "lend",
            "chinese": "[v.] 借给；借出"
          },
          {
            "english": "sweet",
            "chinese": "[n. & adj.] n. 糖果 / adj. 甜的"
          },
          {
            "english": "snack",
            "chinese": "[n.] 点心；小吃"
          },
          {
            "english": "of course",
            "chinese": "[短语] 当然"
          },
          {
            "english": "mobile",
            "chinese": "[adj.] 可移动的"
          },
          {
            "english": "mobile phone",
            "chinese": "[短语] 手机"
          },
          {
            "english": "turn off",
            "chinese": "[短语] 关掉（水、电或煤气）"
          },
          {
            "english": "queue",
            "chinese": "[n.] 队"
          },
          {
            "english": "jump the queue",
            "chinese": "[短语] 插队"
          },
          {
            "english": "feed",
            "chinese": "[v.] 喂养；饲养"
          },
          {
            "english": "leave",
            "chinese": "[v.] 离开；留下"
          },
          {
            "english": "absent",
            "chinese": "[adj.] 缺席的；不在的"
          },
          {
            "english": "absent from",
            "chinese": "[短语] 缺席；不在"
          },
          {
            "english": "shh",
            "chinese": "[interj.] 嘘（用以让人安静下来）"
          },
          {
            "english": "quietly",
            "chinese": "[adv.] 轻声地；安静地"
          },
          {
            "english": "put on",
            "chinese": "[短语] 戴上；穿上；增加"
          },
          {
            "english": "belt",
            "chinese": "[n.] 安全带；腰带；皮带"
          },
          {
            "english": "noise",
            "chinese": "[n.] 声音；噪声"
          },
          {
            "english": "unhappy",
            "chinese": "[adj.] 不快乐的"
          },
          {
            "english": "Dr",
            "chinese": "[n.] 博士；医生 (= doctor)"
          },
          {
            "english": "make sb's/the bed",
            "chinese": "[短语] 整理床铺；铺床"
          },
          {
            "english": "either",
            "chinese": "[adv.] 也（用于否定词组后）"
          },
          {
            "english": "practise",
            "chinese": "[v.] 训练；练习"
          },
          {
            "english": "hang",
            "chinese": "[v.] 悬挂"
          },
          {
            "english": "hang out",
            "chinese": "[短语] 闲逛；常去某处"
          },
          {
            "english": "weekday",
            "chinese": "[n.] 工作日（星期一至星期五任何一天）"
          },
          {
            "english": "awful",
            "chinese": "[adj.] 糟糕的；讨厌的"
          },
          {
            "english": "become",
            "chinese": "[v.] 变成；成为"
          },
          {
            "english": "better",
            "chinese": "[adj. & adv.] 较好的；较好地"
          },
          {
            "english": "person",
            "chinese": "[n.] 人"
          },
          {
            "english": "focus",
            "chinese": "[v.] 集中（注意力、精力等）；聚焦"
          },
          {
            "english": "focus on",
            "chinese": "[短语] 集中（注意力、精力等）于"
          },
          {
            "english": "build",
            "chinese": "[v.] 创建；建造"
          },
          {
            "english": "spirit",
            "chinese": "[n.] 精神；情绪"
          },
          {
            "english": "think about",
            "chinese": "[短语] 思考；考虑"
          },
          {
            "english": "relax",
            "chinese": "[v.] 放松；休息"
          },
          {
            "english": "advice",
            "chinese": "[n.] 建议；意见"
          },
          {
            "english": "understand",
            "chinese": "[v.] 理解；领会"
          },
          {
            "english": "untidy",
            "chinese": "[adj.] 不整洁的"
          }
        ],
        "rhythmicChant": "小动物 rule，身子高 order，让我们 follow 拥抱大自然。"
      },
      {
        "id": "pep_7b_u3",
        "title": "Unit 3",
        "chineseTitle": "活力锻炼与滑板",
        "words": [
          {
            "english": "fit",
            "chinese": "[adj. & v.] adj. 健康的；健壮的 / v. 适合"
          },
          {
            "english": "baseball",
            "chinese": "[n.] 棒球（运动）"
          },
          {
            "english": "glove",
            "chinese": "[n.] （手指分开的）手套"
          },
          {
            "english": "mat",
            "chinese": "[n.] 垫子"
          },
          {
            "english": "rope",
            "chinese": "[n.] 绳子；粗绳"
          },
          {
            "english": "jump rope",
            "chinese": "[短语] 跳绳用的绳子；跳绳（运动）"
          },
          {
            "english": "racket",
            "chinese": "[n.] （网球、羽毛球等的）球拍"
          },
          {
            "english": "hardly",
            "chinese": "[adv.] 几乎不；几乎没有"
          },
          {
            "english": "ever",
            "chinese": "[adv.] 在任何时候；从来；曾经"
          },
          {
            "english": "hardly ever",
            "chinese": "[短语] 几乎从不"
          },
          {
            "english": "once",
            "chinese": "[adv. & conj.] adv. 一次；曾经 / conj. 一旦"
          },
          {
            "english": "twice",
            "chinese": "[adv.] 两次；两倍"
          },
          {
            "english": "mine",
            "chinese": "[pron.] 我的（所有物）"
          },
          {
            "english": "hers",
            "chinese": "[pron.] 她的（所有物）"
          },
          {
            "english": "maybe",
            "chinese": "[adv.] 也许；大概"
          },
          {
            "english": "well-used",
            "chinese": "[adj.] 使用得多的"
          },
          {
            "english": "practice",
            "chinese": "[n.] 练习；实践"
          },
          {
            "english": "perfect",
            "chinese": "[adj.] 完美的；极好的"
          },
          {
            "english": "seldom",
            "chinese": "[adv.] 很少；不常"
          },
          {
            "english": "badminton",
            "chinese": "[n.] 羽毛球运动"
          },
          {
            "english": "double",
            "chinese": "[n. & adj.] n. 双打 / adj. 成双的；两倍的"
          },
          {
            "english": "sometime",
            "chinese": "[adv.] 在某个时候"
          },
          {
            "english": "volleyball",
            "chinese": "[n.] 排球（运动）"
          },
          {
            "english": "theirs",
            "chinese": "[pron.] 他们的；她们的；它们的（所有物）"
          },
          {
            "english": "ours",
            "chinese": "[pron.] 我们的（所有物）"
          },
          {
            "english": "jog",
            "chinese": "[v.] 慢跑"
          },
          {
            "english": "few",
            "chinese": "[adj.] （表示否定的）很少的；几乎没有的"
          },
          {
            "english": "a few",
            "chinese": "[短语] 少数；几个"
          },
          {
            "english": "excuse",
            "chinese": "[v.] 原谅；宽恕"
          },
          {
            "english": "excuse me",
            "chinese": "[短语] 劳驾；请原谅"
          },
          {
            "english": "over there",
            "chinese": "[短语] 在那边"
          },
          {
            "english": "just",
            "chinese": "[adv.] 只是；正好"
          },
          {
            "english": "T-shirt",
            "chinese": "[n.] T恤衫"
          },
          {
            "english": "belong",
            "chinese": "[v.] 应在（某处）"
          },
          {
            "english": "belong to",
            "chinese": "[短语] 属于（某人）"
          },
          {
            "english": "working",
            "chinese": "[adj.] 工作的"
          },
          {
            "english": "working day",
            "chinese": "[短语] 工作日"
          },
          {
            "english": "full of",
            "chinese": "[短语] 有许多；充满"
          },
          {
            "english": "energy",
            "chinese": "[n.] 精力；能量"
          },
          {
            "english": "group",
            "chinese": "[n.] 组；群"
          },
          {
            "english": "skateboard",
            "chinese": "[n.] 滑板"
          },
          {
            "english": "encourage",
            "chinese": "[v.] 鼓励；激励"
          },
          {
            "english": "trick",
            "chinese": "[n.] 技巧；戏法"
          },
          {
            "english": "succeed",
            "chinese": "[v.] 成功；达到目标"
          },
          {
            "english": "skateboarding",
            "chinese": "[n.] 滑板运动"
          },
          {
            "english": "goal",
            "chinese": "[n.] 目标；目的"
          },
          {
            "english": "sit-up",
            "chinese": "[n.] 仰卧起坐"
          },
          {
            "english": "work out",
            "chinese": "[短语] 锻炼"
          },
          {
            "english": "app",
            "chinese": "[n.] 应用程序 (= application)"
          },
          {
            "english": "progress",
            "chinese": "[n.] 进步；进展"
          },
          {
            "english": "match",
            "chinese": "[n.] 比赛；竞赛"
          },
          {
            "english": "team",
            "chinese": "[n.] 队；组"
          },
          {
            "english": "lose",
            "chinese": "[v.] 输掉；丢失"
          },
          {
            "english": "teenager",
            "chinese": "[n.] 青少年"
          }
        ],
        "rhythmicChant": "小动物 fit，身子高 baseball，让我们 glove 拥抱大自然。"
      },
      {
        "id": "pep_7b_u4",
        "title": "Unit 4",
        "chineseTitle": "均衡饮食大作战",
        "words": [
          {
            "english": "watermelon",
            "chinese": "[n.] 西瓜"
          },
          {
            "english": "cabbage",
            "chinese": "[n.] 卷心菜"
          },
          {
            "english": "mutton",
            "chinese": "[n.] 羊肉"
          },
          {
            "english": "cookie",
            "chinese": "[n.] 曲奇饼"
          },
          {
            "english": "onion",
            "chinese": "[n.] 洋葱；葱头"
          },
          {
            "english": "dumpling",
            "chinese": "[n.] 饺子"
          },
          {
            "english": "coffee",
            "chinese": "[n.] 咖啡"
          },
          {
            "english": "bean",
            "chinese": "[n.] 豆"
          },
          {
            "english": "chip",
            "chinese": "[n.] 炸薯条"
          },
          {
            "english": "fish and chips",
            "chinese": "[短语] 炸鱼薯条"
          },
          {
            "english": "salad",
            "chinese": "[n.] 沙拉；色拉"
          },
          {
            "english": "porridge",
            "chinese": "[n.] 粥；麦片粥"
          },
          {
            "english": "waiter",
            "chinese": "[n.] （男）服务员"
          },
          {
            "english": "What about ...?",
            "chinese": "[短语] ……怎么样？"
          },
          {
            "english": "taste",
            "chinese": "[v. & n.] v. 有……味道；尝 / n. 味道"
          },
          {
            "english": "anything",
            "chinese": "[pron.] 某事物；任何事物"
          },
          {
            "english": "dish",
            "chinese": "[n.] 一道菜；盘子"
          },
          {
            "english": "choice",
            "chinese": "[n.] 选择"
          },
          {
            "english": "meal",
            "chinese": "[n.] 一餐所吃的食物；一餐"
          },
          {
            "english": "pork",
            "chinese": "[n.] 猪肉"
          },
          {
            "english": "strawberry",
            "chinese": "[n.] 草莓"
          },
          {
            "english": "menu",
            "chinese": "[n.] 菜单"
          },
          {
            "english": "customer",
            "chinese": "[n.] 顾客"
          },
          {
            "english": "serve",
            "chinese": "[v.] 提供；服务"
          },
          {
            "english": "waitress",
            "chinese": "[n.] 女服务员"
          },
          {
            "english": "sir",
            "chinese": "[n.] 先生"
          },
          {
            "english": "bill",
            "chinese": "[n.] 账单；钞票"
          },
          {
            "english": "go with",
            "chinese": "[短语] 搭配；相配"
          },
          {
            "english": "instead",
            "chinese": "[adv.] 反而；代替"
          },
          {
            "english": "pear",
            "chinese": "[n.] 梨"
          },
          {
            "english": "too much",
            "chinese": "[短语] 太多"
          },
          {
            "english": "sugar",
            "chinese": "[n.] 糖"
          },
          {
            "english": "newsletter",
            "chinese": "[n.] 内部通讯；简讯"
          },
          {
            "english": "improve",
            "chinese": "[v.] 改进；改善"
          },
          {
            "english": "habit",
            "chinese": "[n.] 习惯"
          },
          {
            "english": "fast food",
            "chinese": "[短语] 快餐"
          },
          {
            "english": "salt",
            "chinese": "[n.] 盐"
          },
          {
            "english": "fat",
            "chinese": "[n. & adj.] n. 脂肪 / adj. 肥胖的"
          },
          {
            "english": "weight",
            "chinese": "[n.] 体重；重量"
          },
          {
            "english": "hamburger",
            "chinese": "[n.] 汉堡包"
          },
          {
            "english": "cause",
            "chinese": "[v.] 造成；导致"
          },
          {
            "english": "heart",
            "chinese": "[n.] 心脏；中心"
          },
          {
            "english": "balanced",
            "chinese": "[adj.] 均衡的；平衡的"
          },
          {
            "english": "too ... to",
            "chinese": "[短语] 太……以至于不能"
          },
          {
            "english": "sleepy",
            "chinese": "[adj.] 困倦的；想睡的"
          },
          {
            "english": "after all",
            "chinese": "[短语] 毕竟；终归"
          },
          {
            "english": "away",
            "chinese": "[adv.] 离开；在别处"
          },
          {
            "english": "poor",
            "chinese": "[adj.] 不好的；贫穷的；可怜的"
          },
          {
            "english": "result",
            "chinese": "[n.] 后果；结果"
          },
          {
            "english": "article",
            "chinese": "[n.] 文章；冠词"
          },
          {
            "english": "common",
            "chinese": "[adj.] 共同的；普遍的"
          },
          {
            "english": "among",
            "chinese": "[prep.] 在……中；……之一"
          },
          {
            "english": "soft",
            "chinese": "[adj.] 柔和的；柔软的"
          },
          {
            "english": "soft drink",
            "chinese": "[短语] 软饮料（不含酒精）"
          },
          {
            "english": "enough",
            "chinese": "[adj., adv. & pron.] adj. 足够的 / adv. 足够地 / pron. 足够"
          },
          {
            "english": "thirsty",
            "chinese": "[adj.] 渴的"
          }
        ],
        "rhythmicChant": "小动物 watermelon，身子高 cabbage，让我们 mutton 拥抱大自然。"
      },
      {
        "id": "pep_7b_u5",
        "title": "Unit 5",
        "chineseTitle": "实时联络与速递",
        "words": [
          {
            "english": "right now",
            "chinese": "[短语] 现在；立刻"
          },
          {
            "english": "ride",
            "chinese": "[v. & n.] v. 骑 / n. 旅程"
          },
          {
            "english": "moment",
            "chinese": "[n.] 某个时刻；片刻；瞬间"
          },
          {
            "english": "at the moment",
            "chinese": "[短语] 现在；此刻"
          },
          {
            "english": "work on",
            "chinese": "[短语] 做；从事"
          },
          {
            "english": "dragon",
            "chinese": "[n.] 龙"
          },
          {
            "english": "festival",
            "chinese": "[n.] 节日"
          },
          {
            "english": "hold",
            "chinese": "[v.] 拿着；抓住"
          },
          {
            "english": "hold on",
            "chinese": "[短语] 别挂断电话；等一等"
          },
          {
            "english": "voice",
            "chinese": "[n.] 嗓音；声音"
          },
          {
            "english": "race",
            "chinese": "[n.] 比赛；竞赛"
          },
          {
            "english": "darling",
            "chinese": "[n.] 亲爱的；宝贝"
          },
          {
            "english": "somebody",
            "chinese": "[pron.] 某人；有人"
          },
          {
            "english": "could",
            "chinese": "[modal v.] 能；可以"
          },
          {
            "english": "message",
            "chinese": "[n.] 消息；信息"
          },
          {
            "english": "take a message",
            "chinese": "[短语] 捎个口信"
          },
          {
            "english": "leave a message",
            "chinese": "[短语] 留个口信"
          },
          {
            "english": "call back",
            "chinese": "[短语] 回电话"
          },
          {
            "english": "kick",
            "chinese": "[v.] 踢；踹"
          },
          {
            "english": "wow",
            "chinese": "[interj.] 哇；呀"
          },
          {
            "english": "online",
            "chinese": "[adj.] 在线的"
          },
          {
            "english": "shuttlecock",
            "chinese": "[n.] 羽毛球"
          },
          {
            "english": "sight",
            "chinese": "[n.] 名胜；风景；视力"
          },
          {
            "english": "exam",
            "chinese": "[n.] 考试 (= examination)"
          },
          {
            "english": "hope",
            "chinese": "[v. & n.] 希望"
          },
          {
            "english": "forward",
            "chinese": "[adv.] 向前"
          },
          {
            "english": "look forward to",
            "chinese": "[短语] 盼望"
          },
          {
            "english": "skate",
            "chinese": "[v.] 滑冰"
          },
          {
            "english": "happen",
            "chinese": "[v.] 发生"
          },
          {
            "english": "zone",
            "chinese": "[n.] 地区；地带；区域"
          },
          {
            "english": "time zone",
            "chinese": "[短语] 时区"
          },
          {
            "english": "around the world",
            "chinese": "[短语] 世界各地"
          },
          {
            "english": "rush",
            "chinese": "[v. & n.] 冲；奔"
          },
          {
            "english": "in a hurry",
            "chinese": "[短语] 匆忙"
          },
          {
            "english": "shine",
            "chinese": "[v. & n.] v. 发光；照耀 / n. 光亮"
          },
          {
            "english": "brightly",
            "chinese": "[adv.] 明亮地"
          },
          {
            "english": "colourful",
            "chinese": "[adj.] 色彩鲜艳的"
          },
          {
            "english": "slowly",
            "chinese": "[adv.] 缓慢地"
          },
          {
            "english": "such",
            "chinese": "[adj. & pron.] adj. 这样的；那样的 / pron. 这样（那样）的人或事物"
          },
          {
            "english": "such as",
            "chinese": "[短语] 例如"
          },
          {
            "english": "painting",
            "chinese": "[n.] 绘画作品；绘画；油画"
          },
          {
            "english": "market",
            "chinese": "[n.] 市场"
          },
          {
            "english": "side",
            "chinese": "[n.] 边；侧"
          },
          {
            "english": "side by side",
            "chinese": "[短语] 并排；并肩地"
          },
          {
            "english": "rush hour",
            "chinese": "[短语] 交通高峰期（上下班时的）"
          },
          {
            "english": "subway",
            "chinese": "[n.] 地铁"
          },
          {
            "english": "bright",
            "chinese": "[adj.] 鲜艳的；明亮的；聪明的"
          },
          {
            "english": "drop",
            "chinese": "[v. & n.] v. 运送；落下 / n. 滴；下降"
          },
          {
            "english": "drop off",
            "chinese": "[短语] （开车）把某人送到某处"
          },
          {
            "english": "passenger",
            "chinese": "[n.] 乘客"
          },
          {
            "english": "central",
            "chinese": "[adj.] 中心的；中央的"
          },
          {
            "english": "explain",
            "chinese": "[v.] 解释；说明"
          },
          {
            "english": "take part in",
            "chinese": "[短语] 参加"
          },
          {
            "english": "tour",
            "chinese": "[n. & v.] 旅行；旅游"
          },
          {
            "english": "sunshine",
            "chinese": "[n.] 阳光"
          },
          {
            "english": "drive",
            "chinese": "[v.] 开车；驾驶"
          }
        ],
        "rhythmicChant": "小动物 right now，身子高 ride，让我们 moment 拥抱大自然。"
      },
      {
        "id": "pep_7b_u6",
        "title": "Unit 6",
        "chineseTitle": "四季天气变幻",
        "words": [
          {
            "english": "rain or shine",
            "chinese": "[短语] 不管是下雨还是晴天；不管发生什么事"
          },
          {
            "english": "affect",
            "chinese": "[v.] 影响"
          },
          {
            "english": "dry",
            "chinese": "[adj.] 干的；干旱的"
          },
          {
            "english": "lightning",
            "chinese": "[n.] 闪电"
          },
          {
            "english": "stormy",
            "chinese": "[adj.] 有暴风雨（或暴风雪）的"
          },
          {
            "english": "north",
            "chinese": "[n.] 北部；北；北方"
          },
          {
            "english": "west",
            "chinese": "[n.] 西部；西；西方"
          },
          {
            "english": "south",
            "chinese": "[n.] 南部；南；南方"
          },
          {
            "english": "east",
            "chinese": "[n.] 东部；东；东方"
          },
          {
            "english": "stay in",
            "chinese": "[短语] 待在家里；没有外出"
          },
          {
            "english": "lucky",
            "chinese": "[adj.] 运气好的；带来好运的"
          },
          {
            "english": "lucky you",
            "chinese": "[短语] 你真幸运"
          },
          {
            "english": "sunbathe",
            "chinese": "[v.] 沐日光浴；晒太阳"
          },
          {
            "english": "some day",
            "chinese": "[短语] 将来；有朝一日"
          },
          {
            "english": "temperature",
            "chinese": "[n.] 温度"
          },
          {
            "english": "snowman",
            "chinese": "[n.] 雪人 (pl. snowmen)"
          },
          {
            "english": "heavily",
            "chinese": "[adv.] 大量地；沉重地"
          },
          {
            "english": "snowy",
            "chinese": "[adj.] 下雪的；雪白的"
          },
          {
            "english": "beach volleyball",
            "chinese": "[短语] 沙滩排排"
          },
          {
            "english": "high",
            "chinese": "[adv.] & adj. 高"
          },
          {
            "english": "freezing",
            "chinese": "[adj.] 极冷的；冰冻的"
          },
          {
            "english": "tourist",
            "chinese": "[n.] 旅行者；观光客"
          },
          {
            "english": "mount",
            "chinese": "[n.] 山；山峰（在现代英语里仅用于地名）"
          },
          {
            "english": "cloud",
            "chinese": "[n.] 云；云彩"
          },
          {
            "english": "feel like",
            "chinese": "[短语] 感觉像"
          },
          {
            "english": "magical",
            "chinese": "[adj.] 魔法的；神奇的"
          },
          {
            "english": "rock",
            "chinese": "[n.] 岩石"
          },
          {
            "english": "rest",
            "chinese": "[n.] 休息；剩余部分"
          },
          {
            "english": "area",
            "chinese": "[n.] 场地；地区"
          },
          {
            "english": "rest area",
            "chinese": "[短语] 休息区"
          },
          {
            "english": "make progress",
            "chinese": "[短语] 取得进展"
          },
          {
            "english": "although",
            "chinese": "[conj.] 虽然；尽管"
          },
          {
            "english": "still",
            "chinese": "[adv.] 还；仍然"
          },
          {
            "english": "in high spirits",
            "chinese": "[短语] 情绪高涨；兴高采烈"
          },
          {
            "english": "experience",
            "chinese": "[n. & v.] n. 经历；经验 / v. 经历"
          },
          {
            "english": "through",
            "chinese": "[prep.] 穿过；凭借"
          },
          {
            "english": "glad",
            "chinese": "[adj.] 高兴的"
          },
          {
            "english": "peak",
            "chinese": "[n.] 山顶；顶点"
          },
          {
            "english": "grey",
            "chinese": "[adj.] 灰色的 (AmE gray)"
          },
          {
            "english": "because of",
            "chinese": "[短语] 因为"
          },
          {
            "english": "fog",
            "chinese": "[n.] 雾"
          },
          {
            "english": "ground",
            "chinese": "[n.] 地面"
          },
          {
            "english": "wet",
            "chinese": "[adj.] 湿的"
          },
          {
            "english": "tiring",
            "chinese": "[adj.] 令人疲倦的；累人的"
          },
          {
            "english": "seem",
            "chinese": "[v.] 似乎；好像"
          },
          {
            "english": "sunlight",
            "chinese": "[n.] 阳光；日光"
          },
          {
            "english": "at the top",
            "chinese": "[短语] 在顶部；在顶端"
          },
          {
            "english": "description",
            "chinese": "[n.] 描述；说明"
          },
          {
            "english": "mountain",
            "chinese": "[n.] 山；高山"
          },
          {
            "english": "at the start",
            "chinese": "[短语] 开始；起初"
          },
          {
            "english": "end",
            "chinese": "[n.] 末尾；结束"
          },
          {
            "english": "at the end",
            "chinese": "[短语] 最后；在末尾"
          },
          {
            "english": "storm",
            "chinese": "[n.] 暴风雨；暴风雪"
          },
          {
            "english": "pour",
            "chinese": "[v.] 倾倒；倒出"
          },
          {
            "english": "wind",
            "chinese": "[n.] 风"
          },
          {
            "english": "shout",
            "chinese": "[v. & n.] 喊叫；呼唤"
          },
          {
            "english": "run after",
            "chinese": "[短语] 追逐"
          }
        ],
        "rhythmicChant": "小动物 rain or shine，身子高 affect，让我们 dry 拥抱大自然。"
      },
      {
        "id": "pep_7b_u7",
        "title": "Unit 7",
        "chineseTitle": "博物馆探秘奇旅",
        "words": [
          {
            "english": "meet up",
            "chinese": "[短语] 碰头；相聚"
          },
          {
            "english": "museum",
            "chinese": "[n.] 博物馆"
          },
          {
            "english": "exhibition",
            "chinese": "[n.] 展览"
          },
          {
            "english": "direction",
            "chinese": "[n.] 方向"
          },
          {
            "english": "trip",
            "chinese": "[n.] 旅行"
          },
          {
            "english": "wastewater",
            "chinese": "[n.] 废水"
          },
          {
            "english": "plant",
            "chinese": "[n.] 工厂"
          },
          {
            "english": "into",
            "chinese": "[prep.] 到……里面；进入"
          },
          {
            "english": "screen",
            "chinese": "[n.] 滤网；隔板；屏幕"
          },
          {
            "english": "remove",
            "chinese": "[v.] 移开；拿走"
          },
          {
            "english": "piece",
            "chinese": "[n.] 片；块"
          },
          {
            "english": "waste",
            "chinese": "[n. & v.] n. 废弃物 / v. 浪费"
          },
          {
            "english": "machine",
            "chinese": "[n.] 机器"
          },
          {
            "english": "germ",
            "chinese": "[n.] 微生物；细菌"
          },
          {
            "english": "step",
            "chinese": "[n.] 步骤；脚步"
          },
          {
            "english": "used to",
            "chinese": "[短语] 过去常常（做）"
          },
          {
            "english": "realize",
            "chinese": "[v.] 认识到；实现"
          },
          {
            "english": "inside",
            "chinese": "[prep. & adv.] prep. 在……里面 / adv. 在里面"
          },
          {
            "english": "go on a trip",
            "chinese": "[短语] 去旅行"
          },
          {
            "english": "process",
            "chinese": "[n.] 过程"
          },
          {
            "english": "theatre",
            "chinese": "[n.] 戏院；剧场；电影院"
          },
          {
            "english": "factory",
            "chinese": "[n.] 工厂"
          },
          {
            "english": "terrible",
            "chinese": "[adj.] 糟糕的"
          },
          {
            "english": "actor",
            "chinese": "[n.] 演员"
          },
          {
            "english": "gun",
            "chinese": "[n.] 枪"
          },
          {
            "english": "try on",
            "chinese": "[短语] 试穿"
          },
          {
            "english": "along",
            "chinese": "[prep.] 沿着；顺着"
          },
          {
            "english": "road",
            "chinese": "[n.] 道路"
          },
          {
            "english": "create",
            "chinese": "[v.] 创造"
          },
          {
            "english": "record",
            "chinese": "[v. & n.] v. 记录 / n. 记录"
          },
          {
            "english": "thought",
            "chinese": "[n.] 想法"
          },
          {
            "english": "skill",
            "chinese": "[n.] 技能"
          },
          {
            "english": "write down",
            "chinese": "[短语] 写下；记下"
          },
          {
            "english": "explore",
            "chinese": "[v.] 探索"
          },
          {
            "english": "tent",
            "chinese": "[n.] 帐篷"
          },
          {
            "english": "cucumber",
            "chinese": "[n.] 黄瓜"
          },
          {
            "english": "from ... to ...",
            "chinese": "[短语] 从……到……"
          },
          {
            "english": "straight",
            "chinese": "[adv. & adj.] adv. 直接；立即；笔直地 / adj. 直的"
          },
          {
            "english": "fill",
            "chinese": "[v.] 装满；盛满"
          },
          {
            "english": "basket",
            "chinese": "[n.] 篮子；筐"
          },
          {
            "english": "teach",
            "chinese": "[v.] 教 (taught/taught)"
          },
          {
            "english": "branch",
            "chinese": "[n.] 分支；树枝"
          },
          {
            "english": "leaf",
            "chinese": "[n.] 叶；叶子 (pl. leaves)"
          },
          {
            "english": "finally",
            "chinese": "[adv.] 最后"
          },
          {
            "english": "think of",
            "chinese": "[短语] 考虑；想起"
          },
          {
            "english": "grain",
            "chinese": "[n.] 谷物；谷粒"
          },
          {
            "english": "fresh",
            "chinese": "[adj.] 新鲜的"
          },
          {
            "english": "certainly",
            "chinese": "[adv.] 肯定；当然"
          },
          {
            "english": "diary",
            "chinese": "[n.] 日记；日记本"
          },
          {
            "english": "entry",
            "chinese": "[n.] （日记的）一则；入口"
          },
          {
            "english": "agree",
            "chinese": "[v.] 赞成；同意"
          },
          {
            "english": "agree with",
            "chinese": "[短语] 赞成；同意"
          }
        ],
        "rhythmicChant": "小动物 meet up，身子高 museum，让我们 exhibition 拥抱大自然。"
      },
      {
        "id": "pep_7b_u8",
        "title": "Unit 8",
        "chineseTitle": "昔日传说古今诺",
        "words": [
          {
            "english": "upon",
            "chinese": "[prep.] 在……上"
          },
          {
            "english": "once upon a time",
            "chinese": "[短语] 从前；很久以前"
          },
          {
            "english": "bite",
            "chinese": "[v.] 咬；咬伤 (bit/bitten)"
          },
          {
            "english": "bite through",
            "chinese": "[短语] 咬穿"
          },
          {
            "english": "net",
            "chinese": "[n.] 网；网状物"
          },
          {
            "english": "hunter",
            "chinese": "[n.] 猎人；搜寻者"
          },
          {
            "english": "promise",
            "chinese": "[v. & n.] 承诺；保证；诺言"
          },
          {
            "english": "long ago",
            "chinese": "[短语] 很久以前"
          },
          {
            "english": "war",
            "chinese": "[n.] 战争"
          },
          {
            "english": "neighbour",
            "chinese": "[n.] 邻居"
          },
          {
            "english": "wise",
            "chinese": "[adj.] 明智的；高明的"
          },
          {
            "english": "emperor",
            "chinese": "[n.] 皇帝"
          },
          {
            "english": "lie",
            "chinese": "[v. & n.] v. 撒谎 / n. 谎言"
          },
          {
            "english": "pretend",
            "chinese": "[v.] 假装；伪装"
          },
          {
            "english": "official",
            "chinese": "[n.] 官员；高级职员"
          },
          {
            "english": "silly",
            "chinese": "[adj.] 愚蠢的；傻的"
          },
          {
            "english": "decide",
            "chinese": "[v.] 决定"
          },
          {
            "english": "praise",
            "chinese": "[v. & n.] 赞美；表扬"
          },
          {
            "english": "afraid",
            "chinese": "[adj.] 害怕的；担心的"
          },
          {
            "english": "suddenly",
            "chinese": "[adv.] 突然地；出乎意料地"
          },
          {
            "english": "at first",
            "chinese": "[短语] 起初；最初"
          },
          {
            "english": "truth",
            "chinese": "[n.] 真像；事实"
          },
          {
            "english": "tell the truth",
            "chinese": "[短语] 说实话"
          },
          {
            "english": "make money",
            "chinese": "[短语] 赚钱"
          },
          {
            "english": "true",
            "chinese": "[adj.] 符合事实的；真正的"
          },
          {
            "english": "hate",
            "chinese": "[v.] 不喜欢；厌恶；讨厌"
          },
          {
            "english": "get out",
            "chinese": "[短语] 逃脱；离开"
          },
          {
            "english": "king",
            "chinese": "[n.] 君主；国王"
          },
          {
            "english": "artist",
            "chinese": "[n.] 美术家；艺术家"
          },
          {
            "english": "quickly",
            "chinese": "[adv.] 快速地；很快"
          },
          {
            "english": "smile",
            "chinese": "[v. & n.] 微笑；笑容"
          },
          {
            "english": "all over",
            "chinese": "[短语] 到处；遍及"
          },
          {
            "english": "ugly",
            "chinese": "[adj.] 丑陋的；难看的"
          },
          {
            "english": "duckling",
            "chinese": "[n.] 小鸭子"
          },
          {
            "english": "real",
            "chinese": "[adj.] 真的；真正的"
          },
          {
            "english": "laugh at",
            "chinese": "[短语] 嘲笑"
          },
          {
            "english": "go away",
            "chinese": "[短语] 走开"
          },
          {
            "english": "search",
            "chinese": "[v.] 寻找；搜寻"
          },
          {
            "english": "search for",
            "chinese": "[短语] 寻找"
          },
          {
            "english": "hen",
            "chinese": "[n.] 母鸡"
          },
          {
            "english": "hopefully",
            "chinese": "[adv.] 有希望地"
          },
          {
            "english": "purr",
            "chinese": "[v.] （猫）发出呼噜声"
          },
          {
            "english": "lay",
            "chinese": "[v.] 下（蛋）；放置；搁 (laid/laid)"
          },
          {
            "english": "swan",
            "chinese": "[n.] 天鹅"
          },
          {
            "english": "feather",
            "chinese": "[n.] 羽毛"
          },
          {
            "english": "to sb's surprise",
            "chinese": "[短语] 出乎某人的意料"
          },
          {
            "english": "size",
            "chinese": "[n.] 大大小；尺寸"
          },
          {
            "english": "only if",
            "chinese": "[短语] 只有"
          },
          {
            "english": "fisherman",
            "chinese": "[n.] 渔夫 (pl. fishermen)"
          },
          {
            "english": "fishing",
            "chinese": "[n.] 钓鱼；捕鱼"
          },
          {
            "english": "come out",
            "chinese": "[短语] 出现；盛开"
          },
          {
            "english": "genie",
            "chinese": "[n.] 妖怪；鬼"
          },
          {
            "english": "die",
            "chinese": "[v.] 死亡；消失"
          },
          {
            "english": "make promise",
            "chinese": "[短语] 许下诺言"
          },
          {
            "english": "someone",
            "chinese": "[pron.] 某人；有人"
          },
          {
            "english": "set",
            "chinese": "[v.] 使处于某种状况；使开始"
          },
          {
            "english": "set ... free",
            "chinese": "[短语] 释放"
          },
          {
            "english": "rich",
            "chinese": "[adj.] 富有的；富含……的"
          },
          {
            "english": "powerful",
            "chinese": "[adj.] 强大的；有影响力的"
          },
          {
            "english": "anyone",
            "chinese": "[pron.] 任何人；某个人"
          },
          {
            "english": "instead of",
            "chinese": "[短语] 而不是；代替"
          },
          {
            "english": "succeed in doing sth",
            "chinese": "[短语] 成功做成某事"
          },
          {
            "english": "himself",
            "chinese": "[pron.] 他自己；他本人"
          },
          {
            "english": "in the end",
            "chinese": "[短语] 最后；终究"
          }
        ],
        "rhythmicChant": "小动物 upon，身子高 once upon a time，让我们 bite 拥抱大自然。"
      }
    ]
  },
  {
    "id": "pep_8a",
    "title": "八年级上册 (Grade 8 Vol 1)",
    "units": [
      {
        "id": "pep_8a_u1",
        "title": "Unit 1",
        "chineseTitle": "探索古老旅行地",
        "words": [
          {
            "english": "ancient",
            "chinese": "adj. 古代的；古老的"
          },
          {
            "english": "camp",
            "chinese": "n. 度慢营；营地 v. 露营；宿营"
          },
          {
            "english": "landscape",
            "chinese": "n. 风景；景色"
          },
          {
            "english": "strange",
            "chinese": "adj. 奇怪的；陌生的"
          },
          {
            "english": "vacation",
            "chinese": "n. 假期；度假"
          },
          {
            "english": "fantastic",
            "chinese": "adj. 极好的；吸引人的"
          },
          {
            "english": "town",
            "chinese": "n. 镇；商业区"
          },
          {
            "english": "breath",
            "chinese": "n. 呼吸的空气；一口气"
          },
          {
            "english": "take sb's breath away",
            "chinese": "令人惊叹；让人叹绝"
          },
          {
            "english": "especially",
            "chinese": "adv. 尤其；特别"
          },
          {
            "english": "steamed chicken soup",
            "chinese": "汽锅鸡"
          },
          {
            "english": "anywhere",
            "chinese": "adv. & pron. 在任何地方；随便哪个地方"
          },
          {
            "english": "nothing",
            "chinese": "pron. 没有事；没有任何东西"
          },
          {
            "english": "guide",
            "chinese": "n. 导游；指南；手册 v. 给某人领路；指导"
          },
          {
            "english": "scenery",
            "chinese": "n. 风景；景色"
          },
          {
            "english": "silk",
            "chinese": "n. 丝绸；（蚕）丝"
          },
          {
            "english": "scarf",
            "chinese": "n. 围巾；披巾"
          },
          {
            "english": "ready",
            "chinese": "adj. 准备好的；现成的 adv. 已做完；已完成"
          },
          {
            "english": "ready to do sth",
            "chinese": "马上要（做某事）；愿意做（某事）"
          },
          {
            "english": "somewhere",
            "chinese": "adv. 在某处；到某处"
          },
          {
            "english": "myself",
            "chinese": "pron. 我自己"
          },
          {
            "english": "nothing but",
            "chinese": "只有；只是"
          },
          {
            "english": "hotel",
            "chinese": "n. 旅馆；旅社"
          },
          {
            "english": "comfortable",
            "chinese": "adj. 使人舒服的；舒适的"
          },
          {
            "english": "bored",
            "chinese": "adj. 厌倦的；烦闷的"
          },
          {
            "english": "sky",
            "chinese": "n. 天；天空"
          },
          {
            "english": "towards",
            "chinese": "prep. 向；朝 (= toward)"
          },
          {
            "english": "rainbow",
            "chinese": "n. 虹；彩虹"
          },
          {
            "english": "square",
            "chinese": "n. 广场；正方形 adj. 正方形的；平方的"
          },
          {
            "english": "during",
            "chinese": "prep. 在……期间"
          },
          {
            "english": "victory",
            "chinese": "n. 胜利；成功"
          },
          {
            "english": "Russian",
            "chinese": "adj. 俄罗斯的；俄罗斯人的 n. 俄罗斯人；俄语"
          },
          {
            "english": "fight",
            "chinese": "n. 战斗；搏斗；斗争 v. (fought) 打仗；打架"
          },
          {
            "english": "against",
            "chinese": "prep. 反对；与……相反；紧靠"
          },
          {
            "english": "fight against sb / sth",
            "chinese": "与……作战；与……作斗争"
          },
          {
            "english": "artwork",
            "chinese": "n. 艺术作品；插图"
          },
          {
            "english": "thousands of",
            "chinese": "数以千计的；成千上万的"
          },
          {
            "english": "tear",
            "chinese": "n. 眼泪；泪水"
          },
          {
            "english": "remind",
            "chinese": "v. 提醒；使想起"
          },
          {
            "english": "peace",
            "chinese": "n. 和平；太平"
          },
          {
            "english": "easily",
            "chinese": "adv. 容易地；轻易地"
          },
          {
            "english": "forget",
            "chinese": "v. (forgot) 忘记；遗忘"
          },
          {
            "english": "noon",
            "chinese": "n. 正午；中午"
          },
          {
            "english": "sick",
            "chinese": "adj. 恶心的；生病的"
          },
          {
            "english": "metro",
            "chinese": "n. 地下铁道系统"
          },
          {
            "english": "station",
            "chinese": "n. 车站；所；局"
          },
          {
            "english": "palace",
            "chinese": "n. 王宫；宫殿"
          },
          {
            "english": "accordion",
            "chinese": "n. 手风琴"
          },
          {
            "english": "get together",
            "chinese": "聚会；相聚"
          },
          {
            "english": "in the sun",
            "chinese": "在阳光下"
          },
          {
            "english": "tower",
            "chinese": "n. 塔；塔楼"
          },
          {
            "english": "might",
            "chinese": "modal v. 可能；可以"
          },
          {
            "english": "budget",
            "chinese": "n. 预算 v. 把……编入预算；精打细算"
          },
          {
            "english": "passport",
            "chinese": "n. 护照"
          },
          {
            "english": "forgetful",
            "chinese": "adj. 健忘的；好忘事的"
          },
          {
            "english": "faraway",
            "chinese": "adj. 远方的；遥远的"
          },
          {
            "english": "regular",
            "chinese": "adj. 平常的；有规律的"
          },
          {
            "english": "countryside",
            "chinese": "n. 乡村；农村"
          },
          {
            "english": "turn around",
            "chinese": "转身；翻转"
          },
          {
            "english": "surprised",
            "chinese": "adj. 惊奇的；惊讶的"
          },
          {
            "english": "deer",
            "chinese": "n. (pl. deer) 鹿"
          },
          {
            "english": "probably",
            "chinese": "adv. 很可能；大概"
          },
          {
            "english": "look for",
            "chinese": "寻找"
          },
          {
            "english": "Guest-Greeting Pine",
            "chinese": "迎客松"
          },
          {
            "english": "Sea of Clouds",
            "chinese": "云海"
          },
          {
            "english": "Seattle",
            "chinese": "西雅图（美国城市）"
          },
          {
            "english": "Red Square",
            "chinese": "红场"
          },
          {
            "english": "Alexander Garden",
            "chinese": "亚历山大花园"
          },
          {
            "english": "Vincent",
            "chinese": "文森特"
          },
          {
            "english": "Moscow",
            "chinese": "莫斯科（俄罗斯首都）"
          },
          {
            "english": "Russia",
            "chinese": "俄罗斯"
          },
          {
            "english": "the Victory Museum",
            "chinese": "胜利博物馆"
          },
          {
            "english": "Nazi",
            "chinese": "n. 纳粹党人；纳粹分子"
          },
          {
            "english": "World War II",
            "chinese": "第二次世界大战"
          },
          {
            "english": "Moscow Metro",
            "chinese": "莫斯科地铁"
          },
          {
            "english": "Scotland",
            "chinese": "苏格兰"
          }
        ],
        "rhythmicChant": "景色很 ancient，夜晚去 camp，让我们在这 landscape 里放松。"
      },
      {
        "id": "pep_8a_u2",
        "title": "Unit 2",
        "chineseTitle": "居家整理与互助",
        "words": [
          {
            "english": "pack",
            "chinese": "v. 打包；收拾"
          },
          {
            "english": "pack up",
            "chinese": "打包"
          },
          {
            "english": "bathroom",
            "chinese": "n. 浴室；洗手间"
          },
          {
            "english": "sort",
            "chinese": "v. 把……分类；整理 n. 种类"
          },
          {
            "english": "bedroom",
            "chinese": "n. 卧室"
          },
          {
            "english": "balcony",
            "chinese": "n. 阳台"
          },
          {
            "english": "hang up",
            "chinese": "挂起；挂断电话"
          },
          {
            "english": "invite",
            "chinese": "v. 邀请"
          },
          {
            "english": "living room",
            "chinese": "客厅"
          },
          {
            "english": "arrival",
            "chinese": "n. 到达"
          },
          {
            "english": "yet",
            "chinese": "adv. 还（用于否定句和疑问句） conj. 但是"
          },
          {
            "english": "add",
            "chinese": "v. 添加；加"
          },
          {
            "english": "add sth to sth",
            "chinese": "把……加入……"
          },
          {
            "english": "go shopping",
            "chinese": "去购物"
          },
          {
            "english": "biscuit",
            "chinese": "n. 饼干"
          },
          {
            "english": "borrow",
            "chinese": "v. 借"
          },
          {
            "english": "plan",
            "chinese": "v. 策划；打算 n. 计划；方案"
          },
          {
            "english": "treasure",
            "chinese": "n. 宝物；财富 v. 珍视"
          },
          {
            "english": "hunt",
            "chinese": "n. 搜寻；狩猎 v. 搜寻；打猎"
          },
          {
            "english": "treasure hunt",
            "chinese": "寻宝游戏"
          },
          {
            "english": "lift",
            "chinese": "n. 搭便车；电梯 v. 举起；抬起"
          },
          {
            "english": "give sb a lift",
            "chinese": "开车顺便送某人"
          },
          {
            "english": "until",
            "chinese": "prep. 到……时；直到……为止"
          },
          {
            "english": "be careful with",
            "chinese": "注意；当心"
          },
          {
            "english": "movie",
            "chinese": "n. 电影"
          },
          {
            "english": "the movies",
            "chinese": "电影院；电影产业"
          },
          {
            "english": "dead",
            "chinese": "adj. 不运行的；死的"
          },
          {
            "english": "note",
            "chinese": "n. 笔记；记录；便条 v. 注意；指出"
          },
          {
            "english": "take notes",
            "chinese": "做笔记"
          },
          {
            "english": "clean up",
            "chinese": "清扫"
          },
          {
            "english": "community",
            "chinese": "n. 社区；社团"
          },
          {
            "english": "rubbish",
            "chinese": "n. 垃圾"
          },
          {
            "english": "almost",
            "chinese": "adv. 差不多；几乎"
          },
          {
            "english": "journey",
            "chinese": "n. 旅行；历程 v. 旅行"
          },
          {
            "english": "pull",
            "chinese": "v. & n. 拉；拖；拽"
          },
          {
            "english": "luggage",
            "chinese": "n. 行艺"
          },
          {
            "english": "ah",
            "chinese": "interj. 啊（表示高兴、惊奇等）"
          },
          {
            "english": "share sth with sb",
            "chinese": "把……与……分享"
          },
          {
            "english": "mm",
            "chinese": "interj. 嗯（表示喜欢、同意等） (= mmm)"
          },
          {
            "english": "familiar",
            "chinese": "adj. 熟悉的"
          },
          {
            "english": "joke",
            "chinese": "n. 笑话 v. 开玩笑"
          },
          {
            "english": "several",
            "chinese": "pron. 几个；一些"
          },
          {
            "english": "nod",
            "chinese": "v. & n. 点头"
          },
          {
            "english": "writer",
            "chinese": "n. 作者"
          },
          {
            "english": "text",
            "chinese": "n. 正文；文本 v. （用手机给某人）发短信"
          },
          {
            "english": "describe",
            "chinese": "v. 描述；形容"
          },
          {
            "english": "wherever",
            "chinese": "adv. & conj. 无论去哪里；在任何地方"
          },
          {
            "english": "matter",
            "chinese": "v. 要紧 n. 问题"
          },
          {
            "english": "no matter",
            "chinese": "不论；不要紧"
          },
          {
            "english": "perhaps",
            "chinese": "adv. 也许；可能"
          },
          {
            "english": "plate",
            "chinese": "n. 盘子；碟子"
          },
          {
            "english": "freshly",
            "chinese": "adv. 刚刚"
          },
          {
            "english": "smell",
            "chinese": "v. 发臭；闻到 n. 气味；臭味"
          },
          {
            "english": "joy",
            "chinese": "n. 喜悦；乐趣"
          },
          {
            "english": "apartment",
            "chinese": "n. 房间；公寓套房"
          },
          {
            "english": "block",
            "chinese": "n. 大楼；街区；大块 v. 阻挡；堵塞"
          },
          {
            "english": "decorate",
            "chinese": "v. 装饰；装潢"
          },
          {
            "english": "cover",
            "chinese": "v. 遮盖；包括 n. 遮盖物；封皮"
          },
          {
            "english": "poster",
            "chinese": "n. 海报"
          },
          {
            "english": "scissors",
            "chinese": "n. (pl.) 剪刀"
          },
          {
            "english": "glue",
            "chinese": "n. 胶水 v. 粘贴"
          },
          {
            "english": "paper-cut",
            "chinese": "n. 剪纸"
          }
        ],
        "rhythmicChant": "景色很 pack，夜晚去 pack up，让我们在这 bathroom 里放松。"
      },
      {
        "id": "pep_8a_u3",
        "title": "Unit 3",
        "chineseTitle": "性格比拼与幽默",
        "words": [
          {
            "english": "compare",
            "chinese": "v. 比较；对比"
          },
          {
            "english": "shy",
            "chinese": "adj. 害羞的"
          },
          {
            "english": "lazy",
            "chinese": "adj. 懒惰的；懒洋洋的"
          },
          {
            "english": "loud",
            "chinese": "adv. 响亮地 adj. 大声的"
          },
          {
            "english": "outgoing",
            "chinese": "adj. 外向的"
          },
          {
            "english": "hard-working",
            "chinese": "adj. 勤奋的"
          },
          {
            "english": "perform",
            "chinese": "v. 表演；执行"
          },
          {
            "english": "alone",
            "chinese": "adv. & adj. 独自；单独"
          },
          {
            "english": "solve",
            "chinese": "v. 解决；解答"
          },
          {
            "english": "flute",
            "chinese": "n. 长笛"
          },
          {
            "english": "congratulation",
            "chinese": "n. 祝贺；恭喜"
          },
          {
            "english": "Congratulations (on ...)! （",
            "chinese": "对……表示）祝贺！"
          },
          {
            "english": "prize",
            "chinese": "n. 奖；奖励"
          },
          {
            "english": "attend",
            "chinese": "v. 参加；出席"
          },
          {
            "english": "as ... as ...",
            "chinese": "像……一样……"
          },
          {
            "english": "besides",
            "chinese": "prep. 除……之外（还） adv. 而且"
          },
          {
            "english": "spare",
            "chinese": "adj. 空闲的；备用的 v. 抽出；拨出"
          },
          {
            "english": "spare time",
            "chinese": "空闲时间"
          },
          {
            "english": "pleasure",
            "chinese": "n. 乐事；愉快；荣幸"
          },
          {
            "english": "have sth in common",
            "chinese": "有共同之处"
          },
          {
            "english": "appearance",
            "chinese": "n. 外表；露面"
          },
          {
            "english": "personality",
            "chinese": "n. 性格；品质"
          },
          {
            "english": "serious",
            "chinese": "adj. 严肃的；严重的"
          },
          {
            "english": "strength",
            "chinese": "n. 优势；力量"
          },
          {
            "english": "slim",
            "chinese": "adj. 苗条的；薄的"
          },
          {
            "english": "fact",
            "chinese": "n. 事实；现实"
          },
          {
            "english": "population",
            "chinese": "n. 人口"
          },
          {
            "english": "km",
            "chinese": "千米；公里 (= kilometre / kilometer)"
          },
          {
            "english": "average",
            "chinese": "adj. 平均的；平常的 n. 平均数；平均水准"
          },
          {
            "english": "rainfall",
            "chinese": "n. 降雨量"
          },
          {
            "english": "per",
            "chinese": "prep. 每"
          },
          {
            "english": "mm",
            "chinese": "毫米 (= millimetre / millimeter)"
          },
          {
            "english": "pleasant",
            "chinese": "adj. 宜人的；友好的"
          },
          {
            "english": "difference",
            "chinese": "n. 差异"
          },
          {
            "english": "alike",
            "chinese": "adj. 相像的 adv. 相似地"
          },
          {
            "english": "mirror",
            "chinese": "n. 镜子"
          },
          {
            "english": "interest",
            "chinese": "n. 业余爱好；兴趣 v. 使感兴趣"
          },
          {
            "english": "novel",
            "chinese": "n. 小说"
          },
          {
            "english": "sense",
            "chinese": "n. 理解力；感觉 v. 意识到；感觉到"
          },
          {
            "english": "humour",
            "chinese": "n. 幽默；幽默感 (= humor)"
          },
          {
            "english": "thanks to",
            "chinese": "归功于；由于；因为"
          },
          {
            "english": "opinion",
            "chinese": "n. 看法；意见"
          },
          {
            "english": "make a mistake",
            "chinese": "犯错误"
          },
          {
            "english": "less",
            "chinese": "adj. 较少的；更少的 adv. 较少地 pron. 较少"
          },
          {
            "english": "straightforward",
            "chinese": "adj. 坦率的；简单的"
          },
          {
            "english": "honest",
            "chinese": "adj. 坦诚的；诚实的"
          },
          {
            "english": "direct",
            "chinese": "adj. 率直的；直接的"
          },
          {
            "english": "similarity",
            "chinese": "n. 相似之处"
          },
          {
            "english": "friendship",
            "chinese": "n. 友谊；友情"
          },
          {
            "english": "metre",
            "chinese": "米 (= meter)"
          },
          {
            "english": "prince",
            "chinese": "n. 王子"
          },
          {
            "english": "character",
            "chinese": "n. 人物；个性"
          },
          {
            "english": "pauper",
            "chinese": "n. 贫民；乞丐"
          },
          {
            "english": "exchange",
            "chinese": "v. & n. 交换"
          },
          {
            "english": "Julie",
            "chinese": "朱莉"
          },
          {
            "english": "Vancouver",
            "chinese": "温哥华（加拿大城市）"
          },
          {
            "english": "Matt",
            "chinese": "马特"
          },
          {
            "english": "Stephen",
            "chinese": "斯蒂芬"
          },
          {
            "english": "Diana",
            "chinese": "戴安娜"
          },
          {
            "english": "Edward",
            "chinese": "爱德华"
          },
          {
            "english": "Mark Twain",
            "chinese": "马克·吐温"
          },
          {
            "english": "Rose",
            "chinese": "罗丝"
          }
        ],
        "rhythmicChant": "景色很 compare，夜晚去 shy，让我们在这 lazy 里放松。"
      },
      {
        "id": "pep_8a_u4",
        "title": "Unit 4",
        "chineseTitle": "保护珍稀之物",
        "words": [
          {
            "english": "accident",
            "chinese": "n. 意外；（交通）事故"
          },
          {
            "english": "by accident",
            "chinese": "偶然；意外地"
          },
          {
            "english": "expect",
            "chinese": "v. 预料；期待"
          },
          {
            "english": "silver",
            "chinese": "adj. 银色的 n. 银"
          },
          {
            "english": "lining",
            "chinese": "n. 内衬"
          },
          {
            "english": "silver lining",
            "chinese": "一线光明"
          },
          {
            "english": "situation",
            "chinese": "n. 情况；状况"
          },
          {
            "english": "care about",
            "chinese": "关心；担心"
          },
          {
            "english": "reach",
            "chinese": "v. 伸手；到达"
          },
          {
            "english": "reach for",
            "chinese": "伸手触碰"
          },
          {
            "english": "touch",
            "chinese": "v. 触动；触碰"
          },
          {
            "english": "lend (sb) a hand",
            "chinese": "帮助（某人）"
          },
          {
            "english": "moss",
            "chinese": "n. 苔藓"
          },
          {
            "english": "redwood",
            "chinese": "n. 红杉；红木"
          },
          {
            "english": "cheetah",
            "chinese": "n. 猎豹"
          },
          {
            "english": "folding",
            "chinese": "adj. 折叠式的；可折叠的"
          },
          {
            "english": "folding fan",
            "chinese": "折扇"
          },
          {
            "english": "bamboo",
            "chinese": "n. 竹；竹子"
          },
          {
            "english": "yeah",
            "chinese": "interj. 是的；对"
          },
          {
            "english": "popular",
            "chinese": "adj. 广受欢迎的；流行的"
          },
          {
            "english": "goodness",
            "chinese": "n. 美德；营养"
          },
          {
            "english": "tool",
            "chinese": "n. 工具；手段"
          },
          {
            "english": "actually",
            "chinese": "adv. 实际上；居然"
          },
          {
            "english": "shoot",
            "chinese": "n. 幼苗；嫩芽 v. (shot) 开（枪）；射击"
          },
          {
            "english": "appear",
            "chinese": "v. 出现；看来好像"
          },
          {
            "english": "feel free (to do sth)",
            "chinese": "可以随便做某事"
          },
          {
            "english": "land",
            "chinese": "n. 陆地；土地 v. 降落；着陆"
          },
          {
            "english": "African",
            "chinese": "adj. 非洲的；非洲人的 n. 非洲人"
          },
          {
            "english": "rose",
            "chinese": "n. 玫瑰；蔷薇"
          },
          {
            "english": "peony",
            "chinese": "n. 牡丹；芍药"
          },
          {
            "english": "lotus",
            "chinese": "n. 莲花"
          },
          {
            "english": "butterfly",
            "chinese": "n. 蝴蝶"
          },
          {
            "english": "wing",
            "chinese": "n. 翅膀；翼"
          },
          {
            "english": "frog",
            "chinese": "n. 蛙；青蛙"
          },
          {
            "english": "up to",
            "chinese": "接近；直到"
          },
          {
            "english": "weigh",
            "chinese": "v. 有……重；称重量"
          },
          {
            "english": "kg",
            "chinese": "千克；公斤 (= kilogram; kilogramme)"
          },
          {
            "english": "ginkgo",
            "chinese": "n. 银杏"
          },
          {
            "english": "believe",
            "chinese": "v. 相信；认为有可能"
          },
          {
            "english": "province",
            "chinese": "n. 省份"
          },
          {
            "english": "take a walk",
            "chinese": "散步"
          },
          {
            "english": "connect",
            "chinese": "v. 关联；连接"
          },
          {
            "english": "connected",
            "chinese": "adj. 连接的；相关的"
          },
          {
            "english": "be connected with / to",
            "chinese": "与……相连；与……有关联"
          },
          {
            "english": "without",
            "chinese": "prep. 没有；缺乏"
          },
          {
            "english": "imagine",
            "chinese": "v. 想象；猜想"
          },
          {
            "english": "honey",
            "chinese": "n. 蜂蜜；（爱称）亲爱的"
          },
          {
            "english": "disappointed",
            "chinese": "adj. 失望的；沮丧的"
          },
          {
            "english": "connection",
            "chinese": "n. 联系；连接"
          },
          {
            "english": "pollination",
            "chinese": "n. 授粉"
          },
          {
            "english": "pollen",
            "chinese": "n. 花粉"
          },
          {
            "english": "action",
            "chinese": "n. 行动；行为"
          },
          {
            "english": "in fact",
            "chinese": "确切地说；实际上"
          },
          {
            "english": "per cent",
            "chinese": "n. 百分之…… adj. & adv. 每一百中 (= percent)"
          },
          {
            "english": "for this reason",
            "chinese": "出于这个原因"
          },
          {
            "english": "planet",
            "chinese": "n. 行星"
          },
          {
            "english": "in order to",
            "chinese": "为了；以便"
          },
          {
            "english": "store",
            "chinese": "v. 贮存；存储 n. 百货商店；商店"
          },
          {
            "english": "honeycomb",
            "chinese": "n. 蜂巢"
          },
          {
            "english": "communicate",
            "chinese": "v. 交流；沟通"
          },
          {
            "english": "play a part (in sth)",
            "chinese": "参与某事"
          },
          {
            "english": "ecosystem",
            "chinese": "n. 生态系统"
          },
          {
            "english": "protect",
            "chinese": "v. 保护；防护"
          },
          {
            "english": "importance",
            "chinese": "n. 重要性"
          },
          {
            "english": "title",
            "chinese": "n. 标题；题目；名称"
          },
          {
            "english": "human",
            "chinese": "n. 人 adj. 人的；人类的"
          },
          {
            "english": "ant",
            "chinese": "n. 蚂蚁"
          },
          {
            "english": "be home to sb / sth",
            "chinese": "有……栖息；是……的家乡"
          },
          {
            "english": "happiness",
            "chinese": "n. 幸福；快乐"
          },
          {
            "english": "disappoint",
            "chinese": "v. 使失望；使破灭"
          },
          {
            "english": "mushroom",
            "chinese": "n. 蘑菇；伞菌"
          },
          {
            "english": "ton",
            "chinese": "n. 吨"
          },
          {
            "english": "role",
            "chinese": "n. 作用；职能；角色"
          },
          {
            "english": "play a role (in)",
            "chinese": "在……中发挥作用；扮演角色"
          },
          {
            "english": "pea",
            "chinese": "n. 豌豆"
          },
          {
            "english": "climate",
            "chinese": "n. 气候"
          },
          {
            "english": "ocean",
            "chinese": "n. 大海；海洋"
          },
          {
            "english": "except",
            "chinese": "prep. 除……之外；除了"
          },
          {
            "english": "tiny",
            "chinese": "adj. 极小的；微小的"
          },
          {
            "english": "lively",
            "chinese": "adj. 精力充沛的；生机勃勃的"
          },
          {
            "english": "the Arctic Ocean",
            "chinese": "北冰洋"
          },
          {
            "english": "Billy",
            "chinese": "比利"
          }
        ],
        "rhythmicChant": "景色很 accident，夜晚去 by accident，让我们在这 expect 里放松。"
      },
      {
        "id": "pep_8a_u5",
        "title": "Unit 5",
        "chineseTitle": "食材烘焙新创意",
        "words": [
          {
            "english": "pepper",
            "chinese": "n. 胡椒粉；菜椒"
          },
          {
            "english": "cut up",
            "chinese": "切碎；剁碎"
          },
          {
            "english": "mix",
            "chinese": "v. （使）混合；融合；调配 n. 混合；混杂；混合料"
          },
          {
            "english": "bake",
            "chinese": "v. 烘烤"
          },
          {
            "english": "oven",
            "chinese": "n. 烤箱；烤炉"
          },
          {
            "english": "pour sth into sth",
            "chinese": "将……倒入……"
          },
          {
            "english": "flour",
            "chinese": "n. 面粉"
          },
          {
            "english": "boil",
            "chinese": "v. 煮沸；烧开 n. 沸腾；沸点"
          },
          {
            "english": "butter",
            "chinese": "n. 黄油"
          },
          {
            "english": "cheese",
            "chinese": "n. 奶酪；干酪"
          },
          {
            "english": "cut sth in / into sth",
            "chinese": "将……切成……"
          },
          {
            "english": "tablespoon",
            "chinese": "n. 一汤匙（的量）；餐匙；汤匙"
          },
          {
            "english": "mash",
            "chinese": "v. 捣烂；捣碎"
          },
          {
            "english": "mashed potatoes",
            "chinese": "土豆泥"
          },
          {
            "english": "stir-fry",
            "chinese": "v. 翻炒；炒；熘"
          },
          {
            "english": "do with",
            "chinese": "处理"
          },
          {
            "english": "bowl",
            "chinese": "n. 碗；钵；盆"
          },
          {
            "english": "heat",
            "chinese": "v. 加热；变热 n. 热；温度；炎热天气"
          },
          {
            "english": "oil",
            "chinese": "n. 食用油；石油；燃油"
          },
          {
            "english": "pan",
            "chinese": "n. 平底锅；烤盘"
          },
          {
            "english": "put sth back",
            "chinese": "将……放回"
          },
          {
            "english": "mix ... with ... （",
            "chinese": "使）……和……混合"
          },
          {
            "english": "simple",
            "chinese": "adj. 简单的；朴素的"
          },
          {
            "english": "ingredient",
            "chinese": "n. 食材；成分"
          },
          {
            "english": "instruction",
            "chinese": "n. (pl.) 用法说明；操作指南"
          },
          {
            "english": "steamed fish",
            "chinese": "清蒸鱼"
          },
          {
            "english": "sour",
            "chinese": "adj. 酸的；有酸味的"
          },
          {
            "english": "hot and sour soup",
            "chinese": "酸辣汤"
          },
          {
            "english": "mess",
            "chinese": "n. 脏乱；凌乱"
          },
          {
            "english": "pretty",
            "chinese": "adj. 漂亮的；美丽的 adv. 相当；十分；非常"
          },
          {
            "english": "Christmas",
            "chinese": "n. 圣诞节"
          },
          {
            "english": "pancake",
            "chinese": "n. 烙饼；薄饼"
          },
          {
            "english": "dream",
            "chinese": "n. 梦想；梦 v. (dreamt / dreamed) 做梦；梦见"
          },
          {
            "english": "university",
            "chinese": "n. （综合性）大学；高等学府"
          },
          {
            "english": "go boating",
            "chinese": "去划船"
          },
          {
            "english": "memory",
            "chinese": "n. 回忆；记忆"
          },
          {
            "english": "visible",
            "chinese": "adj. 看得见的；可见的"
          },
          {
            "english": "along with sb / sth",
            "chinese": "除……以外（还）；与……同样地"
          },
          {
            "english": "pumpkin",
            "chinese": "n. 南瓜"
          },
          {
            "english": "pie",
            "chinese": "n. 果馅饼；肉馅饼"
          },
          {
            "english": "warm up （",
            "chinese": "使）活跃起来；热身；预热"
          },
          {
            "english": "cinnamon",
            "chinese": "n. 肉桂皮；桂皮香料"
          },
          {
            "english": "fill ... with ... （",
            "chinese": "使）充满；（使）填满"
          },
          {
            "english": "sweetness",
            "chinese": "n. 甜；芬芳；愉悦"
          },
          {
            "english": "college",
            "chinese": "n. 学院；大学"
          },
          {
            "english": "host",
            "chinese": "n. 主人；东道主 v. 主办；主持（活动）"
          },
          {
            "english": "hostess",
            "chinese": "n. 女主人；女房东"
          },
          {
            "english": "recipe",
            "chinese": "n. 食谱；烹饪法"
          },
          {
            "english": "cream",
            "chinese": "n. 奶油；护肤霜"
          },
          {
            "english": "crust",
            "chinese": "n. 糕饼酥皮；面包皮"
          },
          {
            "english": "mixture",
            "chinese": "n. 混合物；结合体"
          },
          {
            "english": "least",
            "chinese": "adv. & pron. 最小；最少"
          },
          {
            "english": "at least",
            "chinese": "至少"
          },
          {
            "english": "secret",
            "chinese": "n. 诀窍；秘密 adj. 秘密的；隐秘的"
          },
          {
            "english": "according to",
            "chinese": "根据；依照"
          },
          {
            "english": "whenever",
            "chinese": "adv. & conj. 每当；在任何……的时候"
          },
          {
            "english": "item",
            "chinese": "n. 项目；条"
          },
          {
            "english": "spaghetti",
            "chinese": "n. 意大利细面条"
          },
          {
            "english": "spoon",
            "chinese": "n. (= spoonful) 一勺的量；勺"
          },
          {
            "english": "slice",
            "chinese": "n. 薄片；片 v. 把……切成薄片；切；割"
          },
          {
            "english": "couple",
            "chinese": "n. 夫妻；情侣；两人"
          },
          {
            "english": "island",
            "chinese": "n. 岛"
          },
          {
            "english": "wife",
            "chinese": "n. (pl. wives) 妻子"
          },
          {
            "english": "separate",
            "chinese": "adj. 单独的；分开的 v. （使）分开；（使）分离"
          },
          {
            "english": "born",
            "chinese": "v. 出生；出世 adj. 天生（有某方面才能）的"
          },
          {
            "english": "one by one",
            "chinese": "逐个地；逐一地"
          },
          {
            "english": "Thanksgiving",
            "chinese": "感恩节"
          },
          {
            "english": "Guoqiao Rice Noodles",
            "chinese": "过桥米线"
          }
        ],
        "rhythmicChant": "景色很 pepper，夜晚去 cut up，让我们在这 mix 里放松。"
      },
      {
        "id": "pep_8a_u6",
        "title": "Unit 6",
        "chineseTitle": "梦想职业与决议",
        "words": [
          {
            "english": "yourself",
            "chinese": "pron. (pl. yourselves) 你自己；您自己"
          },
          {
            "english": "engineer",
            "chinese": "n. 工程师；技师"
          },
          {
            "english": "fashion",
            "chinese": "n. 时装业；时尚"
          },
          {
            "english": "designer",
            "chinese": "n. 设计师"
          },
          {
            "english": "director",
            "chinese": "n. 导演；主任；董事"
          },
          {
            "english": "musician",
            "chinese": "n. 音乐家；乐师"
          },
          {
            "english": "fireman",
            "chinese": "n. (pl. firemen) 消防队员"
          },
          {
            "english": "AI",
            "chinese": "人工智能 (= artificial intelligence)"
          },
          {
            "english": "essay",
            "chinese": "n. 小论文；文章"
          },
          {
            "english": "classic",
            "chinese": "n. 经典作品；名著 adj. 最优秀的；古典的"
          },
          {
            "english": "keep on doing sth",
            "chinese": "继续做；反复做"
          },
          {
            "english": "make sure",
            "chinese": "确保；保证"
          },
          {
            "english": "try one's best",
            "chinese": "尽最大努力"
          },
          {
            "english": "literature",
            "chinese": "n. 文学；文献"
          },
          {
            "english": "athlete",
            "chinese": "n. 运动员"
          },
          {
            "english": "photographer",
            "chinese": "n. 摄影师；拍照者"
          },
          {
            "english": "painter",
            "chinese": "n. 画家；油漆匠"
          },
          {
            "english": "businessman",
            "chinese": "n. 商界人士；企业家"
          },
          {
            "english": "actress",
            "chinese": "n. 女演员"
          },
          {
            "english": "lawyer",
            "chinese": "n. 律师"
          },
          {
            "english": "law",
            "chinese": "n. 法律；法规"
          },
          {
            "english": "bath",
            "chinese": "n. 洗澡；浴缸"
          },
          {
            "english": "miss",
            "chinese": "v. 想念；错过"
          },
          {
            "english": "be tired of",
            "chinese": "对……感到厌倦"
          },
          {
            "english": "able",
            "chinese": "adj. 能够；有才能的"
          },
          {
            "english": "stick",
            "chinese": "v. (stuck) 粘贴；将……刺入 n. 枝条；棍"
          },
          {
            "english": "stick to sth",
            "chinese": "坚持；维持"
          },
          {
            "english": "resolution",
            "chinese": "n. 决定；决议"
          },
          {
            "english": "have (...) to do with sb / sth",
            "chinese": "与……有关联"
          },
          {
            "english": "mini-goal",
            "chinese": "n. 小目标"
          },
          {
            "english": "achieve",
            "chinese": "v. （经过努力）达到；完成"
          },
          {
            "english": "physical",
            "chinese": "adj. 身体的；物质的"
          },
          {
            "english": "health",
            "chinese": "n. 健康"
          },
          {
            "english": "healthily",
            "chinese": "adv. 健康地"
          },
          {
            "english": "take up",
            "chinese": "开始学；开始从事"
          },
          {
            "english": "photography",
            "chinese": "n. 照相术；摄影"
          },
          {
            "english": "self-improvement",
            "chinese": "n. 自我改进；自我提高"
          },
          {
            "english": "confident",
            "chinese": "adj. 自信的；肯定的"
          },
          {
            "english": "organized",
            "chinese": "adj. 有条理的；有组织的 (= organised)"
          },
          {
            "english": "wisely",
            "chinese": "adv. 聪明地；明智地"
          },
          {
            "english": "possible",
            "chinese": "adj. 可能的；合理的"
          },
          {
            "english": "paragraph",
            "chinese": "n. 段；段落"
          },
          {
            "english": "introduce",
            "chinese": "v. 介绍；引见；引进"
          },
          {
            "english": "meaning",
            "chinese": "n. 意义；含义"
          },
          {
            "english": "fail",
            "chinese": "v. 未能（做到）；失败"
          },
          {
            "english": "ahead",
            "chinese": "adv. 提前；在前面"
          },
          {
            "english": "put out",
            "chinese": "扑灭；把……摆好"
          },
          {
            "english": "design",
            "chinese": "v. 设计；计划 n. 设计；花纹"
          },
          {
            "english": "bridge",
            "chinese": "n. 桥"
          },
          {
            "english": "final",
            "chinese": "adj. 最后的；最终的 n. 决赛"
          },
          {
            "english": "confidence",
            "chinese": "n. 信心；信任"
          },
          {
            "english": "draw to a close",
            "chinese": "即将结束；即将完成"
          },
          {
            "english": "form",
            "chinese": "v. （使）形成；组成 n. 类型；形式；表格"
          },
          {
            "english": "relationship",
            "chinese": "n. 关系；联系"
          },
          {
            "english": "push-up",
            "chinese": "n. 俯卧撑"
          },
          {
            "english": "energetic",
            "chinese": "adj. 精力充沛的；充满活力的"
          },
          {
            "english": "last but not least",
            "chinese": "最后但同样重要的"
          },
          {
            "english": "Jason",
            "chinese": "贾森"
          },
          {
            "english": "Tina",
            "chinese": "蒂娜"
          }
        ],
        "rhythmicChant": "景色很 yourself，夜晚去 engineer，让我们在这 fashion 里放松。"
      },
      {
        "id": "pep_8a_u7",
        "title": "Unit 7",
        "chineseTitle": "预知未来科技",
        "words": [
          {
            "english": "prediction",
            "chinese": "n. 预测；预言"
          },
          {
            "english": "outer",
            "chinese": "adj. 外面的；外表的"
          },
          {
            "english": "outer space",
            "chinese": "太空；外层空间 (= space)"
          },
          {
            "english": "worse",
            "chinese": "adj. （bad 的比较级）更差的；更糟的；更坏的 adv. （badly 的比较级）更差；更糟；更坏"
          },
          {
            "english": "take over",
            "chinese": "接替；接管；接收"
          },
          {
            "english": "sci-fi",
            "chinese": "n. 科幻小说（或影片等） (= science fiction)"
          },
          {
            "english": "ticket",
            "chinese": "n. 票；券"
          },
          {
            "english": "positive",
            "chinese": "adj. 乐观的；积极的；良好的"
          },
          {
            "english": "traffic",
            "chinese": "n. 交通；运输 v. （非法）进行交易；做……买卖"
          },
          {
            "english": "technology",
            "chinese": "n. 科技；工艺"
          },
          {
            "english": "video",
            "chinese": "n. 视频；录像系统 v. 录视频；给……录像"
          },
          {
            "english": "transport",
            "chinese": "n. 交通运输系统；旅行方式 v. 运输；运送"
          },
          {
            "english": "system",
            "chinese": "n. 系统"
          },
          {
            "english": "efficient",
            "chinese": "adj. 效率高的；有成效的"
          },
          {
            "english": "education",
            "chinese": "n. 教育"
          },
          {
            "english": "length",
            "chinese": "n. 时长；长度"
          },
          {
            "english": "topic",
            "chinese": "n. 话题；题目；标题"
          },
          {
            "english": "partner",
            "chinese": "n. 搭档；同伴"
          },
          {
            "english": "shall",
            "chinese": "modal v. 将要；将会 (should)"
          },
          {
            "english": "pass",
            "chinese": "v. 及格；通过 n. 及格；通行证"
          },
          {
            "english": "winner",
            "chinese": "n. 优胜者；成功者"
          },
          {
            "english": "cure",
            "chinese": "n. 药物；疗法 v. 治愈；治好"
          },
          {
            "english": "cancer",
            "chinese": "n. 癌症"
          },
          {
            "english": "concert",
            "chinese": "n. 音乐会；演奏会"
          },
          {
            "english": "cash",
            "chinese": "n. 现金；金钱 v. 兑现"
          },
          {
            "english": "wallet",
            "chinese": "n. 钱包；皮夹"
          },
          {
            "english": "guest",
            "chinese": "n. 客人；宾客"
          },
          {
            "english": "chief",
            "chinese": "adj. 首席的；最重要的 n. 首领；酋长"
          },
          {
            "english": "researcher",
            "chinese": "n. 研究者；探索者"
          },
          {
            "english": "research",
            "chinese": "n. & v. 研究；调查"
          },
          {
            "english": "futurist",
            "chinese": "n. 未来学家"
          },
          {
            "english": "everywhere adv.,",
            "chinese": "pron. & conj. 到处；所有地方"
          },
          {
            "english": "robotics",
            "chinese": "n. 机器人学"
          },
          {
            "english": "industry",
            "chinese": "n. 行业；工业"
          },
          {
            "english": "service",
            "chinese": "n. 服务；公共服务"
          },
          {
            "english": "disaster",
            "chinese": "n. 灾难；不幸"
          },
          {
            "english": "emergency",
            "chinese": "n. 突发事件；紧急情况"
          },
          {
            "english": "disappear",
            "chinese": "v. 消失；不见"
          },
          {
            "english": "challenging",
            "chinese": "adj. 挑战性的"
          },
          {
            "english": "pilot",
            "chinese": "n. 飞行员；领航员"
          },
          {
            "english": "expert",
            "chinese": "n. 专家；行家 adj. 熟练的；内行的"
          },
          {
            "english": "replace",
            "chinese": "v. 代替；取代"
          },
          {
            "english": "creativity",
            "chinese": "n. 创造力"
          },
          {
            "english": "emotional",
            "chinese": "adj. 情感的；情绪的"
          },
          {
            "english": "intelligence",
            "chinese": "n. 智力；智慧"
          },
          {
            "english": "emotional intelligence",
            "chinese": "情绪智力（情商）"
          },
          {
            "english": "mention",
            "chinese": "v. 提到；写到"
          },
          {
            "english": "refrigerator",
            "chinese": "n. 冰箱 (= fridge)"
          },
          {
            "english": "low",
            "chinese": "adv. 向……底部；低 adj. 低的；矮的 n. 低水平；低谷"
          },
          {
            "english": "run low (on sth)",
            "chinese": "即将用尽；快用完"
          },
          {
            "english": "accept",
            "chinese": "v. 接受；相信"
          },
          {
            "english": "influence",
            "chinese": "v. 影响；对……起作用 n. 影响；作用"
          },
          {
            "english": "creative",
            "chinese": "adj. 创造性的；创作的"
          },
          {
            "english": "impossible",
            "chinese": "adj. 不可能的"
          },
          {
            "english": "quality",
            "chinese": "n. 素质；质量；品质 adj. 优质的；高质量的"
          },
          {
            "english": "develop",
            "chinese": "v. 增强；发展；开发"
          },
          {
            "english": "German",
            "chinese": "n. 德语；德国人 adj. 德国的"
          },
          {
            "english": "valuable",
            "chinese": "adj. 很有用的；宝贵的"
          },
          {
            "english": "public",
            "chinese": "adj. 公共的；公众的"
          },
          {
            "english": "medical",
            "chinese": "adj. 医学的；医疗的"
          },
          {
            "english": "challenge",
            "chinese": "n. 挑战；质疑 v. 向（某人）挑战；对……怀疑"
          },
          {
            "english": "task",
            "chinese": "n. 任务；工作"
          },
          {
            "english": "depend",
            "chinese": "v. 取决于；依靠"
          },
          {
            "english": "depend on / upon",
            "chinese": "取决于；依靠"
          },
          {
            "english": "come over",
            "chinese": "来访；拜访"
          },
          {
            "english": "as long as",
            "chinese": "只要"
          },
          {
            "english": "Jennifer",
            "chinese": "珍妮弗"
          },
          {
            "english": "Harry",
            "chinese": "哈里；哈丽"
          },
          {
            "english": "Asimov",
            "chinese": "阿西莫夫"
          },
          {
            "english": "France",
            "chinese": "法国"
          },
          {
            "english": "Mandy",
            "chinese": "曼迪"
          }
        ],
        "rhythmicChant": "景色很 prediction，夜晚去 outer，让我们在这 outer space 里放松。"
      },
      {
        "id": "pep_8a_u8",
        "title": "Unit 8",
        "chineseTitle": "高效日常沟通",
        "words": [
          {
            "english": "communication",
            "chinese": "n. 表达；交流"
          },
          {
            "english": "face to face",
            "chinese": "面对面"
          },
          {
            "english": "text message （",
            "chinese": "手机）短信息；短信"
          },
          {
            "english": "sign",
            "chinese": "n. 手势；迹象；标志 v. 签（名）；签字"
          },
          {
            "english": "speaker",
            "chinese": "n. 说话者；发言者"
          },
          {
            "english": "rehearsal",
            "chinese": "n. 排演；排练"
          },
          {
            "english": "show sb around",
            "chinese": "领某人参观"
          },
          {
            "english": "local",
            "chinese": "adj. 当地的；地方的 n. 当地人；本地人"
          },
          {
            "english": "face-to-face",
            "chinese": "adj. 面对面的"
          },
          {
            "english": "professor",
            "chinese": "n. 教授"
          },
          {
            "english": "speech",
            "chinese": "n. 演说；发言"
          },
          {
            "english": "argue",
            "chinese": "v. 争论；争吵"
          },
          {
            "english": "make up (with sb)",
            "chinese": "与……言归于好"
          },
          {
            "english": "in person",
            "chinese": "亲自；亲身"
          },
          {
            "english": "prefer",
            "chinese": "v. 较喜欢"
          },
          {
            "english": "calm",
            "chinese": "adj. 镇静的；沉着的 v. 使平静；使镇静"
          },
          {
            "english": "worry about",
            "chinese": "为……担心"
          },
          {
            "english": "expression",
            "chinese": "n. 表达方式；表达"
          },
          {
            "english": "chance",
            "chinese": "n. 机会；可能性 adj. 意外的；偶然的"
          },
          {
            "english": "meeting",
            "chinese": "n. 会面；会议"
          },
          {
            "english": "difficulty",
            "chinese": "n. 困难；难题"
          },
          {
            "english": "right away",
            "chinese": "立即；马上"
          },
          {
            "english": "line",
            "chinese": "n. 字行；便条；线"
          },
          {
            "english": "drop sb a line",
            "chinese": "给……写信"
          },
          {
            "english": "detail",
            "chinese": "n. 细节；详情"
          },
          {
            "english": "reunion",
            "chinese": "n. 团聚；重逢；聚会"
          },
          {
            "english": "seriously",
            "chinese": "adv. 严肃地；认真地"
          },
          {
            "english": "training",
            "chinese": "n. 训练；培训"
          },
          {
            "english": "nervous",
            "chinese": "adj. 担忧的；焦虑的；胆怯的"
          },
          {
            "english": "stranger",
            "chinese": "n. 陌生人"
          },
          {
            "english": "tip",
            "chinese": "n. 指点；实用的提示；尖端 v. （使）倾斜；倒出；给小费"
          },
          {
            "english": "carefully",
            "chinese": "adv. 认真地；仔细地；小心地"
          },
          {
            "english": "show interest in sth",
            "chinese": "对……表现出兴趣"
          },
          {
            "english": "listener",
            "chinese": "n. 听者"
          },
          {
            "english": "point",
            "chinese": "n. 观点；重点 v. 指向；瞄准"
          },
          {
            "english": "surely",
            "chinese": "adv. 想必；必定"
          },
          {
            "english": "continue",
            "chinese": "v. 持续；继续做"
          },
          {
            "english": "impolite",
            "chinese": "adj. 不礼貌的；粗鲁的"
          },
          {
            "english": "personal",
            "chinese": "adj. 个人的；私人的"
          },
          {
            "english": "argue with sb",
            "chinese": "与某人争论"
          },
          {
            "english": "move on (to sth)",
            "chinese": "换话题；开始做（别的事）"
          },
          {
            "english": "sincere",
            "chinese": "adj. 真诚的；诚实的"
          },
          {
            "english": "find out",
            "chinese": "查明；弄清（情况）"
          },
          {
            "english": "pay",
            "chinese": "v. (paid) 付费；交纳；偿还 n. 工资；薪水"
          },
          {
            "english": "attention",
            "chinese": "n. 注意；专心；关注"
          },
          {
            "english": "pay attention (to ...)",
            "chinese": "注意；关注"
          },
          {
            "english": "be yourself",
            "chinese": "行为自然；不做作"
          },
          {
            "english": "offer",
            "chinese": "v. 提供；主动提出 n. 主动建议；出价"
          },
          {
            "english": "reasonable",
            "chinese": "adj. 公平的；合理的"
          },
          {
            "english": "social",
            "chinese": "adj. 社会的；社交的 n. 联谊会；联欢会"
          },
          {
            "english": "medium",
            "chinese": "n. (pl. media) 媒介；手段 adj. 中等的；适中的"
          },
          {
            "english": "social media",
            "chinese": "社交媒体"
          },
          {
            "english": "trust",
            "chinese": "n. & v. 信任；相信"
          },
          {
            "english": "keep (...) away from ... （",
            "chinese": "使）远离；避免……靠近"
          },
          {
            "english": "misunderstanding",
            "chinese": "n. 误解；误会"
          },
          {
            "english": "event",
            "chinese": "n. 公开活动；重要事情"
          },
          {
            "english": "take place",
            "chinese": "发生；进行"
          },
          {
            "english": "cost",
            "chinese": "n. 费用；价钱；代价 v. 价格为；使损失；使付出努力"
          },
          {
            "english": "opportunity",
            "chinese": "n. 机会；时机"
          },
          {
            "english": "benefit",
            "chinese": "v. 对……有用；使受益 n. 益处；成效"
          },
          {
            "english": "benefit ... from ...",
            "chinese": "从……获益"
          },
          {
            "english": "reply",
            "chinese": "n. & v. 回答；回复"
          },
          {
            "english": "honour",
            "chinese": "n. (= honor) 荣誉；尊敬 v. 给……荣誉；表彰"
          },
          {
            "english": "sincerely",
            "chinese": "adv. 真诚地；诚实地"
          },
          {
            "english": "opening",
            "chinese": "adj. 开篇的；开始的 n. 开始；孔；洞"
          },
          {
            "english": "closing",
            "chinese": "adj. 结尾的；结束的 n. 停业；关闭"
          },
          {
            "english": "sentence",
            "chinese": "n. 句子；判决 v. 判决；宣判"
          },
          {
            "english": "date",
            "chinese": "n. 日期；日子；约会 v. 确定年代；注明日期"
          },
          {
            "english": "clause",
            "chinese": "n. 从句；分句"
          },
          {
            "english": "Susan",
            "chinese": "苏珊"
          },
          {
            "english": "Jones",
            "chinese": "琼斯"
          }
        ],
        "rhythmicChant": "景色很 communication，夜晚去 face to face，让我们在这 text message （ 里放松。"
      }
    ]
  },
  {
    "id": "pep_8b",
    "title": "八年级下册 (Grade 8 Vol 2)",
    "units": [
      {
        "id": "pep_8b_u1",
        "title": "Unit 1 Art & Leisure",
        "chineseTitle": "书法艺术与滑雪胜地",
        "words": [
          {
            "english": "calligraphy",
            "chinese": "n. 书法"
          },
          {
            "english": "ski",
            "chinese": "v. 滑雪"
          },
          {
            "english": "program",
            "chinese": "v. 编写程序 n. 程序；(= programme) 节目；项目"
          },
          {
            "english": "express",
            "chinese": "v. 表达；表示"
          },
          {
            "english": "ice skating",
            "chinese": "滑冰；溜冰"
          },
          {
            "english": "instructor",
            "chinese": "n. 教练；指导者"
          },
          {
            "english": "give up",
            "chinese": "放弃"
          },
          {
            "english": "scared",
            "chinese": "adj. 害怕的；对……感到惊慌的"
          },
          {
            "english": "scared of",
            "chinese": "害怕；恐惧"
          },
          {
            "english": "fear",
            "chinese": "n. & v. 害怕；担忧"
          },
          {
            "english": "get over",
            "chinese": "克服（困难）；解决（问题）"
          },
          {
            "english": "up to",
            "chinese": "正在做；由某人决定"
          },
          {
            "english": "poem",
            "chinese": "n. 诗"
          },
          {
            "english": "single",
            "chinese": "adj. 单个的；单身的"
          },
          {
            "english": "stroke",
            "chinese": "n. 笔画；击球"
          },
          {
            "english": "ink",
            "chinese": "n. 墨水"
          },
          {
            "english": "return",
            "chinese": "n. & v. 回来；归还"
          },
          {
            "english": "in return",
            "chinese": "作为回报"
          },
          {
            "english": "deal",
            "chinese": "n. 交易；协议 v. (dealt, dealt) 对付"
          },
          {
            "english": "manage",
            "chinese": "v. 完成（困难的事）；管理"
          },
          {
            "english": "ice-skate",
            "chinese": "v. 滑冰；溜冰"
          },
          {
            "english": "get into",
            "chinese": "开始做某事；进入"
          },
          {
            "english": "give it a go",
            "chinese": "试一试某事"
          },
          {
            "english": "kung fu",
            "chinese": "n. 功夫"
          },
          {
            "english": "push",
            "chinese": "v. 鞭策；推 n. 推"
          },
          {
            "english": "once in a while",
            "chinese": "偶尔；间或"
          },
          {
            "english": "chat",
            "chinese": "v. & n. 闲聊"
          },
          {
            "english": "outing",
            "chinese": "n. 出外游玩；远足"
          },
          {
            "english": "go on an outing",
            "chinese": "出外游玩"
          },
          {
            "english": "reduce",
            "chinese": "v. 减少"
          },
          {
            "english": "stress",
            "chinese": "n. 精神压力；紧张"
          },
          {
            "english": "yoga",
            "chinese": "n. 瑜伽"
          },
          {
            "english": "object",
            "chinese": "n. 物品；宾语"
          },
          {
            "english": "Italian",
            "chinese": "adj. 意大利的；意大利人的；意大利语的 n. 意大利人；意大利语"
          },
          {
            "english": "programmer",
            "chinese": "n. 程序设计员"
          },
          {
            "english": "allow",
            "chinese": "v. 使……成为可能；允许"
          },
          {
            "english": "achievement",
            "chinese": "n. 成就"
          },
          {
            "english": "coin",
            "chinese": "n. 硬币"
          },
          {
            "english": "stamp",
            "chinese": "n. 邮票"
          },
          {
            "english": "teenage",
            "chinese": "adj. 青少年的"
          },
          {
            "english": "postcard",
            "chinese": "n. 明信片"
          },
          {
            "english": "rather",
            "chinese": "adv. 相当；更准确地说"
          },
          {
            "english": "old-fashioned",
            "chinese": "adj. 过时的；守旧的"
          },
          {
            "english": "foreign",
            "chinese": "adj. 外国的；国外的"
          },
          {
            "english": "dream of",
            "chinese": "梦想；希望"
          },
          {
            "english": "suggestion",
            "chinese": "n. 建议；提议"
          },
          {
            "english": "failure",
            "chinese": "n. 失败"
          },
          {
            "english": "inspiration",
            "chinese": "n. 鼓舞人心或启发灵感的人（或事物）；灵感"
          },
          {
            "english": "strict",
            "chinese": "adj. 严厉的；严格的"
          },
          {
            "english": "surprisingly",
            "chinese": "adv. 出人意料地；惊人地"
          },
          {
            "english": "so far",
            "chinese": "到目前为止"
          },
          {
            "english": "stage",
            "chinese": "n. 舞台；阶段"
          },
          {
            "english": "importantly",
            "chinese": "adv. 重要地"
          },
          {
            "english": "Luca",
            "chinese": "卢卡"
          },
          {
            "english": "Bruno",
            "chinese": "布鲁诺"
          },
          {
            "english": "India",
            "chinese": "印度"
          },
          {
            "english": "Maya",
            "chinese": "马娅"
          },
          {
            "english": "Badal",
            "chinese": "巴达尔"
          },
          {
            "english": "Mogao Caves",
            "chinese": "莫高窟"
          }
        ],
        "rhythmicChant": "手写 calligraphy，滑道上 ski，学会 program 掌控生活。"
      }
    ]
  }

]
      }
    ]
  },
  {
    id: 'senior',
    name: '高中 (Senior High)',
    versions: [
      {
        id: 'pep_senior',
        name: '人教版 (新课标)',
        books: []
      }
    ]
  }
];
