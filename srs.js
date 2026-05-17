var WORD_REGISTRY = {};

function createWordEntry(russian, english, lessonId) {
    var entry = {};
    entry.russian = russian;
    entry.english = english;
    entry.lessonId = lessonId;
    entry.timesSeenTotal = 0;
    entry.timesCorrect = 0;
    entry.timesWrong = 0;
    entry.lastSeenTimestamp = null;
    entry.nextReviewTimestamp = null;
    entry.intervalDays = 0;
    entry.easeFactor = 2.5;
    entry.consecutiveCorrect = 0;
    entry.isMastered = false;
    entry.masteredAt = null;
    entry.typeStats = {};
    entry.typeStats.translate = {};
    entry.typeStats.translate.seen = 0;
    entry.typeStats.translate.correct = 0;
    entry.typeStats.translate.wrong = 0;
    entry.typeStats.match = {};
    entry.typeStats.match.seen = 0;
    entry.typeStats.match.correct = 0;
    entry.typeStats.match.wrong = 0;
    entry.typeStats.type = {};
    entry.typeStats.type.seen = 0;
    entry.typeStats.type.correct = 0;
    entry.typeStats.type.wrong = 0;
    entry.typeStats.listen = {};
    entry.typeStats.listen.seen = 0;
    entry.typeStats.listen.correct = 0;
    entry.typeStats.listen.wrong = 0;
    return entry;
}
function registryAddWord(russian, english, lessonId) {
    if (WORD_REGISTRY[russian]) {
        return;
    }
    var entry = createWordEntry(russian, english, lessonId);
    WORD_REGISTRY[russian] = entry;
}

function registryGetWord(russian) {
    if (WORD_REGISTRY[russian]) {
        return WORD_REGISTRY[russian];
    }
    return null;
}

function registryGetAll() {
    var keys = Object.keys(WORD_REGISTRY);
    var result = [];
    var i = 0;
    while (i < keys.length) {
        result.push(WORD_REGISTRY[keys[i]]);
        i++;
    }
    return result;
}
function registrySize() {
    return Object.keys(WORD_REGISTRY).length;
}
var registryDirty = false;

function registryMigrate(entry) {
    if (entry.timesSeenTotal === undefined) { entry.timesSeenTotal = 0; }
    if (entry.timesCorrect === undefined) { entry.timesCorrect = 0; }
    if (entry.timesWrong === undefined) { entry.timesWrong = 0; }
    if (entry.lastSeenTimestamp === undefined) { entry.lastSeenTimestamp = null; }
    if (entry.nextReviewTimestamp === undefined) { entry.nextReviewTimestamp = null; }
    if (entry.intervalDays === undefined) { entry.intervalDays = 0; }
    if (entry.easeFactor === undefined) { entry.easeFactor = 2.5; }
    if (entry.consecutiveCorrect === undefined) { entry.consecutiveCorrect = 0; }
    if (entry.isMastered === undefined) { entry.isMastered = false; }
    if (entry.masteredAt === undefined) { entry.masteredAt = null; }
    if (entry.lessonId === undefined) { entry.lessonId = 0; }
    if (entry.typeStats === undefined) { entry.typeStats = {}; }
    if (entry.typeStats.translate === undefined) { entry.typeStats.translate = { seen: 0, correct: 0, wrong: 0 }; }
    if (entry.typeStats.match === undefined) { entry.typeStats.match = { seen: 0, correct: 0, wrong: 0 }; }
    if (entry.typeStats.type === undefined) { entry.typeStats.type = { seen: 0, correct: 0, wrong: 0 }; }
    if (entry.typeStats.listen === undefined) { entry.typeStats.listen = { seen: 0, correct: 0, wrong: 0 }; }
    return entry;
}

function saveRegistry() {
    var toSave = JSON.stringify(WORD_REGISTRY);
    localStorage.setItem('duolingkov_srs', toSave);
    registryDirty = false;
}

function loadRegistry() {
    var raw = localStorage.getItem('duolingkov_srs');
    if (raw == null) {
        return;
    }
    var parsed = JSON.parse(raw);
    var keys = Object.keys(parsed);
    var i = 0;
    while (i < keys.length) {
        var key = keys[i];
        var entry = parsed[key];
        entry = registryMigrate(entry);
        WORD_REGISTRY[key] = entry;
        i++;
    }
    var allWords = registryGetAll();
    var gi = 0;
    while (gi < allWords.length) {
        checkGhostReentry(allWords[gi]);
        gi++;
    } if (registryDirty == true) {
        saveRegistry();
    }    
}  loadRegistry();

