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

var COMRADES = [
    { name: "Joseph S.", xp: 9999999, flag: "🇷🇺" },
    { name: "Ivan the Snitch", xp: 4820, flag: "🇷🇺" },
    { name: "[REDACTED]", xp: 3711, flag: "❓" },
    { name: "Vladimir Definitely-Not-Spy", xp: 3200, flag: "🇷🇺" },
    { name: "Natasha K.", xp: 2950, flag: "🇷🇺" },
    { name: "Dmitri from Accounting", xp: 2100, flag: "🇷🇺" },
    { name: "Comrade #4471", xp: 1800, flag: "🇷🇺" },
    { name: "Olga (Loyal Since Birth)", xp: 1600, flag: "🇷🇺" },
    { name: "Boris (Under Investigation)", xp: 900, flag: "🔍" },
    { name: "Anonymou Traitor", xp: 420, flag: "💀" },
    { name: "Your Cat Probably", xp: 69, flag: "🐱" }
];

var SHOP_ITEMS = [
    { id: "heart_refill", icon: "❤️", name: "Heart Refill", desc: "The state has granted you mercy. For now.", cost: 100 },
    { id: "streak_freeze", icon: "🧊", name: "Streak Freeze", desc: "KGB looks the other way tonight.", cost: 150 },
    { id: "double_xp", icon: "⭐", name: "Double XP", desc: "Work twice as hard. Next lesson only.", cost: 200 },
    { id: "snitch", icon: "🤫", name: "Report a Comrade", desc: "+200 XP. Someone else gets the blame.", cost: 50 },
    { id: "certificate", icon: "📜", name: "Certificate of Loyalty", desc: "Meaningless. Looks nice on the wall.", cost: 300 },
    { id: "bribe", icon: "💰", name: "Bribe the Owl", desc: "The owl has been paid. He will not remember this.", cost: 500 },
    { id: "alibi", icon: "📋", name: "Official Alibi", desc: "You were not here. This never happened.", cost: 250 },
    { id: "name_change", icon: "🪪", name: "Name Change", desc: "Become someone the state hasn't noticed yet.", cost: 400 }
];

var OWL_GREETINGS = [
    "The state is watching your progress.",
    "You have been assigned to learn Russian. Refusal is not an option.",
    "Today's lesson is mandatory. As is tomorrow's.",
    "Your enthusiasm has been noted and will be verified.",
    "Failure to complete today's lesson will be reported.",
    "The owl sees all. Especially your mistakes.",
    "Welcome back, comrade. We missed you. Not really.",
    "Your streak is being monitored at all times.",
    "Please proceed with the lesson. Please.",
    "The quota must be met. It will be met."
];

var PRAVDA_HEADLINES = [
    "DUOLINGO OWL DEFECTS TO MOTHERLAND, REFUSES TO GO BACK",
    "LOCAL COMRADE COMPLETES 3 LESSONS, STATE DECLARES VICTORY",
    "EXPERTS CONFIRM: RUSSIAN HARDER THAN EXPECTED",
    "NEW FIVE YEAR PLAN INCLUDES MANDATORY VOCABULARY QUOTAS",
    "OWL SPOTTED OUTSIDE SUSPECT'S WINDOW FOR 4TH CONSECUTIVE NIGHT",
    "BREAD RATIONS REDUCED AGAIN, BUT AT LEAST YOU KNOW HOW TO SAY BREAD",
    "COMRADE COMPLETES LESSON 1, CELEBRATES WITH REMAINING POTATO",
    "YOUR PROGRESS HAS BEEN FORWARDED TO THE APPROPRIATE DEPARTMENT",
    "TODAY'S FORECAST: COLD, WITH A CHANCE OF VOCABULARY",
    "SPELLING ERROR IN LESSON 3 BLAMED ON WESTERN SABOTEURS",
    "LEARNING APP RATED 5 STARS BY ALL REVIEWERS (REVIEWERS NOT AVAILABLE FOR COMMENT)",
    "YOUR FILE HAS BEEN UPDATED. YOU DO NOT NEED TO KNOW WHAT IT SAYS."
];

var FAIL_MSGS = [
    "Your efforts were noted. And found lacking.",
    "The gulag sends its regards.",
    "Perhaps next time you will try harder. Perhaps.",
    "This failure has been added to your permanent file.",
    "The owl is disappointed but not surprised.",
    "You have brought shame upon your study streak.",
    "The state suggests you try again. Strongly suggests."
];

var CORRECT_RESPONSES = [
    "CORRECT!",
    "DA! ДА!",
    "THE STATE APPROVES",
    "ACCEPTABLE.",
    "CONFIRMED, COMRADE",
    "YES. GOOD. CONTINUE.",
    "EXACTLY RIGHT",
    "THE OWL IS PLEASED"
];

var WRONG_RESPONSES = [
    "WRONG.",
    "NYET. HET.",
    "INCORRECT, COMRADE",
    "THE STATE IS DISAPPOINTED",
    "THIS HAS BEEN RECORDED",
    "NO. ABSOLUTELY NO.",
    "THE OWL SHAKES HIS HEAD",
    "YOUR PRONUNCIATION IS AWFUL",
    "TRY AGAIN OR FACE CONSEQUENCES"
];
var LOADING_MSGS = [
    "PROCESSING YOUR ASSIGNMENT...",
    "CONSULTING THE PARTY ARCHIVES...",
    "VERIFYING YOUR LOYALTY SCORE...",
    "PREPARING YOUR RATIONS...",
    "INFORMING THE APPROPRIATE DEPARTMENTS...",
    "REVIEWING YOUR PERMANENT FILE...",
    "SUMMONING THE OWL...",
    "CHECKING FOR WESTERN INFLUENCE...",
    "CALCULATING YOUR DEBT TO THE STATE...",
    "TRANSLATING YOUR EXCUSES...",
    "CONFIRMING YOU HAVE NOT DEFECTED...",
    "LOADING MANDATORY CURRICULUM..."
];
var WRONG_WORDS = [];
