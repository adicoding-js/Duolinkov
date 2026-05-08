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

function renderLeaderboard() {
    var el = document.getElementById("leaderboard");
    el.innerHTML = "";
    var list = [];
    var ii = 0;
    while (ii < COMRADES.length) {
        list.push({ name: COMRADES[ii].name, xp: COMRADES[ii].xp, flag: COMRADES[ii].flag, you: false });
        ii++;
    }
    list.push({ name: "You", xp: STATE.xp, flag: "👤", you: true });
    list.sort(function(a, b) { return b.xp - a.xp; });
    var rank = 1;
    var jj = 0;
    while (jj < list.length) {
        var entry = list[jj];
        var li = document.createElement("li");
        li.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:2px solid #111;font-family:'Oswald',sans-serif;font-size:15px;font-weight:700;";
        if (entry.you) {
            li.style.backgroundColor = "#cc0000";
            li.style.color = "#ffd700";
        } else {
            li.style.backgroundColor = "#ede8d8";
            li.style.color = "#111";
        }
        var rankSpan = document.createElement("span");
        rankSpan.style.cssText = "background:#111;color:#ffd700;font-family:'Russo One',sans-serif;font-size:13px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;margin-right:10px;flex-shrink:0;";
        rankSpan.innerText = rank;
        var nameSpan = document.createElement("span");
        nameSpan.style.cssText = "flex:1;margin-left:8px;";
        nameSpan.innerText = entry.flag + " " + entry.name;
        var xpSpan = document.createElement("span");
        xpSpan.innerText = entry.xp + " XP";
        li.appendChild(rankSpan);
        li.appendChild(nameSpan);
        li.appendChild(xpSpan);
        el.appendChild(li);
        rank++;
        jj++;
    }
    var footnote = document.createElement("p");
    footnote.style.cssText = "font-size:11px;color:#888;font-style:italic;padding:8px 14px;font-family:'Oswald',sans-serif;";
    footnote.innerText = "* Joseph S. has held first place since 1924. Do not ask questions.";
    el.parentNode.appendChild(footnote);
}