function pushRegistry(userId) {
    return new Promise(function(resolve) {
        var keys = Object.keys(WORD_REGISTRY);
        if (keys.length === 0) {
            resolve();
            return;
        }
        var rows = [];
        var i = 0;
        while (i < keys.length) {
            var entry = WORD_REGISTRY[keys[i]];
            var row = {};
            row.user_id = userId;
            row.word_id = keys[i];
            row.data = JSON.stringify(entry);
            row.updated_at = new Date().toISOString();
            rows.push(row);
            i++;
        }
        supabase.from('srs_words').upsert(rows, { onConflict: 'user_id,word_id' }).then(function(result) {
            if (result.error) {
                console.log('pushRegistry failed:', result.error.message);
            } else {
                console.log('pushRegistry ok, pushed ' + rows.length + ' words');
                registryDirty = false;
            }
            resolve();
        });
    });
}

function pullRegistry(userId) {
    return new Promise(function(resolve) {
        supabase.from('srs_words').select('*').eq('user_id', userId).then(function(result) {
            if (result.error) {
                console.log('pullRegistry failed:', result.error.message);
                resolve();
                return;
            }
            var rows = result.data || [];
            var i = 0;
            while (i < rows.length) {
                var row = rows[i];
                var entry = JSON.parse(row.data);
                entry = registryMigrate(entry);
                WORD_REGISTRY[row.word_id] = entry;
                i++;
            }
            console.log('pullRegistry ok, pulled ' + rows.length + ' words');
            saveRegistry();
            resolve();
        });
    });
}
function getQualityScore(correct, questionType, consecutiveCorrect) {
    var score = 0;
    if (correct) {
        score = 4;
        if (questionType === "translate") {
            if (consecutiveCorrect >= 3) {
                score = 5;
            }
        }
        if (questionType === "match") {
            score = 3;
        }
        if (questionType === "type") {
            score = 4;
        }
        if (questionType === "listen") {
            score = 4;
        }
    } else {
        score = 1;
        if (questionType === "type") {
           score = 0;
        }
        if (questionType === "listen") {
            var raw = 1 - 0.5;
            score = Math.floor(raw);
        }
        if (questionType === "translate") {
            score = 1;
        }
        if (questionType === "match") {
            score = 1;
        }
    }
    return score;
}
function calcNextInterval(entry, qualityScore) {
    var newInterval = entry.intervalDays;
    var newEase = entry.easeFactor;
    var newConsecutive = entry.consecutiveCorrect;

    if (qualityScore < 3) {
        newInterval = 1;
        newConsecutive = 0;
    } else {
        if (newInterval === 0) {
            newInterval = 1;
        } else if (newInterval === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(newInterval * newEase);
        }
        newConsecutive = newConsecutive + 1;
    }
    var easeChange = 0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02);
    newEase = newEase + easeChange;
    if (newEase < 1.3) {
        newEase = 1.3;
    }
    newEase = Math.round(newEase * 100) / 100;
    newInterval = Math.round(newInterval);
    return {
        intervalDays: newInterval,
        easeFactor: newEase,
        consecutiveCorrect: newConsecutive
    };
}
function recAnswer(rus, wasRight, qType) {
    var w = registryGetWord(rus);
    if (w == null) {
        console.log("word not found lol: " + rus);
        return;
    }

    var q = getQualityScore(wasRight, qType, w.consecutiveCorrect);
    var calc = calcNextInterval(w, q);

    w.timesSeenTotal = w.timesSeenTotal + 1;

    if (wasRight == true) {
        w.timesCorrect = w.timesCorrect + 1;
        w.consecutiveCorrect = calc.consecutiveCorrect;
    } else {
        w.timesWrong = w.timesWrong + 1;
        w.consecutiveCorrect = 0;
    }

    w.intervalDays = calc.intervalDays;
    w.easeFactor = calc.easeFactor;

    w.lastSeenTimestamp = Date.now();
    w.nextReviewTimestamp = Date.now() + (calc.intervalDays * 86400000);

    if (w.typeStats[qType] == null) {
        w.typeStats[qType] = {};
        w.typeStats[qType].seen = 0;
        w.typeStats[qType].correct = 0;
        w.typeStats[qType].wrong = 0;
    }
    w.typeStats[qType].seen = w.typeStats[qType].seen + 1;
    if (wasRight == true) {
        w.typeStats[qType].correct = w.typeStats[qType].correct + 1;
    } else {
        w.typeStats[qType].wrong = w.typeStats[qType].wrong + 1;
    }
    if (w.consecutiveCorrect >= 5 && w.intervalDays >= 21) {
        w.isMastered = true;
        w.masteredAt = Date.now();
    }

    registryDirty = true;
    saveRegistry();
}
function getMemoryStrength(w) {
    var daysSince = 0;
    var decay = 0;
    var strength = 0;
    var rounded = 0;
    var neverSeen = false;
    var overdue = false;
    var isMastered = false;
    var masteredBonus = 0;
    var overduepenalty = 0;

    if (w.timesSeenTotal === 0) {
        neverSeen = true;
    }
    if (neverSeen == true) {
        return 0;
    }
    daysSince = (Date.now() - w.lastSeenTimestamp) / 86400000;
    decay = w.intervalDays * w.easeFactor;

    if (decay <= 0) {
        decay = 0.1;
    }
    strength = Math.exp(-daysSince / decay);

    if (w.isMastered == true) {
        isMastered = true;
    }
    if (isMastered == true) {
        masteredBonus = strength * 1.15;
        strength = masteredBonus;
    }
    if (daysSince > w.intervalDays * 2) {
        overdue = true;
    }
    if (overdue == true) {
        overduepenalty = strength * 0.6;
        strength = overduepenalty;
    }
    if (strength > 1) {
        strength = 1;
    }
    if (strength < 0) {
        strength = 0;
    }
    rounded = Math.round(strength * 100) / 100;
    return rounded;
}
function isDue(w) {
    if (w.nextReviewTimestamp == null) {
        return false;
    }
    if (Date.now() >= w.nextReviewTimestamp) {
        return true;
    }
    return false;
}

