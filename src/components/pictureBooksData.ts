export interface BookPage {
  pageNumber: number;
  english: string;
  chinese: string;
  image: string;
  emoji?: string;
}

export interface PictureBook {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  difficulty: 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED';
  pages: BookPage[];
}

export interface WordDetail {
  word: string;
  pron: string;
  typeBadge: string;
  pos: string;
}

export const PICTURE_BOOKS: PictureBook[] = [
  {
    id: 'book_1',
    title: '1. Mad, Sad and Glad Dad 👨‍🌾',
    coverImage: '/src/assets/images/dad_glad_1780575633904.png',
    description: '一起来看生气的爸爸、难过的爸爸和开心的爸爸！拼读 -ad 字母组合单词。',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'mad dad',
        chinese: '生气的爸爸',
        image: '/src/assets/images/dad_mad_1780575595863.png',
        emoji: '😠'
      },
      {
        pageNumber: 2,
        english: 'sad dad',
        chinese: '难过的爸爸',
        image: '/src/assets/images/dad_sad_1780575614289.png',
        emoji: '😢'
      },
      {
        pageNumber: 3,
        english: 'glad dad',
        chinese: '开心的爸爸',
        image: '/src/assets/images/dad_glad_1780575633904.png',
        emoji: '😄'
      }
    ]
  },
  {
    id: 'book_2',
    title: '2. Cat, Rat and Bat 🐱',
    coverImage: '/src/assets/images/picbook_cat_1780562998321.png',
    description: '一起来拼读猫咪、怪老鼠和胖蝙蝠的故事。学 -at 系列核心魔法词！',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'A cat.',
        chinese: '一只猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱'
      },
      {
        pageNumber: 2,
        english: 'A fat cat.',
        chinese: '一只胖猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈'
      },
      {
        pageNumber: 3,
        english: 'A rat.',
        chinese: '一只老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭'
      },
      {
        pageNumber: 4,
        english: 'A fat rat.',
        chinese: '一只胖老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐀'
      },
      {
        pageNumber: 5,
        english: 'A bat.',
        chinese: '一只蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      },
      {
        pageNumber: 6,
        english: 'A fat bat.',
        chinese: '一只胖蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      }
    ]
  },
  {
    id: 'book_3',
    title: '3. This is a Cat 🐈',
    coverImage: '/src/assets/images/picbook_fat_cat_1780563015884.png',
    description: '拼读三字经句型：“This is a ...” 胖猫、坏鼠、伤心小蝙蝠。',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'This is a cat.',
        chinese: '这是一只猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱'
      },
      {
        pageNumber: 2,
        english: 'This is a fat cat.',
        chinese: '这是一只胖猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈'
      },
      {
        pageNumber: 3,
        english: 'This is a rat.',
        chinese: '这是一只老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭'
      },
      {
        pageNumber: 4,
        english: 'This is a bad rat.',
        chinese: '这是一只坏老鼠。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👿'
      },
      {
        pageNumber: 5,
        english: 'This is a bat.',
        chinese: '这是一只蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      },
      {
        pageNumber: 6,
        english: 'This is a sad bat.',
        chinese: '这是一只悲伤的蝙蝠。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢'
      }
    ]
  },
  {
    id: 'book_4',
    title: '4. That is My Cat 🎒',
    coverImage: '/src/assets/images/picbook_bat_1780563068637.png',
    description: '运用“That is ...”和“my ...”句型，那是谁的猫和球拍帽子呢？',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'That is a cat.',
        chinese: '那是一只猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱'
      },
      {
        pageNumber: 2,
        english: 'That is my cat.',
        chinese: '那是我的猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈'
      },
      {
        pageNumber: 3,
        english: 'That is a bat.',
        chinese: '那是球拍。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🏏'
      },
      {
        pageNumber: 4,
        english: 'That is my bat.',
        chinese: '那是我的球拍。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🏏'
      },
      {
        pageNumber: 5,
        english: 'That is a hat.',
        chinese: '那是一顶帽子。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎩'
      },
      {
        pageNumber: 6,
        english: 'That is my hat.',
        chinese: '那是我的帽子。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎩'
      }
    ]
  },
  {
    id: 'book_5',
    title: '5. His Mat and Her Hat 💻',
    coverImage: 'https://img.icons8.com/clouds/200/bedsheets.png',
    description: '巧妙学会 his 和 her 代词，区分他的和她的神奇物品！',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'This is a mat.',
        chinese: '这是一张垫子。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🩹'
      },
      {
        pageNumber: 2,
        english: 'This is his mat.',
        chinese: '这是他的垫子。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🩹'
      },
      {
        pageNumber: 3,
        english: 'This is a hat.',
        chinese: '这是一顶帽子。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👒'
      },
      {
        pageNumber: 4,
        english: 'This is her hat.',
        chinese: '这是她的帽子。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👒'
      },
      {
        pageNumber: 5,
        english: 'That is a pad.',
        chinese: '那是一块平板。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '📱'
      },
      {
        pageNumber: 6,
        english: 'That is his pad.',
        chinese: '那是他的平板。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '📱'
      },
      {
        pageNumber: 7,
        english: 'That is a cat.',
        chinese: '那是一只猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱'
      },
      {
        pageNumber: 8,
        english: 'That is her cat.',
        chinese: '那是她的猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈'
      }
    ]
  },
  {
    id: 'book_6',
    title: '6. This is Not a Cat 🎩',
    coverImage: 'https://img.icons8.com/clouds/200/not-applicable.png',
    description: '学习否定句 is not! 这不是猫，而是一只在偷吃的小老鼠！',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'This is not a cat. It is a rat.',
        chinese: '这不是一只猫。它是一只老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭'
      },
      {
        pageNumber: 2,
        english: 'That is not a rat. It is a bat.',
        chinese: '那不是一只老鼠。它是一只蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      },
      {
        pageNumber: 3,
        english: 'This is not a hat. It is a mat.',
        chinese: '这不是一顶帽子。它是一块垫子。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🩹'
      },
      {
        pageNumber: 4,
        english: 'That is not a mat. It is a pad.',
        chinese: '那不是一块垫子。它是一个平板。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '📱'
      }
    ]
  },
  {
    id: 'book_7',
    title: '7. This is Not My Bag 🎒',
    coverImage: 'https://img.icons8.com/clouds/200/backpack.png',
    description: '否定所有格特训：学说“This is not my ... It is her/his ...”',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'This is not my bag. It is her bag.',
        chinese: '这不是我的包。它是她的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒'
      },
      {
        pageNumber: 2,
        english: 'This is not my mat. It is his mat.',
        chinese: '这不是我的垫子。它是他的垫子。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🩹'
      },
      {
        pageNumber: 3,
        english: 'That is not my flag. It is her flag.',
        chinese: '那不是我的旗子。它是她的旗子。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚩'
      },
      {
        pageNumber: 4,
        english: 'That is not my mat. It is his mat.',
        chinese: '那不是我的垫子。它是他的垫子。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🩹'
      }
    ]
  },
  {
    id: 'book_8',
    title: '8. Is This Your Bag? 🙋‍♂️',
    coverImage: 'https://img.icons8.com/clouds/200/question-mark.png',
    description: '超级小侦探出动！学习一般疑问句和极简答语 Yes/No 答辩。',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'Is this your bag? Yes, it is.',
        chinese: '这是你的包吗？是的。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒'
      },
      {
        pageNumber: 2,
        english: "Is this your map? No, it isn't.",
        chinese: '这是你的地图吗？不是。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️'
      },
      {
        pageNumber: 3,
        english: 'Is this your flag? Yes, it is.',
        chinese: '这是你的旗子吗？是的。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚩'
      },
      {
        pageNumber: 4,
        english: "Is this your hat? No, it isn't.",
        chinese: '这是你的帽子吗？不是。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👒'
      }
    ]
  },
  {
    id: 'book_9',
    title: '9. These are Cats 🐾',
    coverImage: 'https://img.icons8.com/clouds/200/cat.png',
    description: '学复数近指 These are! 许多许多的胖猫、坏老鼠与淘气蝙蝠。',
    difficulty: 'PRIMARY',
    pages: [
      {
        pageNumber: 1,
        english: 'These are cats.',
        chinese: '这些是猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱🐱'
      },
      {
        pageNumber: 2,
        english: 'These are fat cats.',
        chinese: '这些是胖猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈🐈'
      },
      {
        pageNumber: 3,
        english: 'These are rats.',
        chinese: '这些是老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭🐭'
      },
      {
        pageNumber: 4,
        english: 'These are bad rats.',
        chinese: '这些是坏老鼠。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👿👿'
      },
      {
        pageNumber: 5,
        english: 'These are bats.',
        chinese: '这些是蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇🦇'
      },
      {
        pageNumber: 6,
        english: 'These are sad bats.',
        chinese: '这些是伤心的蝙蝠。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢😢'
      }
    ]
  },
  {
    id: 'book_10',
    title: '10. Those are Cats 🐈‍⬛',
    coverImage: 'https://img.icons8.com/clouds/200/forest.png',
    description: '学复数远指 Those are! 瞧，远处的松木边有一群小胖猫！',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'Those are cats.',
        chinese: '那些是猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱🐱'
      },
      {
        pageNumber: 2,
        english: 'Those are fat cats.',
        chinese: '那些是胖猫。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈🐈'
      },
      {
        pageNumber: 3,
        english: 'Those are rats.',
        chinese: '那些是老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭🐭'
      },
      {
        pageNumber: 4,
        english: 'Those are bad rats.',
        chinese: '那些是坏老鼠。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👿👿'
      },
      {
        pageNumber: 5,
        english: 'Those are bats.',
        chinese: '那些是蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇🦇'
      },
      {
        pageNumber: 6,
        english: 'Those are sad bats.',
        chinese: '那些是伤心的蝙蝠。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢😢'
      }
    ]
  },
  {
    id: 'book_11',
    title: '11. Our Bags & Their Maps 🗺️',
    coverImage: 'https://img.icons8.com/clouds/200/suitcase.png',
    description: '学习复数形式的物主代词 our / their：我们的包，和他们的帽子！',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'These are our bags.',
        chinese: '这些是我们的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒🎒'
      },
      {
        pageNumber: 2,
        english: 'These are our maps.',
        chinese: 'these are our maps. 这些是我们的地图。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🗺️'
      },
      {
        pageNumber: 3,
        english: 'These are our hats.',
        chinese: '这些是我们的帽子。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '👒👒'
      },
      {
        pageNumber: 4,
        english: 'Those are their bags.',
        chinese: '那些是他们的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '💼💼'
      },
      {
        pageNumber: 5,
        english: 'Those are their maps.',
        chinese: '那些是他们的地图。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🗺️'
      },
      {
        pageNumber: 6,
        english: 'Those are their hats.',
        chinese: '那些是他们的帽子。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🎩🎩'
      }
    ]
  },
  {
    id: 'book_12',
    title: '12. This is Not Our Map 🧭',
    coverImage: 'https://img.icons8.com/clouds/200/treasure-map.png',
    description: '对比复数的否定与肯定，区分 who owns what 的高级结构。',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'These are not our bags. These are their bags.',
        chinese: '这些不是我们的包。这些是他们的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒💼'
      },
      {
        pageNumber: 2,
        english: 'These are not our maps. These are their maps.',
        chinese: '这些不是我们的地图。这些是他们的地图。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🗺️'
      },
      {
        pageNumber: 3,
        english: 'Those are not our hats. Those are their hats.',
        chinese: '那些不是我们的帽子。那些是他们的帽子。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '👒🎩'
      },
      {
        pageNumber: 4,
        english: 'Those are not our maps. Those are their maps.',
        chinese: '那些不是我们的地图。那些是他们的地图。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🗺️'
      }
    ]
  },
  {
    id: 'book_13',
    title: '13. Are These Your Bags? 🏪',
    coverImage: 'https://img.icons8.com/clouds/200/shop.png',
    description: '掌握复数一般疑问句：Are these/those your ...? 及双向句式回答。',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'Are these your bags? Yes. They are our bags.',
        chinese: '这些是你们的包吗？是的，是我们的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒🎒'
      },
      {
        pageNumber: 2,
        english: "Are these your hats? No. They aren't. They are their hats.",
        chinese: '这些是你们的帽子吗？不是，是他们的帽子。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '👒🎩'
      },
      {
        pageNumber: 3,
        english: 'Are those your bags? Yes. They are our bags.',
        chinese: '那些是你们的包吗？是的，是我们的包。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '💼💼'
      },
      {
        pageNumber: 4,
        english: "Are those your hats? No. They aren't. They are their hats.",
        chinese: '那些是你们的帽子吗？不是，是他们的帽子。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🎩🎩'
      }
    ]
  },
  {
    id: 'book_14',
    title: '14. We are Fat and Sad 🥺',
    coverImage: 'https://img.icons8.com/clouds/200/crying.png',
    description: '系统学习第一、三及复数人称 be 动词：are 和 is 的组合情绪句！',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'I am fat. I am sad.',
        chinese: '我胖胖的，我很难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '🥺'
      },
      {
        pageNumber: 2,
        english: 'She is fat. She is sad.',
        chinese: '她胖胖的，她很难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '👧'
      },
      {
        pageNumber: 3,
        english: 'He is fat. He is sad.',
        chinese: '他胖胖的,他很难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '👦'
      },
      {
        pageNumber: 4,
        english: 'We are fat. We are sad.',
        chinese: '我们胖胖的，我们很难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '👨‍👩‍👧'
      },
      {
        pageNumber: 5,
        english: 'They are fat. They are sad.',
        chinese: '他们胖胖的，他们很难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '👥'
      }
    ]
  },
  {
    id: 'book_15',
    title: '15. We are Glad, Not Sad! ✨',
    coverImage: 'https://img.icons8.com/clouds/200/happy.png',
    description: '反义情绪对比：我不难过！我很开心！am/is/are not 否定核心句法。',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'I am not sad. I am glad.',
        chinese: '我不难过。我很开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '😊'
      },
      {
        pageNumber: 2,
        english: 'She is not sad. She is glad.',
        chinese: '她不难过。她很开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '👧✨'
      },
      {
        pageNumber: 3,
        english: 'He is not sad. He is glad.',
        chinese: '他不难过。他很开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '👦✨'
      },
      {
        pageNumber: 4,
        english: 'We are not sad. We are glad.',
        chinese: '我们不难过。我们很开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🧑‍🤝‍🧑'
      },
      {
        pageNumber: 5,
        english: 'They are not sad. They are glad.',
        chinese: '他们不难过。他们很开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🙌'
      }
    ]
  },
  {
    id: 'book_16',
    title: '16. Is He Fat or Mad? 🔎',
    coverImage: 'https://img.icons8.com/clouds/200/search.png',
    description: '大侦探探案实录：学会提问 Is he / Is she / Are they? 并进行双重回答。',
    difficulty: 'INTERMEDIATE',
    pages: [
      {
        pageNumber: 1,
        english: 'Is he fat? Yes, he is. / No, he isn’t.',
        chinese: '他胖吗？是的，他胖。/不，他不胖。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '👦'
      },
      {
        pageNumber: 2,
        english: 'Is he mad? Yes, he is. / No, he isn’t.',
        chinese: '他生气吗？是的，他生气。/不，他不生气。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '😠'
      },
      {
        pageNumber: 3,
        english: 'Is she fat? Yes, she is. / No, she isn’t.',
        chinese: '她胖吗？是的，她胖。/不，她不胖。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '👧'
      },
      {
        pageNumber: 4,
        english: 'Is he sad? Yes, he is. / No, he isn’t.',
        chinese: '他难过吗？是的，他难过。/不，他不难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢'
      },
      {
        pageNumber: 5,
        english: 'Are they fat? Yes, they are. / No, they aren’t.',
        chinese: '他们胖吗？是的，他们胖。/不，他们不胖。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '👥'
      }
    ]
  },
  {
    id: 'book_17',
    title: '17. The Cat and Cats 🐈',
    coverImage: '/src/assets/images/picbook_cat_1780562998321.png',
    description: '单数 rules 与复数 rules 的神奇变身：The cat is ... versus The cats are ...',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'The cat is fat. The cats are fat.',
        chinese: '这只猫很胖。这些猫很胖。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🐈'
      },
      {
        pageNumber: 2,
        english: 'The rat is fat. The rats are fat.',
        chinese: '这只老鼠很胖。这些老鼠很胖。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐀'
      },
      {
        pageNumber: 3,
        english: 'The bat is fat. The bats are fat.',
        chinese: '这只蝙蝠很胖。这些蝙蝠很胖。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      }
    ]
  },
  {
    id: 'book_18',
    title: '18. Are You Glad? Mood Quiz 😄',
    coverImage: 'https://img.icons8.com/clouds/200/mental-state.png',
    description: '探索超级情绪卡片，做最酷的心灵情感中英文小测验。',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'Are you sad ? Yes, I am. / No, I am not.',
        chinese: '你们难过吗？是的，我们难过。/不，我们不难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢'
      },
      {
        pageNumber: 2,
        english: 'Are you glad? Yes, I am. / No, I am not.',
        chinese: '你们开心吗？是的，我们开心。/不，我们不开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '😄'
      },
      {
        pageNumber: 3,
        english: 'Are they sad ? Yes, they are. / No, they are not.',
        chinese: '他们难过吗？是的，他们难过。/不，他们不难过。',
        image: '/src/assets/images/picbook_sad_bat_1780563086634.png',
        emoji: '😢👥'
      },
      {
        pageNumber: 4,
        english: 'Are they glad? Yes, they are. / No, they are not.',
        chinese: '他们开心吗？是的，他们开心。/不，他们不开心。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '😄👥'
      }
    ]
  },
  {
    id: 'book_19',
    title: '19. What is it? It’s a Cat 📦',
    coverImage: 'https://img.icons8.com/clouds/200/shipping-box.png',
    description: '神奇树洞大探险！猜猜看这个影子是什么？It is a ...',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'What is it? It’s a cat.',
        chinese: '它是什么？它是一只猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱'
      },
      {
        pageNumber: 2,
        english: 'What is it? It’s a rat.',
        chinese: '它是什么？它是一只老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭'
      },
      {
        pageNumber: 3,
        english: 'What is it? It’s a bat.',
        chinese: '它是什么？它是一只蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇'
      }
    ]
  },
  {
    id: 'book_20',
    title: '20. Caps, Maps, Vans & Fans 🎁',
    coverImage: 'https://img.icons8.com/clouds/200/toy-car.png',
    description: '学说复数提问：What are they/these/those? 汽车、帽子电风扇！',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'What are they? They are cats.',
        chinese: '它们是什么？它们是猫。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱🐱'
      },
      {
        pageNumber: 2,
        english: 'What are they? They are rats.',
        chinese: '它们是什么？它们是老鼠。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭🐭'
      },
      {
        pageNumber: 3,
        english: 'What are they? They are bats.',
        chinese: '它们是什么？它们是蝙蝠。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🦇🦇'
      },
      {
        pageNumber: 4,
        english: 'What are these? They are caps.',
        chinese: '这些是什么？它们是帽子。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🧢🧢'
      },
      {
        pageNumber: 5,
        english: 'What are these? They are maps.',
        chinese: '这些是什么？它们是地图。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🗺️'
      },
      {
        pageNumber: 6,
        english: 'What are those? They are vans .',
        chinese: '那些是什么？它们是货车。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🚐🚐'
      },
      {
        pageNumber: 7,
        english: 'What are those? They are fans .',
        chinese: '那些是什么？它们是风扇。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🌬️🌬️'
      }
    ]
  },
  {
    id: 'book_21',
    title: '21. On, In, Under 方位冒险 📍',
    coverImage: 'https://img.icons8.com/clouds/200/pin.png',
    description: '跟着在包里的小坏鼠，在垫子上的帽子，学习最基础的方位介词表达！',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'The hat is on the mat.',
        chinese: '帽子在垫子上面。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👒🩹'
      },
      {
        pageNumber: 2,
        english: 'The mat is on the bat.',
        chinese: '垫子在球拍上面。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🩹🏏'
      },
      {
        pageNumber: 3,
        english: 'The rat is in the bag.',
        chinese: '老鼠在包里。',
        image: '/src/assets/images/picbook_rat_1780563032822.png',
        emoji: '🐭🎒'
      },
      {
        pageNumber: 4,
        english: 'The bag is in the gap.',
        chinese: '包在缝隙里。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎒🕳️'
      },
      {
        pageNumber: 5,
        english: 'The bat is under the map.',
        chinese: '球拍在地图下面。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🏏🗺️'
      },
      {
        pageNumber: 6,
        english: 'The map is under the fan.',
        chinese: '地图在风扇下面。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🗺️🌬️'
      }
    ]
  },
  {
    id: 'book_22',
    title: '22. I Have a Cat 🌟',
    coverImage: 'https://img.icons8.com/clouds/200/sparkling-diamond.png',
    description: '掌握 are/is 之后，学会用“have / has”表达神奇宝贝的主权。',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'I have a cat. I have a mat.',
        chinese: '我有一只猫。我有一张垫子。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🐱🩹'
      },
      {
        pageNumber: 2,
        english: 'You have a hat. You have a map.',
        chinese: '你有一顶帽子。你有一张地图。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '👒🗺️'
      },
      {
        pageNumber: 3,
        english: 'They have a plan. They have a land.',
        chinese: '他们有一个计划。他们有一片土地。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '📝🏕️'
      },
      {
        pageNumber: 4,
        english: 'He has a bat. He has a pan.',
        chinese: '他有一个球拍。他有一口锅。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🏏🍳'
      },
      {
        pageNumber: 5,
        english: 'She has a lamp. She has a stamp.',
        chinese: '她有一盏台灯。她有一张邮票。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '💡✉️'
      }
    ]
  },
  {
    id: 'book_23',
    title: "23. I Don't Have a Cat 城堡",
    coverImage: 'https://img.icons8.com/clouds/200/cancel.png',
    description: '否定拥有大挑战！学说“don’t have”与“doesn’t have”否定结构。',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'I don’t have a cat. I don’t have a mat.',
        chinese: '我没有猫。我没有垫子。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚫🐱'
      },
      {
        pageNumber: 2,
        english: 'You don’t have a hat. You don’t have a map.',
        chinese: '你没有帽子。你没有地图。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🚫👒'
      },
      {
        pageNumber: 3,
        english: 'They don’t have a plan. They don’t have a land.',
        chinese: '他们没有计划。他们没有土地。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚫📝'
      },
      {
        pageNumber: 4,
        english: 'He doesn’t have a bat. He doesn’t have a pan.',
        chinese: '他没有球拍。他没有锅。',
        image: '/src/assets/images/picbook_bat_1780563068637.png',
        emoji: '🚫🍳'
      },
      {
        pageNumber: 5,
        english: 'She doesn’t have a lamp. She doesn’t have a stamp.',
        chinese: '她没有台灯。她没有邮票。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🚫✉️'
      }
    ]
  },
  {
    id: 'book_24',
    title: '24. I Can Rap! 🎤',
    coverImage: 'https://img.icons8.com/clouds/200/microphone.png',
    description: '才艺竞技大展示：学说我会 rap、chant、wag 还有 act！',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'I can rap.',
        chinese: '我会说唱。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🎤😎'
      },
      {
        pageNumber: 2,
        english: 'You can chant.',
        chinese: '你会吟唱。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🎵🪄'
      },
      {
        pageNumber: 3,
        english: 'She can wag.',
        chinese: '她会摇摆。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '💃'
      },
      {
        pageNumber: 4,
        english: 'We can act.',
        chinese: '我们会表演。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎭🎬'
      }
    ]
  },
  {
    id: 'book_25',
    title: "25. I Can't Rap 💤",
    coverImage: 'https://img.icons8.com/clouds/200/sleeping.png',
    description: '表达状态局限性，学说否定句 can’t 的轻重读拼写。',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'I can’t rap.',
        chinese: '我不会说唱。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚫🎤'
      },
      {
        pageNumber: 2,
        english: 'You can’t chant.',
        chinese: '你不会吟唱。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🚫🎵'
      },
      {
        pageNumber: 3,
        english: 'She can’t wag.',
        chinese: '她不会摇摆。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🚫💃'
      },
      {
        pageNumber: 4,
        english: 'We can’t act.',
        chinese: '我们不会表演。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🚫🎭'
      }
    ]
  },
  {
    id: 'book_26',
    title: '26. Can You Rap? 🏁',
    coverImage: 'https://img.icons8.com/clouds/200/race-flag.png',
    description: '终极拼读狂欢：你能够做到吗？“Can you ...? Yes I can / No I can’t.”',
    difficulty: 'ADVANCED',
    pages: [
      {
        pageNumber: 1,
        english: 'Can you rap？ Yes, I can. /No, I can’t.',
        chinese: '你会说唱吗？是的，我会。/不，我不会。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '🎤❓'
      },
      {
        pageNumber: 2,
        english: 'Can you chant？ Yes, I can. /No, I can’t.',
        chinese: '你会吟唱吗？是的，我会。/不，我不会。',
        image: '/src/assets/images/picbook_fat_cat_1780563015884.png',
        emoji: '🎵❓'
      },
      {
        pageNumber: 3,
        english: 'Can she wag? Yes, she can. /No, she can’t.',
        chinese: '她会摇摆吗？是的，她会。/不，她不会。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '💃❓'
      },
      {
        pageNumber: 4,
        english: 'Can he act? Yes, he can. /No, he can’t.',
        chinese: '他会表演吗？是的，他会。/不，他不会。',
        image: '/src/assets/images/picbook_bad_rat_1780563050522.png',
        emoji: '🎭❓'
      },
      {
        pageNumber: 5,
        english: 'Can we chat? Yes, we can. /No, we can’t.',
        chinese: '我们能聊天吗？是的，我们能。/不，我们不能。',
        image: '/src/assets/images/picbook_cat_1780562998321.png',
        emoji: '💬❓'
      }
    ]
  }
];