function renderShop() {
    var grid = document.getElementById("shop-grid");
    grid.innerHTML = "";
    var i = 0;
    while (i < SHOP_ITEMS.length) {
        var item = SHOP_ITEMS[i];
        var actualCost = item.cost;
        if (item.id == "heart_refill") {
            actualCost = STATE.heartRefillCost;
        }
    var card = document.createElement("div");
    card.style.cssText = "background:#ede8d8;border:3px solid #111;padding:16px;box-shadow:4px 4px 0px #000;display:flex;flex-direction:column;gap:8px;";
    var iconDiv = document.createElement("div");
    iconDiv.style.cssText = "font-size:36px;text-align:center;";
    iconDiv.innerText = item.icon;
    var nameDiv = document.createElement("div");
    nameDiv.style.cssText = "font-family:'Russo One',sans-serif;font-size:14px;color:#111;text-transform:uppercase;";
    nameDiv.innerText = item.name;
    var descDiv = document.createElement("div");
    descDiv.style.cssText = "font-family:'Oswald',sans-serif;font-size:12px;color:#444;font-style:italic;flex:1;";
     descDiv.innerText = item.desc;
    var btn = document.createElement("button");
    btn.style.cssText = "width:100%;padding:10px;background:#cc0000;color:#ffd700;border:2px solid #111;font-family:'Russo One',sans-serif;font-size:13px;cursor:pointer;box-shadow:2px 2px 0px #000;";
    btn.innerText = actualCost + " XP";
        if (STATE.xp < actualCost) {
            btn.disabled = true;
            btn.style.background = "#555";
            btn.style.color = "#888";
            btn.style.cursor = "not-allowed";
            btn.style.boxShadow = "none";
        }
            btn.setAttribute("data-item-id", item.id);
            btn.setAttribute("data-cost", actualCost);
            btn.onclick = function(e) {
            var itemId = e.currentTarget.getAttribute("data-item-id");
            var cost = parseInt(e.currentTarget.getAttribute("data-cost"));
            buyItem(itemId, cost);
        };
            card.appendChild(iconDiv);
            card.appendChild(nameDiv);
            card.appendChild(descDiv);
            card.appendChild(btn);
            grid.appendChild(card);
        i++;
    }
}
/* function kgbPopup(title, msg, btn) {
    return new Promise(function(resolve) {
        var overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:200;display:flex;align-items:center;justify-content:center;";
        var box = document.createElement("div");
        box.style.cssText = "background:#111;border:3px solid #cc0000;max-width:460px;width:90%;padding:32px;box-shadow:8px 8px 0px #000;text-align:center;";
        var owlImg = document.createElement("img");
        owlImg.src = "assets/owl.png";
        owlImg.style.cssText = "width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 16px auto;";
        var titleEl = document.createElement("h2");
        titleEl.style.cssText = "font-family:'Russo One',sans-serif;color:#ffd700;font-size:20px;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;";
        titleEl.innerText = title;
        var msgEl = document.createElement("p");
        msgEl.style.cssText = "font-family:'Oswald',sans-serif;font-size:14px;color:#f5f0e8;line-height:1.6;margin-bottom:22px;";
        msgEl.innerText = msg;
        var btnEl = document.createElement("button");
        btnEl.style.cssText = "background:#cc0000;color:#ffd700;border:3px solid #111;padding:12px 32px;font-family:'Russo One',sans-serif;font-size:15px;letter-spacing:2px;cursor:pointer;box-shadow:4px 4px 0px #000;text-transform:uppercase;";
        btnEl.innerText = btn || "UNDERSTOOD";
        btnEl.onclick = function() {
            document.body.removeChild(overlay);
            resolve();
        };
        box.appendChild(owlImg);
        box.appendChild(titleEl);
        box.appendChild(msgEl);
        box.appendChild(btnEl);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
}*/
function buyItem(itemId, cost) {
    if (STATE.xp < cost) {
        alert("INSUFFICIENT FUNDS. The state does not do credit.");
        return;
    }
    STATE.xp = STATE.xp - cost;
    if (itemId == "heart_refill") {
        STATE.hearts = 5;
        STATE.heartRefillCost = Math.round(STATE.heartRefillCost * 1.4);
        alert("❤️ Hearts restored. The state charges more next time.");
    } else if (itemId == "streak_freeze") {
        alert("🧊 Streak frozen. The KGB looks away. Tonight only.");
    } else if (itemId == "double_xp") {
        STATE.doubleXP = true;
        alert("⭐ Double XP active for your next lesson. Do not waste it.");
    } else if (itemId == "snitch") {
        STATE.xp = STATE.xp + 200;
        alert("🤫 Reported. +200 XP. Someone else is having a bad day.");
    } else if (itemId == "certificate") {
        alert("📜 Certificate issued. It means nothing. Congratulations.");
    } else if (itemId == "bribe") {
        alert("💰 The owl has been paid. He will not speak of this.");
    } else if (itemId == "alibi") {
        alert("📋 Alibi confirmed. You were never here.");
    } else if (itemId == "name_change") {
        alert("🪪 Name changed. The state has no record of the old you.");
    }
    saveState();
    updateStats();
    renderShop();
    renderLeaderboard();
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
function renderType(q, body, checkBtn) {
    var word = STATE.currentLesson.wordBank[q.wordIndex];
    var prompt = q.direction === "en_to_ru" ? "Translate to Russian" : "Translate to English";
    var text = q.direction === "en_to_ru" ? word.english : word.russian;
    var correct = q.direction === "en_to_ru" ? word.russian : word.english;
    body.innerHTML = '<h2 class="question-prompt">' + prompt + '</h2><div class="question-text">' + text + '</div><input type="text" id="type-input" class="type-input" placeholder="Type your answer..." autocomplete="off"/><p style="font-size:12px;color:#888;margin-top:8px;">hint: ' + correct.length + ' characters</p>';
    var input = document.getElementById("type-input");
    input.oninput = function() {
        STATE.selectedOption = input.value.trim();
        if(input.value.trim().length > 0) {
            checkBtn.disabled = false;
        } else {
            checkBtn.disabled = true;
        }
    };
    input.onkeydown = function(e) {
        if(e.key === "Enter" && !checkBtn.disabled) {
            checkBtn.click();
        }
    };
    setTimeout(function() { input.focus(); }, 100);

var keyboard = document.createElement("div");
    keyboard.id = "virtual-keyboard";
    keyboard.style.cssText = "margin-top:20px;display:flex;flex-direction:column;gap:6px;";
    var rows = [
        ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
        ["ф","ы","в","а","п","р","о","л","д","ж","э"],
        ["я","ч","с","м","и","т","ь","б","ю","⌫"]
    ];
    var qwertyMap = { "q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ","p":"з","[":"х","]":"ъ",
        "a":"ф","s":"ы","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж","'":"э",
        "z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",",":"б",".":"ю"
    }
    var ii = 0;
    while(ii < rows.length) {
        var rowDiv = document.createElement("div");
        rowDiv.style.cssText = "display:flex;flex-direction:row;gap:5px;justify-content:center;flex-wrap:wrap;";
        var jj = 0;
        while(jj < rows[ii].length) {
            var key = document.createElement("button");
            var letter = rows[ii][jj];
            key.innerText = letter;
            key.style.cssText = "min-width:38px;height:44px;padding:0 6px;font-family:'Oswald',sans-serif;font-size:16px;font-weight:700;background-color:#ede8d8;border:2px solid #111;cursor:pointer;color:#111;box-shadow:2px 2px 0px #000;";
            key.setAttribute("data-letter", letter);
            key.onclick = function(e) {
                e.preventDefault();
                var inp = document.getElementById("type-input");
                if(!inp) return;
                var l = e.currentTarget.getAttribute("data-letter");
                if(l === "⌫") {
                    inp.value = inp.value.slice(0, -1);
                } else {
                    inp.value = inp.value + l;
                }
                inp.oninput();
            };
            rowDiv.appendChild(key);
            jj++;
        }
        keyboard.appendChild(rowDiv);
        ii++;
    }

    body.appendChild(keyboard);
    document.onkeydown = function(e) {
        if(e.key === "Backspace") return;
        var inp = document.getElementById("type-input");
        if(!inp || document.activeElement === inp) return;
        var mapped = qwertyMap[e.key.toLowerCase()];
        if(mapped) {
            inp.value = inp.value + mapped;
            inp.oninput();
        }
    };

    document.getElementById("continue-btn").style.display = "none";
    checkBtn.onclick = function() {
        input.disabled = true;
        checkBtn.disabled = true;
        var userAnswer = STATE.selectedOption.toLowerCase().trim();
        var correctAnswer = correct.toLowerCase().trim();
        if(userAnswer === correctAnswer) {
            STATE.correctCount++;
            input.style.borderColor = "#1a6b1a";
            input.style.backgroundColor = "#1a6b1a";
            input.style.color = "#fff";
            document.getElementById("feedback-title").innerText = "CORRECT!";
            document.getElementById("feedback-text").innerText = "";
        } else {
            STATE.hearts--;
            updateStats();
            input.style.borderColor = "#ff2222";
            input.style.backgroundColor = "#ff2222";
            input.style.color = "#fff";
            document.getElementById("feedback-title").innerText = "WRONG.";
            document.getElementById("feedback-text").innerText = "correct answer: " + correct;
        }
        document.getElementById("continue-btn").style.display = "inline-block";
        document.getElementById("continue-btn").onclick = function() {
            if(STATE.hearts <= 0) {
                showScreen("gameover-screen");
                return;
            }
            STATE.currentQ++;
            if(STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
                endLsn();
            } else {
                renderQuestion();
            }
        };
    };
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
    document.onkeydown = null;
    if(qData.type === "translate") {
        renderTranslate(qData, body, checkBtn);
    } else if(qData.type === "match") {
        STATE.matchedPairs = [];
        STATE.matchSelections = { left: null, right: null };
        renderMatch(qData, body, checkBtn);
    } else if(qData.type === "type") {
        renderType(qData, body, checkBtn);
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
           return;    }
        STATE.currentQ++;
        if(STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
            endLsn();
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
            endLsn();
        } else {
            renderQuestion();
        }
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
}
function endLsn() {
    var now = new Date().getTime();
    var t = Math.round((now - STATE.startTime) / 1000);  
    var totalQ = STATE.currentLesson.questionTemplates.length;
    var a = Math.round((STATE.correctCount / totalQ) * 100);  
    var x = 10;
 if (a === 100) {
        x = x + 5;
    }
 if (STATE.doubleXP) {
        x = x * 2;
    }  
    STATE.xp = STATE.xp + x;  
  if (!STATE.completedLessons.includes(STATE.currentLesson.id)) {
        STATE.completedLessons.push(STATE.currentLesson.id);
    }
    document.getElementById("final-xp").innerText = x;
    document.getElementById("final-accuracy").innerText = a + "%";
    document.getElementById("final-time").innerText = t + "s"; 
    saveState();
    updateStats();
    showScreen("complete-screen");
}
function retHome() {
    showScreen("home-screen");
    renderTree();
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
    renderLeaderboard();
    renderShop();
}
setTimeout(function() {
    var allTabs = document.querySelectorAll(".tab");
    var t = 0;
    while (t < allTabs.length) {
        allTabs[t].onclick = function(e) {
            var allT = document.querySelectorAll(".tab");
            var allP = document.querySelectorAll(".tab-panel");
            var i = 0;
            while (i < allT.length) {
                allT[i].classList.remove("active");
                allP[i].classList.remove("active");
                i++;
            }
            e.currentTarget.classList.add("active");
            var panelId = e.currentTarget.getAttribute("data-tab");
            document.getElementById(panelId).classList.add("active");
        };
        t++;
    }
}, 0);

document.getElementById("retry-btn").onclick = function() {
    STATE.hearts = 5;
    saveState();
    initHome();
    showScreen("home-screen");
    };

loadState();
updateStats();
showScreen('home-screen');
initHome();

var alreadyWelcomed = localStorage.getItem('duolingkov_welcomed');
if (alreadyWelcomed == null) {
    var welcomeOverlay = document.getElementById("welcome-overlay");
    var welcomeBtn = document.getElementById("welcome-btn");
    welcomeOverlay.style.display = "flex";
    localStorage.setItem('duolingkov_welcomed', '1');
    welcomeBtn.onclick = function() {
        var overlayEl = document.getElementById("welcome-overlay");
        overlayEl.style.display = "none";
    };
}