function getOverdueDays(w) {
    if (w.nextReviewTimestamp == null) {
        return 0;
    }
    var diff = Date.now() - w.nextReviewTimestamp;
    var days = diff / 86400000;
    return days;
}

function getDueWords() {
    var all = registryGetAll();
    var due = [];
    var i = 0;
    while (i < all.length) {
        if (isDue(all[i]) == true) {
            due.push(all[i]);
        }
        i++;
    }
    due.sort(function(a, b) {
        var aDays = getOverdueDays(a);
        var bDays = getOverdueDays(b);
        if (bDays > aDays) {
            return 1;
        }
        if (bDays < aDays) {
            return -1;
        }
        return 0;
    });
    return due;
}

function getNewWords(lessonId) {
    var all = registryGetAll();
    var newWords = [];
    var i = 0;
    while (i < all.length) {
        if (all[i].timesSeenTotal === 0) {
            if (lessonId != null) {
                if (all[i].lessonId == lessonId) {
                    newWords.push(all[i]);
                }
            } else {
                newWords.push(all[i]);
            }
        } i++;
    } return newWords;
}
function getDueCount() {
    var due = getDueWords();
    return due.length;
}
function checkGhostReentry(w) {
    if (w.isMastered == false) {
        return;
    }
    if (w.masteredAt == null) {
        return;
    }
    var daysSinceMastered = (Date.now() - w.masteredAt) / 86400000;
    var isGhost = false;
    if (daysSinceMastered >= 30) {
        isGhost = true;
    }
    if (isGhost == false) {
        return;
    }
    var oldEase = w.easeFactor;
    var newEase = oldEase - 0.4;
    if (newEase < 1.3) {
        newEase = 1.3;
    }
    var oldInterval = w.intervalDays;
    var halfInterval = oldInterval * 0.5;
    var newInterval = Math.round(halfInterval);

    if (newInterval < 1) {
        newInterval = 1;
    }
    w.isMastered = false;
    w.masteredAt = null;
    w.easeFactor = newEase;
    w.intervalDays = newInterval;
    w.nextReviewTimestamp = Date.now() + (newInterval * 86400000);
    console.log("ghost reentry: " + w.russian);

    registryDirty = true;
}
function getUrgencyScore(w) {
    var overdue = getOverdueDays(w);
    var easeScore = 0;
    var wrongRate = 0;
    var urgency = 0;
    var timesTotal = w.timesSeenTotal;

    if (timesTotal > 0) {
        wrongRate = w.timesWrong / timesTotal;
    }
    if (w.easeFactor < 1.5) {
        easeScore = 3;
    } else if (w.easeFactor < 2.0) {
        easeScore = 2;
    } else if (w.easeFactor < 2.5) {
        easeScore = 1;
    } else {
        easeScore = 0;
    }
    urgency = overdue + (wrongRate * 3) + easeScore;
    return urgency;
}

