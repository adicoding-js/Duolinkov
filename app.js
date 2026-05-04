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
    if(qData.type === "translate") {
    renderTranslate(qData, body, checkBtn);
} else if(qData.type === "match") {
    STATE.matchedPairs = [];
    STATE.matchSelections = { left: null, right: null };
    renderMatch(qData, body, checkBtn);
} else {
    body.innerHTML = "<h2>TODO: " + qData.type + " type</h2>";
    }
}

function renderTranslate(q, body, checkBtn) {
    var word = STATE.currentLesson.wordBank[q.wordIndex];
    var prompt = q.direction === "en_to_ru" ? "Translate to Russian" : "Translate to English";
    var text = q.direction === "en_to_ru" ? word.english : word.russian;
    var correct = q.direction === "en_to_ru" ? word.russian : word.english;
    var wrongPool = [];
    var wb = STATE.currentLesson.wordBank;
    var ii = 0;
    while(ii < wb.length) {
        if(ii != q.wordIndex) {
            var wrongOpt = q.direction === "en_to_ru" ? wb[ii].russian : wb[ii].english;
            wrongPool.push(wrongOpt);
        }
        ii++;
    }
    wrongPool.sort(function() { return 0.5 - Math.random(); });
    var options = [correct, wrongPool[0], wrongPool[1], wrongPool[2]];
    options.sort(function() { return 0.5 - Math.random(); });
    body.innerHTML = '<h2 class="question-prompt">' + prompt + '</h2><div class="question-text">' + text + '</div><div class="options" id="options-grid"></div>';
    var grid = document.getElementById("options-grid");
    var iii = 0;
    while(iii < options.length) {
        var opt = options[iii];
        var btn = document.createElement("button");
        btn.className = "option";
        btn.innerText = opt;
        btn.onclick = function(e) {
            var allOpts = document.querySelectorAll(".option");
            var x = 0;
            while(x < allOpts.length) {
                allOpts[x].classList.remove("selected");
                x++;
            }
            e.currentTarget.classList.add("selected");
            STATE.selectedOption = e.currentTarget.innerText;
            checkBtn.disabled = false;
        };
        grid.appendChild(btn);
        iii++;
    }

    checkBtn.onclick = function() {
        var allOpts = document.querySelectorAll(".option");
        var n = 0;
        while(n < allOpts.length) {
            allOpts[n].disabled = true;
            n++;
        }
        if(STATE.selectedOption === correct) {
            STATE.correctCount++;
            var m = 0;
            while(m < allOpts.length) {
                if(allOpts[m].innerText === correct) allOpts[m].classList.add("correct");
                m++;
            }
            document.getElementById("feedback-title").innerText = "CORRECT!";
            document.getElementById("feedback-text").innerText = "";
        } else {
            STATE.hearts--;
            updateStats();
            var p = 0;
            while(p < allOpts.length) {
                if(allOpts[p].classList.contains("selected")) allOpts[p].classList.add("wrong");
                if(allOpts[p].innerText === correct) allOpts[p].classList.add("correct");
                p++;
            }
            document.getElementById("feedback-title").innerText = "WRONG.";
            document.getElementById("feedback-text").innerText = "correct answer: " + correct;
        }
        checkBtn.disabled = true;
        document.getElementById("continue-btn").style.display = "inline-block";
    };

    document.getElementById("continue-btn").style.display = "none";
    document.getElementById("continue-btn").onclick = function() {
        if(STATE.hearts <= 0) {
            showScreen("gameover-screen");
            return;
        }
        STATE.currentQ++;
        if(STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
            showScreen("complete-screen");
        } else {
            renderQuestion();
        }
    };
}

