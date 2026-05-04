var STATE = {
    hearts: 5,
    xp: 0,
    streak: 0,
    lastPlayed: null,
    completedLessons: [],
    achievements: [],
    heartRefillCost: 100,
    doubleXP: false,
    currentLesson: null,
    currentQ: 0,
    correctCount: 0,
    startTime: null,
    selectedOption: null,
    matchSelections: { left: null, right: null },
    matchedPairs: []
};
function saveState() {
    var toSave = {
        hearts: STATE.hearts,
        xp: STATE.xp,
        streak: STATE.streak,
        lastPlayed: STATE.lastPlayed,
        completedLessons: STATE.completedLessons,
        achievements: STATE.achievements,
        heartRefillCost: STATE.heartRefillCost,
        doubleXP: STATE.doubleXP
    };
        localStorage.setItem('duolingkov', JSON.stringify(toSave));
}
function loadState() {
    var saved = localStorage.getItem('duolingkov');
    if (saved == null) {
        return;
    }
      var parsed = JSON.parse(saved);
      STATE.hearts = parsed.hearts;
      STATE.xp = parsed.xp;
      STATE.streak = parsed.streak;
      STATE.lastPlayed = parsed.lastPlayed;
      STATE.completedLessons = parsed.completedLessons;
      STATE.achievements = parsed.achievements;
      STATE.heartRefillCost = parsed.heartRefillCost;
      STATE.doubleXP = parsed.doubleXP;

    if (STATE.lastPlayed != null) {
        var now = new Date().getTime();
        var last = new Date(STATE.lastPlayed).getTime();
        var diffDays = (now - last) / 86400000;
        if (diffDays > 1) {
            STATE.streak = 0;
            saveState();
        }
    }
}
function updateStats() {
    var heartsEl = document.getElementById("hearts");
    var xpEl = document.getElementById("xp");
    var streakEl = document.getElementById("streak");
    var heartsMiniEl = document.getElementById("hearts-mini");
    heartsEl.innerHTML = '<span class="stat-icon">♥️</span>'+STATE.hearts;
    xpEl.innerHTML = '<span class="stat-icon">🌟</span>' + STATE.xp;
    streakEl.innerHTML = '<span class="stat-icon">🔥</span>' + STATE.streak;
var heartsString = '';
    var i = 0;
    while (i < STATE.hearts) {
        heartsString = heartsString + '❤️';
        i = i + 1;
    }
    var j = STATE.hearts;
    while (j < 5) {
        heartsString = heartsString + '🖤';
        j = j + 1;
    }
    heartsMiniEl.textContent = heartsString;
}
function showScreen(id) {
    var allScreens = document.querySelectorAll('.screen');
    var k = 0;
    while (k < allScreens.length) {
        allScreens[k].classList.remove('active');
        k = k + 1;
    }
    document.getElementById(id).classList.add('active');
}
loadState();
updateStats();
showScreen('home-screen');