function getLessonSlotBudget() {
    var due = getDueCount();
    var totalSlots = 6;
    var reviewSlots = 0;
    var newSlots = 0;
    var reviewRatio = 0.65;
    if (due >= 8) {
        totalSlots = 8;
    }
    if (due >= 12) {
        totalSlots = 10;
    }
    reviewSlots = Math.min(due, Math.round(totalSlots * reviewRatio));
    newSlots = totalSlots - reviewSlots;
    var budget = {};
    budget.totalSlots = totalSlots;
    budget.reviewSlots = reviewSlots;
    budget.newSlots = newSlots;
    return budget;
}

function pickReviewWords(count) {
    var due = getDueWords();
    var picked = [];
    var i = 0;
    due.sort(function(a, b) {
        var aScore = getUrgencyScore(a);
        var bScore = getUrgencyScore(b);
        if (bScore > aScore) {
            return 1;
        }
        if (bScore < aScore) {
            return -1;
        } return 0;
    });
    while (i < due.length && i < count) {
        picked.push(due[i]);
        i++;
    }  return picked;
}
function pickNewWords(count, lessonId) {
    var newWords = getNewWords(lessonId);
    var picked = [];
    var i = 0;

    if (newWords.length < count) {
        var otherNew = getNewWords(null);
        var j = 0;
        while (j < otherNew.length) {
            var alreadyIn = false;
            var k = 0;
            while (k < newWords.length) {
                if (newWords[k].russian == otherNew[j].russian) {
                    alreadyIn = true;
                }
                k++;
            }
            if (alreadyIn == false) {
                newWords.push(otherNew[j]);
            }  j++;
        }
    }
    newWords.sort(function() {
        return 0.5 - Math.random();
    });

    while (i < newWords.length && i < count) {
        picked.push(newWords[i]);
        i++;
    }

    return picked;
}
function pickWordsForLesson(lessonId) {
    var budget = getLessonSlotBudget();
    var reviewWords = pickReviewWords(budget.reviewSlots);
    var newWords = pickNewWords(budget.newSlots, lessonId);
    var allWords = [];
    var seen = {};
    var i = 0;

    while (i < reviewWords.length) {
        if (!seen[reviewWords[i].russian]) {
            allWords.push(reviewWords[i]);
            seen[reviewWords[i].russian] = true;
        }
        i++;
    }
    var j = 0;
    while (j < newWords.length) {
        if (!seen[newWords[j].russian]) {
            allWords.push(newWords[j]);
            seen[newWords[j].russian] = true;
        }
        j++;
    }
    var result = {};
    result.reviewWords = reviewWords;
    result.newWords = newWords;
    result.allWords = allWords;

    return result;
}
function selectQuestionType(w) {
    var types = ["translate", "type", "listen"];
    var worstType = null;
    var worstAccuracy = 999;
    var i = 0;
    if (w.timesSeenTotal < 2) {
        return "translate";
    }
    while (i < types.length) {
        var t = types[i];
        var stats = w.typeStats[t];
        if (stats != null && stats.seen >= 2) {
            var acc = stats.correct / stats.seen;
            if (acc < worstAccuracy) {
                worstAccuracy = acc;
                worstType = t;
            }
        }
        i++;
    }
    if (worstType != null) {
        return worstType;
    }
    var roll = Math.random();
    var picked = "translate";
    if (roll < 0.35) {
        picked = "translate";
    } else if (roll < 0.60) {
        picked = "type";
    } else if (roll < 0.85) {
        picked = "listen";
    } else {
        picked = "translate";
    } return picked;
}
function buildQuestionTemplate(w, wordIndex) {
    var qType = selectQuestionType(w);
    var template = {};
    var direction = "en_to_ru";
    var ruToEnAcc = 0;
    var enToRuAcc = 0;
    var ruStats = w.typeStats["translate"];

    if (ruStats != null && ruStats.seen >= 2) {
        var totalCorrect = ruStats.correct;
        var totalSeen = ruStats.seen;
        enToRuAcc = totalCorrect / totalSeen;
        ruToEnAcc = totalCorrect / totalSeen;
    }
    if (ruToEnAcc > enToRuAcc) {
        direction = "en_to_ru";
    } else if (enToRuAcc > ruToEnAcc) {
        direction = "ru_to_en";
    } else {
        if (Math.random() > 0.5) {
            direction = "ru_to_en";
        } else {
            direction = "en_to_ru";
        }
    }
    template.type = qType;
    template.wordIndex = wordIndex;
    if (qType === "translate" || qType === "type") {
        template.direction = direction;
    }
    if (qType === "listen") {
        template.wordIndex = wordIndex;
    } return template;
}
function buildMatchQuestion(wordGroup, startIndex) {
    var template = {};
    var indices = [];
    var i = 0;
    while (i < wordGroup.length) {
        indices.push(startIndex + i);
        i++;
    }
    template.type = "match";
    template.wordIndices = indices;
    return template;
}

