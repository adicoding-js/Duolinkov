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
    matchedPairs: [],
    usedKgbDialogs: [],
    supabaseUser: null,
    username: "Comrade",
    weakWords: [],
    lessonCache: {}

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
        doubleXP: STATE.doubleXP,
        username: STATE.username,
        weakWords: STATE.weakWords
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
      STATE.weakWords = parsed.weakWords || [];
      STATE.username = parsed.username || "Comrade";

    if (STATE.lastPlayed != null) {
        var now = new Date().toDateString();
        var last = new Date(STATE.lastPlayed).toDateString();
        var nowMs = new Date().getTime();
        var lastMs = new Date(STATE.lastPlayed).getTime();
        var diffDays = (nowMs - lastMs) / 86400000;
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
        kgbPopup("ACCESS DENIED", "You must complete the previous lesson before the state grants you access. This is not negotiable.", "FINE");
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
    el.innerHTML = "<p style='font-family:Oswald,sans-serif;color:#888;padding:14px;'>loading comrades...</p>";
    supabase.from("leaderboard").select("*").order("xp", { ascending: false }).then(function(result) {
        if (result.error) {
            console.log("leaderboard fetch failed:", result.error.message);
            return;
        }
        el.innerHTML = "";
        var realUsers = result.data || [];
        var list = [];
        var ii = 0;
        while (ii < COMRADES.length) {
            list.push({
                name: COMRADES[ii].name,
                xp: COMRADES[ii].xp,
                flag: COMRADES[ii].flag,
                you: false
            });
            ii++;
        }
        var jj = 0;
        while (jj < realUsers.length) {
            var ru = realUsers[jj];
            var isYou = STATE.supabaseUser != null && ru.user_id === STATE.supabaseUser.id;
            list.push({
                name: ru.username || "Comrade",
                xp: ru.xp || 0,
                flag: isYou ? "👤" : "🇷🇺",
                you: isYou
            });
            jj++;
        }
        list.sort(function(a, b) {
            return b.xp - a.xp;
        });
        var rank = 1;
        var kk = 0;
        while (kk < list.length) {
            var entry = list[kk];
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
            kk++;
        }
    var oldNote = document.getElementById("leaderboard-footnote");
    if (oldNote) {
            oldNote.parentNode.removeChild(oldNote);
        }
    var footnote = document.createElement("p");
    footnote.id = "leaderboard-footnote";
    footnote.style.cssText = "font-size:11px;color:#888;font-style:italic;padding:8px 14px;font-family:'Oswald',sans-serif;";
    footnote.innerText = "* Joseph S. has held first place since 1924. Do not ask questions.";

    el.parentNode.appendChild(footnote);
    });
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
function kgbPopup(title, msg, btn) {
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
}
function bredQueueLoad() {
    return new Promise(function(resolve) {
        var overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#111;z-index:150;display:flex;align-items:center;justify-content:center;flex-direction:column;";
        
        var owlImg = document.createElement("img");
        owlImg.src = "assets/owl.png";
        owlImg.style.cssText = "width:90px;height:90px;object-fit:contain;margin-bottom:24px;";
        
        var randomMsg = LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)];
        
        var msgEl = document.createElement("p");
        msgEl.style.cssText = "font-family:'Russo One',sans-serif;font-size:16px;color:#ffd700;letter-spacing:3px;text-transform:uppercase;margin-bottom:28px;text-align:center;padding:0 20px;";
        msgEl.innerText = randomMsg;
        
        var barOuter = document.createElement("div");
        barOuter.style.cssText = "width:280px;height:20px;background:#1a0000;border:3px solid #cc0000;overflow:hidden;";
        
        var barInner = document.createElement("div");
        barInner.style.cssText = "height:100%;width:0%;background:repeating-linear-gradient(45deg,#cc0000,#cc0000 10px,#8b0000 10px,#8b0000 20px);transition:width 1.1s ease;";
        
        var subMsg = document.createElement("p");
        subMsg.style.cssText = "font-family:'Oswald',sans-serif;font-size:11px;color:#f5f0e8;opacity:0.5;margin-top:14px;letter-spacing:1px;text-align:center;";
        subMsg.innerText = "THIS IS MANDATORY. RESISTANCE IS FUTILE.";
        
        var propagandaLine = document.createElement("p");
        propagandaLine.style.cssText = "font-family:'Oswald',sans-serif;font-size:11px;color:#cc0000;opacity:0.6;margin-top:6px;letter-spacing:1px;text-align:center;";
        var lines = [
            "GLORY TO THE MOTHERLAND",
            "THE OWL IS ALWAYS WATCHING",
            "YOUR FILE HAS BEEN UPDATED",
            "DO NOT ATTEMPT TO CLOSE THIS TAB",
            "LEARNING IS NOT OPTIONAL",
            "THE STATE THANKS YOU FOR YOUR COMPLIANCE"
        ];
        propagandaLine.innerText = lines[Math.floor(Math.random() * lines.length)];
        
        barOuter.appendChild(barInner);
        overlay.appendChild(owlImg);
        overlay.appendChild(msgEl);
        overlay.appendChild(barOuter);
        overlay.appendChild(subMsg);
        overlay.appendChild(propagandaLine);
        document.body.appendChild(overlay);
        
        setTimeout(function() {
            barInner.style.width = "100%";
        }, 50);
        
        setTimeout(function() {
            document.body.removeChild(overlay);
            resolve();
        }, 1400);
    });
}
function buyItem(itemId, cost) {
    if (STATE.xp < cost) {
        kgbPopup("INSUFFICIENT FUNDS. The state does not do credit. Come back when you're less broke.", "UNDERSTOOD");
        return  }
    STATE.xp = STATE.xp - cost;
    if (itemId == "heart_refill") {
        STATE.hearts = 5;
        STATE.heartRefillCost = Math.round(STATE.heartRefillCost * 1.4);
        kgbPopup("MERCY GIVEN", "Your hearts have been restored. The price has also gone up. Capitalism is forbidden but we made an exception.", "THANK THE STATE");
    } else if (itemId == "streak_freeze") {
        kgbPopup("Streak frozen. The KGB looks away. Tonight only. Do not make this a habit. They are still watching.", "GOT IT");
    } else if (itemId == "double_xp") {
        STATE.doubleXP = true;
        kgbPopup("DOUBLE XP ACTIVATED", "Next lesson only. Do not waste it. The state is not running a charity.", "I WILL NOT WASTE IT");
    } else if (itemId == "snitch") {
        STATE.xp = STATE.xp + 200;
        kgbPopup("REPORT FILED", "+200 XP has been credited to your account. Your comrade has been notified. Actually they have not been notified. They will find out eventually.", "GLORY TO ME");
    } else if (itemId == "certificate") {
        kgbPopup("CERTIFICATE ISSUED", "This document is entirely meaningless. It has been stamped three times for authenticity. Hang it somewhere.", "THANK YOU I GUESS");
    } else if (itemId == "bribe") {
        kgbPopup("TRANSACTION COMPLETE", "The owl has been paid. He will not speak of this. Neither will you. This conversation did not happen.", "WHAT CONVERSATION");
    } else if (itemId == "alibi") {
        kgbPopup("ALIBI CONFIRMED", "You were not here. This never happened. Your name does not appear in any records. Good day.", "I WAS NEVER HERE");
    } else if (itemId == "name_change") {
        kgbPopup("IDENTITY UPDATED", "The state has no record of whoever you were before. That person is gone. You are someone new now. Probably better.", "NEW ME, WHO DIS");
    }
    saveState();
    updateStats();
    renderShop();
    renderLeaderboard();
}
function startLesson(id) {
    var lesson = null;
    var ii = 0;
    while (ii < LESSONS.length) {
        if (LESSONS[ii].id == id) {
            lesson = LESSONS[ii];
        }
      
function renderType(q, body, checkBtn) {
    var word = STATE.currentLesson.wordBank[q.wordIndex];
    var prompt = q.direction === "en_to_ru" ? "Translate to Russian" : "Translate to English";
    var text = q.direction === "en_to_ru" ? word.english : word.russian;
    var correct = q.direction === "en_to_ru" ? word.russian : word.english;
    body.innerHTML = '<h2 class="question-prompt">' + prompt + '</h2><div class="question-text">' + text + '</div><input type="text" id="type-input" class="type-input" placeholder="Type your answer..." autocomplete="off"/><p style="font-size:12px;color:#888;margin-top:8px;">hint: ' + correct.length + ' characters</p>';
    var input = document.getElementById("type-input");  ii++;
    }
    if (!lesson) return;
    if (STATE.hearts <= 0) {
        kgbPopup("NO HEARTS", "You have no hearts left. The state does not do charity.", "UNDERSTOOD");
        return;
    }
    var cacheKey = "lesson_" + id + "_" + STATE.completedLessons.length;
    bredQueueLoad().then(function() {
        showScreen('lesson-screen');
        if (STATE.lessonCache[cacheKey]) {
            console.log("using cached lesson for", lesson.title);
            var cachedLesson = STATE.lessonCache[cacheKey];
            STATE.currentLesson = cachedLesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            renderQuestion();
            return;
        }
        fetch("/api/generate-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: lesson.title,
                subtitle: lesson.subtitle,
                xp: STATE.xp,
                completedCount: STATE.completedLessons.length,
                weakWords: STATE.weakWords
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(aiData) {
            var aiLesson;
            if (aiData.error) {
                console.log("AI lesson failed, using fallback");
                aiLesson = lesson;
            } else {
                aiLesson = {
                    id: lesson.id,
                    icon: lesson.icon,
                    title: lesson.title,
                    subtitle: lesson.subtitle,
                    xpReward: lesson.xpReward,
                    wordBank: aiData.wordBank,
                    questionTemplates: aiData.questionTemplates
                };
                STATE.lessonCache[cacheKey] = aiLesson;
            }
            STATE.currentLesson = aiLesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            renderQuestion();
        })
        .catch(function(err) {
            console.log("fetch failed, using fallback:", err);
            STATE.currentLesson = lesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            renderQuestion();
        });
    });
}
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
            recAnswer(word.russian, true, "type");
            input.style.borderColor = "#1a6b1a";
            input.style.backgroundColor = "#1a6b1a";
            input.style.color = "#fff";
            document.getElementById("feedback-title").innerText = "CORRECT!";
            document.getElementById("feedback-text").innerText = "";
        } else {
            STATE.hearts--;
            updateStats();
            recAnswer(word.russian, false, "type");
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
function speakRussian(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ru-RU";
    utt.rate = 0.85;
    var voices = window.speechSynthesis.getVoices();
    var russianVoice = null;
    var i = 0;
    while (i < voices.length) {
        if (voices[i].lang === "ru-RU") {
            russianVoice = voices[i];
        }
        i++;
    }
    if (russianVoice != null) {
        utt.voice = russianVoice;
    }
    window.speechSynthesis.speak(utt);
}

function renderListen(q, body, checkBtn) {
    var word = STATE.currentLesson.wordBank[q.wordIndex];
    var correct = word.english;
    var wrongPool = [];
    var wb = STATE.currentLesson.wordBank;
    var ii = 0;
    while (ii < wb.length) {
        if (ii != q.wordIndex) {
            wrongPool.push(wb[ii].english);
        }
        ii++;
    }
    wrongPool.sort(function() { return 0.5 - Math.random(); });
    var options = [correct, wrongPool[0], wrongPool[1], wrongPool[2]];
    options.sort(function() { return 0.5 - Math.random(); });
    body.innerHTML = '<h2 class="question-prompt">WHAT DO YOU HEAR?</h2><div style="text-align:center;margin-bottom:24px;"><button id="play-audio" style="background:#cc0000;color:#ffd700;border:3px solid #111;padding:18px 36px;font-family:Russo One,sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer;box-shadow:4px 4px 0px #000;">🔊 PLAY</button></div><div class="options" id="options-grid"></div>';
    var grid = document.getElementById("options-grid");
    var iii = 0;
    while (iii < options.length) {
        var opt = options[iii];
        var btn = document.createElement("button");
        btn.className = "option";
        btn.innerText = opt;
        btn.onclick = function(e) {
            var allOpts = document.querySelectorAll(".option");
            var x = 0;
            while (x < allOpts.length) {
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
    document.getElementById("play-audio").onclick = function() {
        speakRussian(word.russian);
    };
    setTimeout(function() {
        speakRussian(word.russian);
    }, 400);
    checkBtn.onclick = function() {
        var allOpts = document.querySelectorAll(".option");
        var n = 0;
        while (n < allOpts.length) {
            allOpts[n].disabled = true;
            n++;
        }
        if (STATE.selectedOption === correct) {
            STATE.correctCount++;
            var m = 0;
            while (m < allOpts.length) {
                if (allOpts[m].innerText === correct) allOpts[m].classList.add("correct");
                m++;
            }
            recAnswer(word.russian, true, "listen");
            document.getElementById("feedback-title").innerText = "CORRECT!";
            document.getElementById("feedback-text").innerText = "";
        } else {
            STATE.hearts--;
            updateStats();
            var p = 0;
            while (p < allOpts.length) {
                if (allOpts[p].classList.contains("selected")) allOpts[p].classList.add("wrong");
                if (allOpts[p].innerText === correct) allOpts[p].classList.add("correct");
                p++;
            }
            recAnswer(word.russian, false, "listen");
            document.getElementById("feedback-title").innerText = "WRONG.";
            document.getElementById("feedback-text").innerText = "it said: " + word.russian;
        }
        checkBtn.disabled = true;
        document.getElementById("continue-btn").style.display = "inline-block";
        document.getElementById("continue-btn").onclick = function() {
            if (STATE.hearts <= 0) {
                showScreen("gameover-screen");
                return;
            }
            STATE.currentQ++;
            if (STATE.currentQ >= STATE.currentLesson.questionTemplates.length) {
                endLsn();
            } else {
                renderQuestion();
            }
        };
    };
    document.getElementById("continue-btn").style.display = "none";
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

    var kgbChance = Math.random();
    if (kgbChance < 0.18 && STATE.currentQ > 0) {
        var kgbDialogs = [
            {
                title: "THE OWL HAS COUNTED YOUR TEETH VIA WEBCAM. THERE ARE TOO MANY.",
                a: "I CAN EXPLAIN THE TEETH",
                b: "SOME ARE NOT MINE",
                aResult: function() { return "continue"; },
                bResult: function() { STATE.xp = STATE.xp + 20; updateStats(); return "xp+20|The state accepts borrowed teeth as a valid explanation. Carry on."; }
            },
            {
                title: "WE HAVE INTERCEPTED A DREAM YOU HAD LAST TUESDAY.",
                a: "IT WAS METAPHORICAL",
                b: "I DISAVOW THE DREAM",
                aResult: function() { STATE.hearts = STATE.hearts - 1; updateStats(); return "heart-1|It was not metaphorical."; },
                bResult: function() { return "continue"; }
            },
            {
                title: "YOUR FONT PREFERENCE HAS BEEN FLAGGED AS COUNTER-REVOLUTIONARY.",
                a: "I WILL USE TIMES NEW ROMAN",
                b: "FONTS ARE A PERSONAL CHOICE",
                aResult: function() { STATE.xp = STATE.xp + 10; updateStats(); return "xp+10|The state approves of Times New Roman. Grudgingly."; },
                bResult: function() { STATE.hearts = STATE.hearts - 2; updateStats(); return "heart-2|They are not."; }
            },
            {
                title: "A DOG IN SECTOR 7 DESCRIBED YOU TO AUTHORITIES.",
                a: "DOGS CANNOT TALK",
                b: "WHAT DID HE SAY",
                aResult: function() { STATE.hearts = STATE.hearts - 1; updateStats(); return "heart-1|This one does."; },
                bResult: function() {
                    var roll = Math.random();
                    if (roll < 0.5) {
                        STATE.xp = STATE.xp + 15;
                        updateStats();
                        return "xp+15|Nothing bad. You are fine. Probably.";
                    } else {
                        STATE.hearts = STATE.hearts - 1;
                        updateStats();
                        return "heart-1|Enough. That is all we will say.";
                    }
                }
            },
            {
                title: "YOU PAUSED BEFORE ANSWERING QUESTION 2. WE NOTICED.",
                a: "I WAS THINKING",
                b: "I WAS NOT PAUSING I WAS LOADING",
                aResult: function() { STATE.hearts = STATE.hearts - 1; updateStats(); return "heart-1|Thinking is permitted between 2pm and 2:04pm only."; },
                bResult: function() { STATE.xp = STATE.xp + 10; updateStats(); return "xp+10|Acceptable technical excuse. Do not reuse it."; }
            },
            {
                title: "THE CEILING IN YOUR ROOM HAS SUBMITTED A FORMAL COMPLAINT.",
                a: "ABOUT WHAT",
                b: "I WILL APOLOGIZE TO THE CEILING",
                aResult: function() { return "continue|It did not specify. That is worse."; },
                bResult: function() { STATE.xp = STATE.xp + 15; updateStats(); return "xp+15|The ceiling appreciates this. Relations are improving."; }
            },
            {
                title: "YOUR BLOOD TYPE HAS BEEN REVIEWED. IT IS NOT KGB POSITIVE.",
                a: "I DID NOT KNOW THAT WAS A TYPE",
                b: "HOW DO I FIX THIS",
                aResult: function() { STATE.hearts = STATE.hearts - 1; updateStats(); return "heart-1|It is the only type that matters."; },
                bResult: function() { STATE.xp = STATE.xp + 15; updateStats(); return "xp+15|You cannot fix it. But we respect the willingness."; }
            },
            {
                title: "WE HAVE ANALYZED YOUR SCROLL SPEED AND FOUND IT IDEOLOGICALLY INCONSISTENT.",
                a: "I SCROLL WITH CONVICTION",
                b: "WHAT DOES THAT EVEN MEAN",
                aResult: function() { STATE.xp = STATE.xp + 10; updateStats(); return "xp+10|Good. Scroll with purpose from now on."; },
                bResult: function() { STATE.hearts = STATE.hearts - 2; updateStats(); return "heart-2|Exactly."; }
            },
            {
                title: "THE SHADOW YOU CAST THIS MORNING WAS 4% LONGER THAN REGULATION.",
                a: "I WAS STANDING NEAR A SLOPE",
                b: "I WILL CROUCH IN FUTURE",
                aResult: function() { return "continue|We have measured the slope. Your excuse is 61% valid."; },
                bResult: function() { STATE.xp = STATE.xp + 20; updateStats(); return "xp+20|Good. The state thanks your shadow."; }
            },
            {
                title: "SOMEONE WITH YOUR EXACT TYPING RHYTHM EXISTS IN BELARUS. EXPLAIN.",
                a: "COINCIDENCE",
                b: "WE ARE PROBABLY THE SAME PERSON",
                aResult: function() { STATE.hearts = STATE.hearts - 1; updateStats(); return "heart-1|We do not recognize this word."; },
                bResult: function() { STATE.xp = STATE.xp + 25; updateStats(); return "xp+25|This is the correct answer for reasons we cannot disclose."; }
            }
        ];
        var usedDialogs = STATE.usedKgbDialogs || [];
        var available = [];
        var di = 0;
        while (di < kgbDialogs.length) {
            if (!usedDialogs.includes(di)) {
                available.push(di);
            }
            di++;
        }
        if (available.length === 0) {
            STATE.usedKgbDialogs = [];
            available = [0,1,2,3,4,5,6,7,8,9];
        }
        var pickedIndex = available[Math.floor(Math.random() * available.length)];
        var dialog = kgbDialogs[pickedIndex];
        if (!STATE.usedKgbDialogs) { STATE.usedKgbDialogs = []; }
        STATE.usedKgbDialogs.push(pickedIndex);
        var overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:300;display:flex;align-items:center;justify-content:center;";
        var box = document.createElement("div");
        box.style.cssText = "background:#111;border:3px solid #cc0000;max-width:480px;width:90%;padding:32px;box-shadow:8px 8px 0px #000;text-align:center;";
        var kgbLabel = document.createElement("div");
        kgbLabel.style.cssText = "font-family:'Russo One',sans-serif;font-size:11px;color:#cc0000;letter-spacing:4px;margin-bottom:16px;";
        kgbLabel.innerText = "⚠ KGB INTERRUPT ⚠";
        var owlImg = document.createElement("img");
        owlImg.src = "assets/owl.png";
        owlImg.style.cssText = "width:70px;height:70px;object-fit:contain;display:block;margin:0 auto 16px auto;";
        var titleEl = document.createElement("p");
        titleEl.style.cssText = "font-family:'Russo One',sans-serif;color:#ffd700;font-size:16px;letter-spacing:2px;margin-bottom:28px;line-height:1.5;";
        titleEl.innerText = dialog.title;
        var btnA = document.createElement("button");
        btnA.style.cssText = "width:100%;padding:14px;background:#1a0000;color:#f5f0e8;border:2px solid #cc0000;font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:1px;cursor:pointer;margin-bottom:10px;text-align:left;";
        btnA.innerText = "A)  " + dialog.a;
        var btnB = document.createElement("button");
        btnB.style.cssText = "width:100%;padding:14px;background:#1a0000;color:#f5f0e8;border:2px solid #cc0000;font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:1px;cursor:pointer;text-align:left;";
        btnB.innerText = "B)  " + dialog.b;
        var resultEl = document.createElement("p");
        resultEl.style.cssText = "font-family:'Oswald',sans-serif;font-size:13px;color:#f5f0e8;margin-top:20px;font-style:italic;opacity:0.8;min-height:20px;display:none;";
        var continueBtn = document.createElement("button");
        continueBtn.style.cssText = "margin-top:18px;padding:12px 32px;background:#cc0000;color:#ffd700;border:3px solid #111;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:2px;cursor:pointer;box-shadow:4px 4px 0px #000;display:none;";
        continueBtn.innerText = "UNDERSTOOD. PROCEED.";

        function handleChoice(resultFn, btn, otherBtn) {
            btn.style.background = "#cc0000";
            btn.style.color = "#ffd700";
            otherBtn.disabled = true;
            otherBtn.style.opacity = "0.3";
            var rawResult = resultFn();
            var parts = rawResult ? rawResult.split("|") : ["continue"];
            var outcome = parts[0];
            var flavor = parts[1] || "";
            if (flavor) {
                resultEl.innerText = flavor;
                resultEl.style.display = "block";
            }
            if (outcome === "continue") {
                resultEl.style.color = "#f5f0e8";
            } else if (outcome.indexOf("xp") !== -1) {
                resultEl.style.color = "#ffd700";
            } else if (outcome.indexOf("heart") !== -1) {
                resultEl.style.color = "#ff2222";
                if (STATE.hearts <= 0) {
                    continueBtn.innerText = "TO THE GULAG.";
                }
            }
            continueBtn.style.display = "inline-block";
            resultEl.style.display = "block";
        }

        btnA.onclick = function() {
            handleChoice(dialog.aResult, btnA, btnB);
        };
        btnB.onclick = function() {
            handleChoice(dialog.bResult, btnB, btnA);
        };
        continueBtn.onclick = function() {
            document.body.removeChild(overlay);
            if (STATE.hearts <= 0) {
                showScreen("gameover-screen");
                return;
            }
        };
        box.appendChild(kgbLabel);
        box.appendChild(owlImg);
        box.appendChild(titleEl);
        box.appendChild(btnA);
        box.appendChild(btnB);
        box.appendChild(resultEl);
        box.appendChild(continueBtn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        return;
    }
    if(qData.type === "translate") {
        renderTranslate(qData, body, checkBtn);
    } else if(qData.type === "match") {
        STATE.matchedPairs = [];
        STATE.matchSelections = { left: null, right: null };
        renderMatch(qData, body, checkBtn);
    } else if(qData.type === "type") {
        renderType(qData, body, checkBtn);
    } else if(qData.type === "listen") {
        renderListen(qData, body, checkBtn);
    } else {
        body.innerHTML = "<h2>ToDo: " + qData.type + "type</h2>";
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
            recAnswer(word.russian, true, "translate");
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
            recAnswer(word.russian, false, "translate");
           var p = 0;
            while(p < allOpts.length) {
                if(allOpts[p].classList.contains("selected")) allOpts[p].classList.add("wrong");
                if(allOpts[p].innerText === correct) allOpts[p].classList.add("correct");
                p++;
            var wrongWord = STATE.currentLesson.wordBank[q.wordIndex];
            if (wrongWord && !STATE.weakWords.includes(wrongWord.english)) {
                STATE.weakWords.push(wrongWord.english);
            }
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
        var justMatchedEng = STATE.matchSelections.left;
        var ii2 = 0;
        while (ii2 < pairs.length) {
            if (pairs[ii2].english == justMatchedEng) {
                recAnswer(pairs[ii2].russian, true, "match");
            }
            ii2++;
        }
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
        var wrongEng = STATE.matchSelections.left;
        var ii3 = 0;
        while (ii3 < pairs.length) {
            if (pairs[ii3].english == wrongEng) {
                recAnswer(pairs[ii3].russian, false, "match");
            }
            ii3++;
        }
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
    var todaystreak = new Date().toDateString();
  if (STATE.lastPlayed != todaystreak) {
        STATE.streak = STATE.streak + 1;
        STATE.lastPlayed = todaystreak;
  }
    document.getElementById("final-xp").innerText = x;
    document.getElementById("final-accuracy").innerText = a + "%";
    document.getElementById("final-time").innerText = t + "s"; 
    saveState();
    pushToLeaderboard();
    updateStats();
    showScreen("complete-screen");
}
function pushToLeaderboard() {
    if (STATE.supabaseUser == null) return;
    var rowData = {
        user_id: STATE.supabaseUser.id,
        username: STATE.username,
        xp: STATE.xp,
        streak: STATE.streak,
        updated_at: new Date().toISOString()
    };
    supabase.from("leaderboard").upsert(rowData, { onConflict: "user_id" }).then(function(result) {
        if (result.error) {
            console.log("leaderboard push failed:", result.error.message);
        } else {
            console.log("leaderboard updated");
        }
    });
}
function retHome() {
    showScreen("home-screen");
   renderTree();
}
function injectFiveYearPlan() {
    var old = document.getElementById("five-year-plan");
    if (old) {
        old.parentNode.removeChild(old);
    }
    var pcts = [127, 134, 119, 143, 158, 122, 131, 147, 136, 129];
    var pct = pcts[Math.floor(Math.random() * pcts.length)];
    var banner = document.createElement("div");
    banner.id = "five-year-plan";
    banner.style.cssText = "background:#cc0000;border:3px solid #111;border-top:none;padding:10px 16px;margin-bottom:16px;box-shadow:4px 4px 0px #000;";
    var top = document.createElement("div");
    top.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;";
    var label = document.createElement("span");
    label.style.cssText = "font-family:'Russo One',sans-serif;font-size:12px;color:#ffd700;letter-spacing:2px;";
    label.innerText = "★ FIVE YEAR PLAN ● LANGUAGE QUOTA";
    var pctLabel = document.createElement("span");
    pctLabel.style.cssText = "font-family:'Russo One',sans-serif;font-size:14px;color:#ffd700;";
    pctLabel.innerText = pct + "% OF QUOTA MET";
    top.appendChild(label);
    top.appendChild(pctLabel);
    var barOuter = document.createElement("div");
    barOuter.style.cssText = "width:100%;height:12px;background:#8b0000;border:2px solid #111;overflow:hidden;position:relative;";
    var barInner = document.createElement("div");
    barInner.style.cssText = "height:100%;width:100%;background:repeating-linear-gradient(90deg,#ffd700,#ffd700 8px,#ffaa00 8px,#ffaa00 16px);";
    var overflowIndicator = document.createElement("div");
    overflowIndicator.style.cssText = "position:absolute;right:4px;top:0;height:100%;display:flex;align-items:center;";
    var arrow = document.createElement("span");
    arrow.style.cssText = "font-size:10px;color:#111;font-family:'Russo One',sans-serif;";
    arrow.innerText = "▶▶";
    overflowIndicator.appendChild(arrow);
    barOuter.appendChild(barInner);
    barOuter.appendChild(overflowIndicator);
    var sub = document.createElement("p");
    sub.style.cssText = "font-family:'Oswald',sans-serif;font-size:11px;color:#ffd700;opacity:0.8;margin-top:6px;font-style:italic;";
    var subs = [
        "all figures independently verified by the state. do not verify.",
        "quota exceeded for the 7th consecutive year. the numbers are real.",
        "any discrepancies are the result of western sabotage.",
        "comrades who questioned these figures are no longer with us.",
        "the bar cannot go higher because that would be unnecessary."
    ];
    sub.innerText = subs[Math.floor(Math.random() * subs.length)];
    banner.appendChild(top);
    banner.appendChild(barOuter);
    banner.appendChild(sub);
    var tabs = document.querySelector(".tabs");
    tabs.parentNode.insertBefore(banner, tabs);
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
    injectFiveYearPlan();
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
document.getElementById("quit-btn").onclick = function() {
    kgbPopup("COWARD DETECTED", "You are abandoning your lesson. The state has noted this. Your Progress won't be saved. Are You Sure?", "YES I AM A COWARD").then(function() {
        showScreen("home-screen");
        renderTree();
    });
};
document.getElementById("retry-btn").onclick = function() {
    STATE.hearts = 5;
    saveState();
    initHome();
    showScreen("home-screen");
    };
function analyzeLessonPerformance() {
    var totalSeen = 0;
    var totalCorrect = 0;
    var totalWrong = 0;
    var weakWords = [];
    var strongWords = [];
    var allWords = registryGetAll();
    var i = 0;
    while (i < allWords.length) {
        var w = allWords[i];
        if (w.timesSeenTotal === 0) {
            i++;
            continue;
        }
        totalSeen = totalSeen + w.timesSeenTotal;
        totalCorrect = totalCorrect + w.timesCorrect;
        totalWrong = totalWrong + w.timesWrong;
        var acc = w.timesCorrect / w.timesSeenTotal;
        if (acc < 0.6 && w.timesSeenTotal >= 3) {
             weakWords.push({ russian: w.russian, english: w.english, acc: acc });
        }
        if (acc >= 0.9 && w.timesSeenTotal >= 5) {
            strongWords.push({ russian: w.russian, english: w.english, acc: acc });
        }
        i++;
    }
    var overallAcc = 0;
    if (totalSeen > 0) {
        overallAcc = totalCorrect / totalSeen;
    }
    weakWords.sort(function(a, b) {
        if (a.acc < b.acc) return -1;
        if (a.acc > b.acc) return 1;
        return 0;
    });
    strongWords.sort(function(a, b) {
        if (b.acc < a.acc) return -1;
        if (b.acc > a.acc) return 1;
        return 0;
    });
    var result = {};
    result.totalSeen = totalSeen;
    result.totalCorrect = totalCorrect;
    result.totalWrong = totalWrong;
    result.overallAcc = Math.round(overallAcc * 100);
    result.weakWords = weakWords;
    result.strongWords = strongWords;
    result.weakCount = weakWords.length;
    result.strongCount = strongWords.length;
    return result;
}
function evaluateDifficultyShift() {
    var perf = analyzeLessonPerformance();
    var newTier = "beginner";
    if (perf.totalSeen >= 80 && perf.overallAcc >= 80) {
        newTier = "advanced";
    } else if (perf.totalSeen >= 30 && perf.overallAcc >= 70) {
        newTier = "intermediate";
    }
    if (STATE.difficultyLevel !== newTier) {
        console.log("KGB difficulty recalibration: " + (STATE.difficultyLevel || "beginner") + " -> " + newTier);
        STATE.difficultyLevel = newTier;
    }
    return newTier;
}

function bootAuth() {
    supabase.auth.getSession().then(function(result) {
        var session = result.data.session;
        if (session != null) {
            STATE.supabaseUser = session.user;
            loadState();
            ingestAllStaticLessons();
            registryDedupe();
            updateStats();
            showScreen('home-screen');
            initHome();
        } else {
            showAuthModal();
        }
    });
}

function showAuthModal() {
    var overlay = document.getElementById("auth-overlay");
    overlay.style.display = "flex";
}
function hideAuthModal() {
    var overlay = document.getElementById("auth-overlay");
    overlay.style.display = "none";
}
document.getElementById("auth-guest-btn").onclick = function() {
    var usernameInput = document.getElementById("auth-guest-username");
    var errorEl = document.getElementById("auth-error");
    var name = usernameInput.value.trim();
    if (name.length < 2) {
        errorEl.innerText = "the state requires at least 2 characters. try harder.";
        return;
    }
    errorEl.innerText = "";
    supabase.auth.signInAnonymously().then(function(result) {
        if (result.error) {
            errorEl.innerText = "anonymous auth failed: " + result.error.message;
            return;
        }
        STATE.supabaseUser = result.data.user;
        STATE.username = name;

        saveState();
        hideAuthModal();
        loadState();
        updateStats();
        showScreen('home-screen');
        initHome();
    });
};
document.getElementById("auth-show-login-btn").onclick = function() {
    document.getElementById("auth-guest-form").style.display = "none";
    document.getElementById("auth-login-form").style.display = "block";
    document.getElementById("auth-error").innerText = "";
};
document.getElementById("auth-show-guest-btn").onclick = function() {
    document.getElementById("auth-login-form").style.display = "none";
    document.getElementById("auth-guest-form").style.display = "block";
    document.getElementById("auth-error").innerText = "";
};
document.getElementById("auth-signup-btn").onclick = function() {
    var email = document.getElementById("auth-email").value.trim();
    var password = document.getElementById("auth-password").value.trim();
    var username = document.getElementById("auth-username").value.trim();
    var errorEl = document.getElementById("auth-error");
    if (!email || !password || !username) {
        errorEl.innerText = "fill everything in. the state does not accept incomplete forms.";
        return;
    }
    errorEl.innerText = "signing you up...";
    supabase.auth.signUp({
        email: email,
        password: password
    }).then(function(result) {
        if (result.error) {
            errorEl.innerText = result.error.message;
            return;
        }
        STATE.supabaseUser = result.data.user;
        STATE.username = username;
        saveState();
        hideAuthModal();
        loadState();
        updateStats();
        showScreen('home-screen');
        initHome();
    });
};
document.getElementById("auth-login-btn").onclick = function() {
    var email = document.getElementById("auth-email").value.trim();
    var password = document.getElementById("auth-password").value.trim();
    var errorEl = document.getElementById("auth-error");
    if (!email || !password) {
        errorEl.innerText = "email and password. both. not optional.";
        return;
    }
    errorEl.innerText = "logging in...";
    supabase.auth.signInWithPassword({
        email: email,
        password: password
    }).then(function(result) {
        if (result.error) {
            errorEl.innerText = result.error.message;
            return;
        }
        STATE.supabaseUser = result.data.user;

        loadState();
        updateStats();
        showScreen('home-screen');
        initHome();
        hideAuthModal();
    });
};
function ingestAllStaticLessons() {
    var i = 0;
    while (i < LESSONS.length) {
        var lesson = LESSONS[i];
        var wi = 0;
        while (wi < lesson.wordBank.length) {
            var word = lesson.wordBank[wi];
            registryAddWord(word.russian, word.english, lesson.id);
            wi++;
        }
        i++;
    }
    console.log("ingestAllStaticLessons done, registry size: " + registrySize());
}
function ingestWordBank(wordBank, lessonId) {
    if (!wordBank || !Array.isArray(wordBank)) {
        return;
    }
    var i = 0;
    while (i < wordBank.length) {
        var word = wordBank[i];
        if (word.russian && word.english) {
            registryAddWord(word.russian, word.english, lessonId);
        }
        i++;
    }
    console.log("ingestWordBank done for lesson " + lessonId + ", registry now: " + registrySize());
}
bootAuth();

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
    };
}
function startLesson(id) {
    var lesson = null;
    var ii = 0;
    while (ii < LESSONS.length) {
        if (LESSONS[ii].id == id) {
            lesson = LESSONS[ii];
        }
        ii++;
    }
    if (!lesson) return;
    if (STATE.hearts <= 0) {
        kgbPopup("NO HEARTS", "You have no hearts left. The state does not do charity.", "UNDERSTOOD");
        return;
    }
    var cacheKey = "lesson_" + id + "_" + STATE.completedLessons.length;
    bredQueueLoad().then(function() {
        showScreen('lesson-screen');
        if (STATE.lessonCache[cacheKey]) {
            console.log("using cached lesson for", lesson.title);
            var cachedLesson = STATE.lessonCache[cacheKey];
            STATE.currentLesson = cachedLesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            renderQuestion();
            return;
        }
        fetch("/api/generate-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: lesson.title,
                subtitle: lesson.subtitle,
                xp: STATE.xp,
                completedCount: STATE.completedLessons.length,
                weakWords: STATE.weakWords, 
                difficultyTier: evaluateDifficultyShift()
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(aiData) {
            var aiLesson;
            if (aiData.error) {
                console.log("AI lesson failed, using fallback");
                aiLesson = lesson;
            } else {
                var dynamic = buildDynamicLesson(lesson.id, aiData.wordBank);
                    aiLesson = {
                        id: lesson.id,
                        icon: lesson.icon,
                        title: lesson.title,
                        subtitle: lesson.subtitle,
                        xpReward: lesson.xpReward,
                        wordBank: dynamic.wordBank,
                        questionTemplates: dynamic.questionTemplates
                    };
                STATE.lessonCache[cacheKey] = aiLesson;
                ingestWordBank(aiData.wordBank, lesson.id);
            }
            STATE.currentLesson = aiLesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            fetchTeachData(aiLesson.wordBank);
        })
        .catch(function(err) {
            console.log("fetch failed, using fallback:", err);
            STATE.currentLesson = lesson;
            STATE.currentQ = 0;
            STATE.correctCount = 0;
            STATE.startTime = new Date().getTime();
            renderQuestion();
        });
    });
}
function fetchTeachData(wordBank) {
    var dueWords = [];
    var allSrsWords = registryGetAll();
    var di = 0;
    while (di < allSrsWords.length) {
        if (isDue(allSrsWords[di]) == true) {
            dueWords.push({ russian: allSrsWords[di].russian, english: allSrsWords[di].english });
        }
        di++;
    }
    if (dueWords.length > 5) {
        dueWords = dueWords.slice(0, 5);
    }
    fetch("/api/review-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordBank: wordBank, reviewWords: dueWords, difficultyTier: STATE.difficultyLevel || "beginner"})
    })
    .then(function(r) { return r.json(); })
    .then(function(reviewData) {
        if (reviewData.error) {
            console.log("review-session failed, falling back to teach-lesson");
            fetchTeachDataFallback(wordBank);
            return;
        }
        STATE.currentLesson.wordBank = reviewData.wordBank;
        STATE.currentLesson.questionTemplates = reviewData.questionTemplates;
        fetchTeachDataFallback(wordBank);
    })
    .catch(function(err) {
        console.log("review-session fetch exploded:", err);
        fetchTeachDataFallback(wordBank);
    });
}

function fetchTeachDataFallback(wordBank) {
    fetch("/api/teach-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordBank: wordBank })
    })
    .then(function(r) { return r.json(); })
    .then(function(teachData) {
        if (teachData.error || !Array.isArray(teachData)) {
            startQuizPhase();
            return;
        }
        STATE.teachData = teachData;
        STATE.currentTeachIndex = 0;
        showScreen('teach-screen');
        renderTeachScreen();
    })
    .catch(function(err) {
        console.log("teach-lesson fetch failed:", err);
        startQuizPhase();
    });
}
function renderTeachScreen() {
    var data = STATE.teachData[STATE.currentTeachIndex];
    var body = document.getElementById("teach-body");
    var progress = (STATE.currentTeachIndex / STATE.teachData.length) * 100;
    document.getElementById("teach-progress-fill").style.width = progress + "%";
    body.innerHTML = '<div class="teach-word">' + data.russian + '</div>' + '<div class="teach-desc">' + data.description + '</div>' + '<div class="teach-example">' + data.example + '</div>';
    setTimeout(function() { speakRussian(data.russian); }, 200);

    document.getElementById("teach-next-btn").onclick = function() {
        STATE.currentTeachIndex++;
        if (STATE.currentTeachIndex >= STATE.teachData.length) {
            renderRevisionScreen();
        } else {
            renderTeachScreen();
        }
    };
    document.getElementById("teach-quit-btn").onclick = function() {
        kgbPopup("COWARD DETECTED", "You are abandoning your lesson. The state has noted this.", "BACK TO WORK").then(function() {
            showScreen("home-screen");
            renderTree();
        });
    };
}
function renderRevisionScreen() {
    showScreen('revision-screen');
    var grid = document.getElementById("revision-grid");
    grid.innerHTML = "";

    var i = 0;
    while (i < STATE.teachData.length) {
        var data = STATE.teachData[i];
        var card = document.createElement("div");
        card.className = "revision-card";
        card.innerHTML = '<div class="revision-ru">' + data.russian + '</div>' + '<div class="revision-en">' + data.english + '</div>';
        grid.appendChild(card);
        i++;
    }
    document.getElementById("revision-start-btn").onclick = function() {
        startQuizPhase();
    };
}
function startQuizPhase() {
    STATE.currentQ = 0;
    STATE.correctCount = 0;
    STATE.startTime = new Date().getTime();
    showScreen('lesson-screen');
    renderQuestion();
}