export const VOCAB_DICTIONARY: Record<string, WordDetail> = {
  'this': { word: 'this', pron: "['ðɪs]", typeBadge: '代词', pos: 'pron. 这，这个 (指近处的人或物)' },
  'is': { word: 'is', pron: "['ɪz]", typeBadge: '系动词', pos: 'v. 是 (用于第三人称单数现在时)' },
  'a': { word: 'a', pron: "[ə]", typeBadge: '冠词', pos: 'art. 一，一个 (放在单数名词前)' },
  'cat': { word: 'cat', pron: "[kæt]", typeBadge: '名词', pos: 'n. 猫，宠物猫' },
  'fat': { word: 'fat', pron: "[fæt]", typeBadge: '形容词', pos: 'adj. 胖的，肥胖的' },
  'rat': { word: 'rat', pron: "[ræt]", typeBadge: '名词', pos: 'n. 老鼠，家鼠' },
  'bad': { word: 'bad', pron: "[bæd]", typeBadge: '形容词', pos: 'adj. 坏的，恶劣的，调皮的' },
  'bat': { word: 'bat', pron: "[bæt]", typeBadge: '名词', pos: 'n. 蝙蝠 (飞行动物)；球拍' },
  'sad': { word: 'sad', pron: "[sæd]", typeBadge: '形容词', pos: 'adj. 悲伤的，不高兴的' },
  'mad': { word: 'mad', pron: "[mæd]", typeBadge: '形容词', pos: 'adj. 生气的，愤怒的' },
  'dad': { word: 'dad', pron: "[dæd]", typeBadge: '名词', pos: 'n. 爸爸 (口语)' },
  'glad': { word: 'glad', pron: "[ɡlæd]", typeBadge: '形容词', pos: 'adj. 高兴的，开心的' },
  'my': { word: 'my', pron: "[maɪ]", typeBadge: '代词', pos: 'pron. 我的 (形容词性物主代词)' },
  'that': { word: 'that', pron: "[ðæt]", typeBadge: '代词', pos: 'pron. 那个 (指远处的物)' },
  'hat': { word: 'hat', pron: "[hæt]", typeBadge: '名词', pos: 'n. 帽子 (多指有边的)' },
  'mat': { word: 'mat', pron: "[mæt]", typeBadge: '名词', pos: 'n. 垫子，席子' },
  'his': { word: 'his', pron: "[hɪz]", typeBadge: '代词', pos: 'pron. 他的 (形容词性或名词性物主代词)' },
  'her': { word: 'her', pron: "[hɜː(r)]", typeBadge: '代词', pos: 'pron. 她的' },
  'pad': { word: 'pad', pron: "[pæd]", typeBadge: '名词', pos: 'n. 平板电脑，软垫' },
  'not': { word: 'not', pron: "[nɒt]", typeBadge: '副词', pos: 'adv. 不，没有 (用于否定句)' },
  'it': { word: 'it', pron: "[ɪt]", typeBadge: '代词', pos: 'pron. 它 (代指事物/动物)' },
  'bag': { word: 'bag', pron: "[bæɡ]", typeBadge: '名词', pos: 'n. 包，口袋' },
  'flag': { word: 'flag', pron: "[flæɡ]", typeBadge: '名词', pos: 'n. 旗子，国旗' },
  'your': { word: 'your', pron: "[jɔː(r)]", typeBadge: '代词', pos: 'pron. 你的，你们的' },
  'yes': { word: 'yes', pron: "[jes]", typeBadge: '副词', pos: 'adv. 是的，好的 (表示赞同)' },
  'no': { word: 'no', pron: "[əʊ]", typeBadge: '副词', pos: 'adv. 不，没有 (表示否定)' },
  'map': { word: 'map', pron: "[mæp]", typeBadge: '名词', pos: 'n. 地图' },
  'these': { word: 'these', pron: "[ðiːz]", typeBadge: '代词', pos: 'pron. 这些 (指近处的复数人或物)' },
  'those': { word: 'those', pron: "[ðəʊz]", typeBadge: '代词', pos: 'pron. 那些 (指远处的复数人或物)' },
  'our': { word: 'our', pron: "[aʊə(r)]", typeBadge: '代词', pos: 'pron. 我们的' },
  'their': { word: 'their', pron: "[ðeə(r)]", typeBadge: '代词', pos: 'pron. 他们的' },
  'are': { word: 'are', pron: "[ɑː(r)]", typeBadge: '系动词', pos: 'v. 是 (用于复数和第二人称现在时)' },
  'they': { word: 'they', pron: "[ðeɪ]", typeBadge: '代词', pos: 'pron. 他们，它们' },
  'i': { word: 'i', pron: "[aɪ]", typeBadge: '代词', pos: 'pron. 我 (主格)' },
  'am': { word: 'am', pron: "[æm]", typeBadge: '系动词', pos: 'v. 是 (第一人称单数现在时)' },
  'she': { word: 'she', pron: "[ʃiː]", typeBadge: '代词', pos: 'pron. 她 (主格)' },
  'he': { word: 'he', pron: "[hiː]", typeBadge: '代词', pos: 'pron. 他 (主格)' },
  'we': { word: 'we', pron: "[wiː]", typeBadge: '代词', pos: 'pron. 我们 (主格)' },
  'the': { word: 'the', pron: "[ðə]", typeBadge: '冠词', pos: 'art. 定冠词 (特指人或事物)' },
  'you': { word: 'you', pron: "[juː]", typeBadge: '代词', pos: 'pron. 你，你们' },
  'what': { word: 'what', pron: "[wɒt]", typeBadge: '代词', pos: 'pron. 什么 (询问名字、事物)' },
  'caps': { word: 'caps', pron: "[kæps]", typeBadge: '名词', pos: 'n. 鸭舌帽，无边帽 (复数)' },
  'maps': { word: 'maps', pron: "[mæps]", typeBadge: '名词', pos: 'n. 地图 (复数)' },
  'vans': { word: 'vans', pron: "[vænz]", typeBadge: '名词', pos: 'n. 厢式货车，面包车 (复数)' },
  'fans': { word: 'fans', pron: "[fænz]", typeBadge: '名词', pos: 'n. 电风扇 (复数)' },
  'on': { word: 'on', pron: "[ɒn]", typeBadge: '介词', pos: 'prep. 在...上面' },
  'in': { word: 'in', pron: "[ɪn]", typeBadge: '介词', pos: 'prep. 在...里面' },
  'under': { word: 'under', pron: "['ʌndə(r)]", typeBadge: '介词', pos: 'prep. 在...下面' },
  'gap': { word: 'gap', pron: "[ɡæp]", typeBadge: '名词', pos: 'n. 缝隙，裂缝，差距' },
  'have': { word: 'have', pron: "[hæv]", typeBadge: '动词', pos: 'v. 有，拥有 (用于非第三人称单数)' },
  'has': { word: 'has', pron: "[hæz]", typeBadge: '动词', pos: 'v. 有，拥有 (用于第三人称单数)' },
  'plan': { word: 'plan', pron: "[plæn]", typeBadge: '名词', pos: 'n. 计划，方案' },
  'land': { word: 'land', pron: "[lænd]", typeBadge: '名词', pos: 'n. 土地，陆地' },
  'pan': { word: 'pan', pron: "[pæn]", typeBadge: '名词', pos: 'n. 平底锅' },
  'lamp': { word: 'lamp', pron: "[læmp]", typeBadge: '名词', pos: 'n. 台灯' },
  'stamp': { word: 'stamp', pron: "[stæmp]", typeBadge: '名词', pos: 'n. 邮票，印章' },
  'rap': { word: 'rap', pron: "[ræp]", typeBadge: '名词/动词', pos: 'n./v. 说唱' },
  'chant': { word: 'chant', pron: "[tʃɑːnt]", typeBadge: '名词/动词', pos: 'n./v. 吟唱' },
  'wag': { word: 'wag', pron: "[wæɡ]", typeBadge: '动词', pos: 'v. 摇摆，摆尾' },
  'act': { word: 'act', pron: "[动词]", typeBadge: '动词', pos: 'v. 行动，表演' },
  'can': { word: 'can', pron: "[kæn]", typeBadge: '情态动词', pos: 'v. aux. 能，会' },
  'chat': { word: 'chat', pron: "[tʃæt]", typeBadge: '动词', pos: 'v. 聊天，闲谈' }
};

