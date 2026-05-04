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
function renderTree() {
  var treeEl = document.getElementById("skill-tree");
  treeEl.innerHTML = "";  
  var i = 0;
  while(i < LESSONS.length) {
    var lesson = LESSONS[i];
    var node = document.createElement("div");
    node.className = "skill-node";  
    var isCompleted = false;
    if(STATE.completedLessons.includes(lesson.id)) {
      isCompleted = true;
    }  
    var isUnlocked = false;
    if(i == 0 || isCompleted) {
      isUnlocked = true;
    } else {
      var prevLessonId = LESSONS[i - 1].id;
      if(STATE.completedLessons.includes(prevLessonId)) {
        isUnlocked = true;
      }
    }
    if(isCompleted == true) {
      node.classList.add("completed");
      node.classList.add("unlocked");
      node.innerHTML = lesson.icon + "<br>" + lesson.title + "<div class='badge'>★</div>";
    } else if(isUnlocked == true) {
      node.classList.add("unlocked");
      node.innerHTML = lesson.icon + "<br>" + lesson.title;
    } else {
      node.classList.add("locked");
      node.innerHTML = lesson.icon + "<br>???";
    } 
    node.setAttribute("data-id", lesson.id);
    node.onclick = function(e) {
      if(e.currentTarget.classList.contains("locked")) {
        alert("ACCESS DENIED BY THE STATE. finish the ones before it.");
      } else {
        startLesson(e.currentTarget.getAttribute("data-id"));
      }
    };  
    treeEl.appendChild(node);
    i++;
  }
}
function startLesson(id) {
    var lesson = LESSONS.find(function (l) { return l.id == id; });
    if (!lesson) return;
    if (STATE.hearts <= 0) {
        alert("GO TO GULAG (No hearts left).");
        return;
    }
    STATE.currentLesson = lesson;
    STATE.currentQ = 0;
    STATE.correctCount = 0;
    STATE.startTime = new Date().getTime();
    showScreen('lesson-screen');
    renderQuestion();
}

function renderQuestion() {
    var lesson = STATE.currentLesson;
    var qData = lesson.questionTemplates[STATE.currentQ];
    var body = document.getElementById("lesson-body");
    var checkBtn = document.getElementById("check-btn");
    body.innerHTML = "";
    checkBtn.disabled = true;
    STATE.selectedOption = null;
    var progress = (STATE.currentQ / lesson.questionTemplates.length) * 100;
    document.getElementById("progress-fill").style.width = progress + "%";
    if (qData.type === "translate") {
        renderTranslate(qData, body, checkBtn);
    } else {
        body.innerHTML = "<h2>TODO: " + qData.type + " type</h2>";
    }
}

function renderTranslate(q, body, checkBtn) {
    var word = STATE.currentLesson.wordBank[q.wordIndex];
    var prompt = q.direction === "en_to_ru" ? "Translate to Russian" : "Translate to English";
    var text = q.direction === "en_to_ru" ? word.english : word.russian;
    var correct = q.direction === "en_to_ru" ? word.russian : word.english;
    body.innerHTML = '<h2 class="question-prompt">' + prompt + '</h2><div class="question-text">' + text + '</div><div class="options" id="options-grid"></div>';
    var options = [correct, "bread", "comrade", "water"];
    options.sort(function () { return 0.5 - Math.random(); });

    var grid = document.getElementById("options-grid");
    options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.className = "option";
        btn.innerText = opt;
        btn.onclick = function () {
            document.querySelectorAll(".option").forEach(function (b) { b.classList.remove("selected"); });
            btn.classList.add("selected");
            STATE.selectedOption = opt;
            checkBtn.disabled = false;
        };
        grid.appendChild(btn);
    });

    checkBtn.onclick = function () {
        if (STATE.selectedOption === correct) {
            STATE.currentQ++;
            if (STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
                showScreen('complete-screen');
            } else {
                renderQuestion();
            }
        } else {
            STATE.hearts--;
            updateStats();
            if (STATE.hearts <= 0) showScreen('gameover-screen');
            else renderQuestion();
        }
    };
}

function initHome() {
    var greetingEl = document.getElementById("owl-greeting");
    if (typeof OWL_GREETINGS !== "undefined" && OWL_GREETINGS.length > 0) {
        var randomMsg = OWL_GREETINGS[Math.floor(Math.random() * OWL_GREETINGS.length)];
        greetingEl.innerText = randomMsg;
    } else {
        greetingEl.innerText = "The state is watching.";
    }

    renderTree();
}
loadState();
updateStats();
showScreen('home-screen');
initHome();