function sequenceQuestions(templates) {
    var sequenced = [];
    var remaining = [];
    var i = 0;
    while (i < templates.length) {
        remaining.push(templates[i]);
        i++;
    }
    var typeCounts = {};
    typeCounts.translate = 0;
    typeCounts.type = 0;
    typeCounts.listen = 0;
    typeCounts.match = 0;
    var j = 0;
    while (j < templates.length) {
        var t = templates[j].type;
        if (typeCounts[t] == null) {
            typeCounts[t] = 0;
        }
        typeCounts[t] = typeCounts[t] + 1;
        j++;
    }
    var maxAttempts = remaining.length * remaining.length;
    var attempts = 0;
    var lastType = null;
    var consecutiveSame = 0;

    while (remaining.length > 0 && attempts < maxAttempts) {
        attempts++;
        var bestPick = null;
        var bestPickIndex = -1;
        var k = 0;

        while (k < remaining.length) {
            var candidate = remaining[k];
            var isSameAsLast = candidate.type == lastType;
            var isEmpty = sequenced.length === 0;
            if (isEmpty == true) {
                bestPick = candidate;
                bestPickIndex = k;
                break;
            }
            if (isSameAsLast == false) {
                bestPick = candidate;
                bestPickIndex = k;
                break;
            }
            if (consecutiveSame < 2 && bestPick == null) {
                bestPick = candidate;
                bestPickIndex = k;
            }
            k++;
        }
        if (bestPick == null) {
            bestPick = remaining[0];
            bestPickIndex = 0;
        }
        if (bestPick.type == lastType) {
            consecutiveSame = consecutiveSame + 1;
        } else {
            consecutiveSame = 0;
        }
        lastType = bestPick.type;
        sequenced.push(bestPick);
        remaining.splice(bestPickIndex, 1);
    }
    var leftover = 0;
    while (leftover < remaining.length) {
        sequenced.push(remaining[leftover]);
        leftover++;
    } return sequenced;
}
function buildDynamicLesson(lessonId, wordBank) {
    var i = 0;
    while (i < wordBank.length) {
        registryAddWord(wordBank[i].russian, wordBank[i].english, lessonId);
        i++;
    }
    var picked = pickWordsForLesson(lessonId);
    var allWords = picked.allWords;
    if (allWords.length < 4) {
        var j = 0;
        while (j < wordBank.length) {
            var alreadyIn = false;
            var k = 0;
            while (k < allWords.length) {
                if (allWords[k].russian == wordBank[j].russian) {
                    alreadyIn = true;
                }
                k++;
            }
            if (alreadyIn == false) {
                allWords.push(wordBank[j]);
            } j++;
        }
    }
    var templates = [];
    var matchGroupStart = -1;
    var matchGroupCount = 0;
    var m = 0;
    while (m < allWords.length) {
        var w = allWords[m];
        var tmpl = buildQuestionTemplate(w, m);
        templates.push(tmpl);

        if (matchGroupCount < 4) {
            matchGroupCount++;
            if (matchGroupCount === 1) {
                matchGroupStart = m;
            }
        } m++;
    }
    if (matchGroupCount >= 4) {
        var matchGroup = [];
        var mg = matchGroupStart;
        while (mg < matchGroupStart + 4) {
            matchGroup.push(allWords[mg]);
            mg++;
        }
        var matchTemplate = buildMatchQuestion(matchGroup, matchGroupStart);
        templates.push(matchTemplate);
    }

    var sequenced = sequenceQuestions(templates);
    var finalWordBank = [];
    var fw = 0;
    while (fw < allWords.length) {
        finalWordBank.push({
            russian: allWords[fw].russian,
            english: allWords[fw].english
        });
        fw++;
    }

    var result = {};
    result.wordBank = finalWordBank;
    result.questionTemplates = sequenced;
    return result;
}