import { getIllustrationForSentence as premiumGetIllustrationForSentence } from './pictureBookIllustrator';

export function getIllustrationForSentence(english: string, originalImage: string): string {
  return premiumGetIllustrationForSentence(english, originalImage);
}

export interface LecturePoint {
  num: string;
  title: string;
  desc: string;
  examples: { english: string; chinese: string }[];
}

export interface LectureSummary {
  familyBadge: string;
  grammarTitle: string;
  bannerTitle: string;
  points: LecturePoint[];
}

export function getLectureSummaryForBook(book: PictureBook): LectureSummary {
  // Determine vowel phonics family
  const wordSet = new Set<string>();
  book.pages.forEach(p => {
    p.english.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).forEach(w => {
      if (w.length > 1) wordSet.add(w);
    });
  });

  const words = Array.from(wordSet);
  const endsWithAt = words.some(w => w.endsWith('at'));
  const endsWithAn = words.some(w => w.endsWith('an'));
  const endsWithAp = words.some(w => w.endsWith('ap'));
  const endsWithAd = words.some(w => w.endsWith('ad'));
  const endsWithAg = words.some(w => w.endsWith('ag'));
  const endsWithAmp = words.some(w => w.endsWith('amp'));
  const endsWithAnd = words.some(w => w.endsWith('and'));

  let familyBadge = 'A-T Family';
  const grammarTitle = '学精讲: 核心句式要点';
  const bannerTitle = `深入剖析 《${book.title}》 的重要发阵契约 ✨`;
  const points: LecturePoint[] = [];

  if (endsWithAt) familyBadge = 'A-T 韵律词族';
  else if (endsWithAp) familyBadge = 'A-P 韵律词族';
  else if (endsWithAn) familyBadge = 'A-N 韵律词族';
  else if (endsWithAd) familyBadge = 'A-D 韵律词族';
  else if (endsWithAg) familyBadge = 'A-G 韵律词族';
  else if (endsWithAmp) familyBadge = 'A-M-P 韵律词族';
  else if (endsWithAnd) familyBadge = 'A-N-D 韵律词族';

  // Build Point 1: Sentence Pattern (Look for "This is", "That is", "I have", "He has" etc.)
  let patternTitle = '常见句法：介绍单数事物的经典句型';
  let patternDesc = '当你想向好朋友介绍一个身边的事物或亲人时，说：“This is a/an + 名词” 或者远处指着说：“That is a/an + 名词”哦。';
  let patternExamples = [
    { english: 'This is a cat.', chinese: '这是一只猫。' },
    { english: 'That is my hat.', chinese: '那是我的帽子。' }
  ];

  const hasThat = book.pages.some(p => p.english.toLowerCase().includes('that is'));
  const hasThis = book.pages.some(p => p.english.toLowerCase().includes('this is'));
  const hasHave = book.pages.some(p => p.english.toLowerCase().includes('have') || p.english.toLowerCase().includes('has'));
  const hasCan = book.pages.some(p => p.english.toLowerCase().includes('can'));

  if (hasThat) {
    patternTitle = '空间指示：That is ... 句式契约';
    patternDesc = '“That is...” (那是...) 常用来指出距离自己稍微有一些距离的人或事物，如果是自己的宝贝，可以加上 my (我的) 哟。';
    patternExamples = book.pages.filter(p => p.english.toLowerCase().includes('that is')).slice(0, 2).map(p => ({ english: p.english, chinese: p.chinese }));
  } else if (hasThis) {
    patternTitle = '焦点句式：This is ... 近距表达法';
    patternDesc = '“This is...” (这是一只/一个...) 是近距离介绍人或事物的核心表达。注意 a/an 的单数配合，指明具体的个体。';
    patternExamples = book.pages.filter(p => p.english.toLowerCase().includes('this is')).slice(0, 2).map(p => ({ english: p.english, chinese: p.chinese }));
  } else if (hasHave) {
    patternTitle = '拥有句法：Have & Has 力量配对';
    patternDesc = '“Have/Has” 表示“拥有，有”。当我(I)或者我们(We)时，要用 have 喔；如果是他(He)或她(She/It)，要切换成 has 呢。';
    patternExamples = book.pages.filter(p => p.english.toLowerCase().includes('have') || p.english.toLowerCase().includes('has')).slice(0, 2).map(p => ({ english: p.english, chinese: p.chinese }));
  } else if (hasCan) {
    patternTitle = '能力描述：Can (能/会) 的言灵组合';
    patternDesc = '情态动词 “can” 表示某种原生的能力（如跑、跳、唱歌等）。直接放在说话主角（主语）的后面、动作（动词）的前面即可。';
    patternExamples = book.pages.filter(p => p.english.toLowerCase().includes('can')).slice(0, 2).map(p => ({ english: p.english, chinese: p.chinese }));
  } else {
    patternExamples = book.pages.slice(0, Math.min(2, book.pages.length)).map(p => ({ english: p.english, chinese: p.chinese }));
  }

  points.push({
    num: '01',
    title: patternTitle,
    desc: patternDesc,
    examples: patternExamples
  });

  // Build Point 2: Adjectives & Modifiers
  let adjTitle = '特征词：把形容词放在名词前面吧';
  let adjDesc = '在英语表达中，用来描绘体型(fat胖)、心情(sad难过、glad开心)、品行(bad坏)等特征的「形容词」必须在它对应修饰的名词「前面」哦！';
  let adjExamples = book.pages.filter(p => {
    const l = p.english.toLowerCase();
    return l.includes('fat') || l.includes('sad') || l.includes('glad') || l.includes('bad') || l.includes('mad');
  }).slice(0, 3).map(p => ({ english: p.english, chinese: p.chinese }));

  if (adjExamples.length === 0) {
    adjTitle = '修饰词：冠词与名词的契合';
    adjDesc = '当我们描述一个新事物，通常会在名词前面配上冠词 “a / an”；要是说自己的私人物品，还可以用 “my / his / her” 标记归属哦。';
    adjExamples = book.pages.slice(0, Math.min(2, book.pages.length)).map(p => ({ english: p.english, chinese: p.chinese }));
  }

  points.push({
    num: '02',
    title: adjTitle,
    desc: adjDesc,
    examples: adjExamples
  });

  // Build Point 3: Phonics Rhymes & Pronunciation Tips
  const localRhymes = words.filter(w => {
    return w.endsWith('at') || w.endsWith('ad') || w.endsWith('ap') || w.endsWith('an') || w.endsWith('ag') || w.endsWith('amp');
  }).slice(0, 5);

  points.push({
    num: '03',
    title: `自然拼读：拼读精讲之「${familyBadge}」`,
    desc: `在这本书中，以相同辅音或元辅音结尾的音素频繁出现，如 ${localRhymes.join(', ')}。这种押韵结构在自然拼读中称为「同音词族」，经常拼说会极大增加口腔发音流利度！`,
    examples: []
  });

  return {
    familyBadge,
    grammarTitle,
    bannerTitle,
    points
  };
}
