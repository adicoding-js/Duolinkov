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
];