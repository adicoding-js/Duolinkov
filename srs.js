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
}
loadRegistry();
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
