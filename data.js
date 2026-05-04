var LESSONS = [
    {
     id: 1,
     icon: "A",
     title: "Greetings",
     subtitle: "Basic greetings and hellos",
     xpReward: 20,
     wordBank: [
         { russian: "привет", english: "hello" },
         { russian: "пока", english: "goodbye" },
         { russian: "спасибо", english: "thank you" },
         { russian: "пожалуйста", english: "please" },
         { russian: "да", english: "yes" },
         { russian: "нет", english: "no" },
         { russian: "извините", english: "excuse me" },
         { russian: "здравствуйте", english: "good day" }
        ],
  questionTemplates: [
         { type: "translate", direction: "en_to_ru", wordIndex: 0 },
         { type: "translate", direction: "ru_to_en", wordIndex: 1 },
         { type: "match", wordIndices: [0, 1, 2, 3] },
         { type: "translate", direction: "en_to_ru", wordIndex: 2 },
         { type: "type", direction: "en_to_ru", wordIndex: 4 },
         { type: "listen", wordIndex: 3 }
      ]
   },
      {
        id: 2,
        icon: "Б",
        title: "Loyalty",
        subtitle: "Comrades, family, the state",
        xpReward: 25,
        wordBank: [
            { russian: "товарищ", english: "comrade" },
            { russian: "друг", english: "friend" }, 
            { russian: "брат", english: "brother" },
            { russian: "семья", english: "family" },
            { russian: "родина", english: "motherland" },
            { russian: "народ", english: "people" },
            { russian: "вождь", english: "leader" },
            { russian: "партия", english: "party" }
        ],
        questionTemplates: [
            { type: "translate", direction: "ru_to_en", wordIndex: 0 },
            { type: "translate", direction: "en_to_ru", wordIndex: 1 },
            { type: "match", wordIndices: [0, 1, 2, 3] },
            { type: "translate", direction: "ru_to_en", wordIndex: 4 },
            { type: "type", direction: "en_to_ru", wordIndex: 2 },
            { type: "listen", wordIndex: 6 }
        ]
    }
,
    {
        id: 3,
        icon: "🥖",
        title: "Food",
        subtitle: "Bread, soup, and survival rations",
        xpReward: 30,
        wordBank: [
            { russian: "хлеб", english: "bread" },
            { russian: "картошка", english: "potato" },
            { russian: "борщ", english: "borscht" },
            { russian: "чай", english: "tea" },
            { russian: "вода", english: "water" },
            { russian: "суп", english: "soup" },
            { russian: "мясо", english: "meat" },
            { russian: "молоко", english: "milk" }
        ],
        questionTemplates: [
            { type: "translate", direction: "ru_to_en", wordIndex: 0 },
            { type: "translate", direction: "en_to_ru", wordIndex: 2 },
            { type: "match", wordIndices: [0, 1, 2, 3] },
            { type: "translate", direction: "ru_to_en", wordIndex: 4 },
            { type: "type", direction: "en_to_ru", wordIndex: 1 },
            { type: "listen", wordIndex: 3 }
        ]
    },
    {
        id: 4,
        icon: "★",
        title: "The State",
        subtitle: "Glory to the motherland etc etc",
        xpReward: 35,
        wordBank: [
            { russian: "родина", english: "motherland" },
            { russian: "работа", english: "work" },
            { russian: "завод", english: "factory" },
            { russian: "народ", english: "people" },
            { russian: "слава", english: "glory" },
            { russian: "власть", english: "power" },
            { russian: "закон", english: "law" },
            { russian: "победа", english: "victory" }
        ],
        questionTemplates: [
            { type: "translate", direction: "en_to_ru", wordIndex: 4 },
            { type: "translate", direction: "ru_to_en", wordIndex: 2 },
            { type: "match", wordIndices: [0, 1, 2, 3] },
            { type: "translate", direction: "en_to_ru", wordIndex: 0 },
            { type: "type", direction: "ru_to_en", wordIndex: 5 },
            { type: "listen", wordIndex: 7 }
        ]
    },
    {
        id: 5,
        icon: "5",
        title: "Numbers",
        subtitle: "Count your rations carefully",
        xpReward: 40,
        wordBank: [
            { russian: "один", english: "one" },
            { russian: "два", english: "two" },
            { russian: "три", english: "three" },
            { russian: "четыре", english: "four" },
            { russian: "пять", english: "five" },
            { russian: "десять", english: "ten" },
            { russian: "ноль", english: "zero" },
            { russian: "сто", english: "one hundred" }
        ],
        questionTemplates: [
            { type: "translate", direction: "ru_to_en", wordIndex: 0 },
            { type: "translate", direction: "en_to_ru", wordIndex: 4 },
            { type: "match", wordIndices: [0, 1, 2, 3] },
            { type: "translate", direction: "ru_to_en", wordIndex: 5 },
            { type: "type", direction: "en_to_ru", wordIndex: 2 },
            { type: "listen", wordIndex: 7 }
        ]
    }
];