function renderMatch(q, body, checkBtn) {
    var wb = STATE.currentLesson.wordBank;
    var pairs = [];
    var i = 0;
    while(i < q.wordIndices.length) {
        pairs.push({ russian: wb[q.wordIndices[i]].russian, english: wb[q.wordIndices[i]].english });
        i++;
    }

    var rights = [];
    var j = 0;
    while(j < pairs.length) {
        rights.push(pairs[j].english);
        j++;
    }
    rights.sort(function() { return 0.5 - Math.random(); });
    body.innerHTML = '<h2 class="question-prompt">Match the pairs</h2><div class="match-grid"><div class="match-col" id="match-left"></div><div class="match-col" id="match-right"></div></div>';
    var leftCol = document.getElementById("match-left");
    var rightCol = document.getElementById("match-right");
    var k = 0;
    while(k < pairs.length) {
        var lb = document.createElement("button");
        lb.className = "match-item match-left-item";
        lb.innerText = pairs[k].russian;
        lb.setAttribute("data-russian", pairs[k].russian);
        lb.setAttribute("data-english", pairs[k].english);
        lb.onclick = function(e) {
            var allLeft = document.querySelectorAll(".match-left-item");
            var x = 0;
            while(x < allLeft.length) {
                if(!allLeft[x].classList.contains("matched")) allLeft[x].classList.remove("selected");
                x++;
            }
            e.currentTarget.classList.add("selected");
            STATE.matchSelections.left = e.currentTarget.getAttribute("data-english");
            tryMatch(checkBtn, pairs);
        };
        leftCol.appendChild(lb);
        k++;
    }
    var m = 0;
    while(m < rights.length) {
        var rb = document.createElement("button");
        rb.className = "match-item match-right-item";
        rb.innerText = rights[m];
        rb.setAttribute("data-english", rights[m]);
        rb.onclick = function(e) {
            var allRight = document.querySelectorAll(".match-right-item");
            var y = 0;
            while(y < allRight.length) {
                if(!allRight[y].classList.contains("matched")) allRight[y].classList.remove("selected");
                y++;
            }
            e.currentTarget.classList.add("selected");
            STATE.matchSelections.right = e.currentTarget.getAttribute("data-english");
            tryMatch(checkBtn, pairs);
        };
        rightCol.appendChild(rb);
        m++;
    }

    document.getElementById("continue-btn").style.display = "none";
    document.getElementById("continue-btn").onclick = function() {
        STATE.currentQ++;
        if(STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
            showScreen("complete-screen");
        } else {
            renderQuestion();
        }
    };
}

function tryMatch(checkBtn, pairs) {
    if(STATE.matchSelections.left == null || STATE.matchSelections.right == null) return;
    var isMatch = STATE.matchSelections.left === STATE.matchSelections.right;
    var allLeft = document.querySelectorAll(".match-left-item");
    var allRight = document.querySelectorAll(".match-right-item");

    if(isMatch) {
        var i = 0;
        while(i < allLeft.length) {
            if(allLeft[i].getAttribute("data-english") === STATE.matchSelections.left) {
                allLeft[i].classList.remove("selected");
                allLeft[i].classList.add("matched");
                allLeft[i].disabled = true;
            } i++;
        }
        var j = 0;
        while(j < allRight.length) {
            if(allRight[j].getAttribute("data-english") === STATE.matchSelections.right) {
                allRight[j].classList.remove("selected");
                allRight[j].classList.add("matched");
                allRight[j].disabled = true;
            }  j++;
        }
        STATE.matchedPairs.push(STATE.matchSelections.left);
        STATE.matchSelections.left = null;
        STATE.matchSelections.right = null;

        if(STATE.matchedPairs.length >= pairs.length) {
            STATE.correctCount++;
            document.getElementById("feedback-title").innerText = "ALL MATCHED!";
            document.getElementById("feedback-text").innerText = "The state is somewhat proud.";
            document.getElementById("continue-btn").style.display = "inline-block";
        }
    } else {
        var ii = 0;
        while(ii < allLeft.length) {
            if(allLeft[ii].classList.contains("selected")) allLeft[ii].classList.add("wrong");
            ii++;
        }
        var jj = 0;
        while(jj < allRight.length) {
            if(allRight[jj].classList.contains("selected")) allRight[jj].classList.add("wrong");
            jj++;
        }
        setTimeout(function() {
            var ll = document.querySelectorAll(".match-left-item");
            var rr = document.querySelectorAll(".match-right-item");
            var a = 0;
            while(a < ll.length) { ll[a].classList.remove("wrong", "selected"); a++; }
            var b = 0;
            while(b < rr.length) { rr[b].classList.remove("wrong", "selected"); b++; }
            STATE.matchSelections.left = null;
            STATE.matchSelections.right = null;
        }, 600);
        STATE.hearts--;
        updateStats();
    }
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
