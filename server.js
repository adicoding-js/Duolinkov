var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

function validateQuestionSet(wordBank, questionTemplates) {
    var result = {};
    result.ok = true;
    result.reason = "";

    if (!wordBank || !Array.isArray(wordBank)) {
        result.ok = false;
        result.reason = "wordBank missing or not array";
        return result;
    }
    if (!questionTemplates || !Array.isArray(questionTemplates)) {
        result.ok = false;
        result.reason = "questionTemplates missing or not array";
        return result;
    }
    if (wordBank.length === 0) {
        result.ok = false;
        result.reason = "wordBank is empty";
        return result;
    }
    if (questionTemplates.length === 0) {
        result.ok = false;
        result.reason = "questionTemplates is empty";
        return result;
    }

    var cyrillicRegex = /[\u0400-\u04FF]/;
    var wi = 0;
    while (wi < wordBank.length) {
        var w = wordBank[wi];
        if (!w.russian || !w.english) {
            result.ok = false;
            result.reason = "wordBank entry missing russian or english at index " + wi;
            return result;
        }
        if (!cyrillicRegex.test(w.russian)) {
            result.ok = false;
            result.reason = "wordBank entry at index " + wi + " has no cyrillic in russian field";
            return result;
        }
        if (typeof w.english !== "string" || w.english.trim().length === 0) {
            result.ok = false;
            result.reason = "wordBank entry at index " + wi + " has empty english";
            return result;
        }
        wi++;
    }

    var allowedTypes = ["translate", "match", "type", "listen"];
    var allowedDirections = ["en_to_ru", "ru_to_en"];
    var qi = 0;
    while (qi < questionTemplates.length) {
        var qt = questionTemplates[qi];
        if (!qt.type) {
            result.ok = false;
            result.reason = "question at index " + qi + " missing type";
            return result;
        }
        var typeIsAllowed = false;
        var ti = 0;
        while (ti < allowedTypes.length) {
            if (allowedTypes[ti] === qt.type) {
                typeIsAllowed = true;
            }
            ti++;
        }
        if (!typeIsAllowed) {
            result.ok = false;
            result.reason = "question at index " + qi + " has unknown type: " + qt.type;
            return result;
        }
        if (qt.type === "translate" || qt.type === "type") {
            if (qt.wordIndex === undefined || qt.wordIndex === null) {
                result.ok = false;
                result.reason = "question at index " + qi + " missing wordIndex";
                return result;
            }
            if (qt.wordIndex < 0 || qt.wordIndex >= wordBank.length) {
                result.ok = false;
                result.reason = "question at index " + qi + " wordIndex out of range: " + qt.wordIndex;
                return result;
            }
            if (!qt.direction) {
                result.ok = false;
                result.reason = "question at index " + qi + " missing direction";
                return result;
            }
            var dirAllowed = false;
            var di = 0;
            while (di < allowedDirections.length) {
                if (allowedDirections[di] === qt.direction) {
                    dirAllowed = true;
                }
                di++;
            }
            if (!dirAllowed) {
                result.ok = false;
                result.reason = "question at index " + qi + " bad direction: " + qt.direction;
                return result;
            }
        }
        if (qt.type === "listen") {
            if (qt.wordIndex === undefined || qt.wordIndex === null) {
                result.ok = false;
                result.reason = "listen question at index " + qi + " missing wordIndex";
                return result;
            }
            if (qt.wordIndex < 0 || qt.wordIndex >= wordBank.length) {
                result.ok = false;
                result.reason = "listen question at index " + qi + " wordIndex out of range";
                return result;
            }
        }
        if (qt.type === "match") {
            if (!qt.wordIndices || !Array.isArray(qt.wordIndices)) {
                result.ok = false;
                result.reason = "match question at index " + qi + " missing wordIndices array";
                return result;
            }
            if (qt.wordIndices.length < 2) {
                result.ok = false;
                result.reason = "match question at index " + qi + " needs at least 2 pairs";
                return result;
            }
            var mi = 0;
            while (mi < qt.wordIndices.length) {
                if (qt.wordIndices[mi] < 0 || qt.wordIndices[mi] >= wordBank.length) {
                    result.ok = false;
                    result.reason = "match question at index " + qi + " has out of range wordIndex at position " + mi;
                    return result;
                }
                mi++;
            }
        }
        qi++;
    }
    return result;
}

app.post("/api/generate-lesson", function(req, res) {
    var lessonTitleString = req.body.title;
    var lessonSubtitleString = req.body.subtitle;
    var userXp = req.body.xp || 0;
    var completedCount = req.body.completedCount || 0;
    var weakWords = req.body.weakWords || [];
    var difficultyLevel = req.body.difficultyTier || "beginner";
    var questionCount = 6;
    if (difficultyLevel === "intermediate") {
        questionCount = 7;
    }
    if (difficultyLevel === "advanced") {
        questionCount = 8;
    }
    var weakWordsPart = "";
    if (weakWords.length > 0) {
        weakWordsPart = "The user has struggled with these English words before, so try to include them or related words: " + weakWords.slice(0, 5).join(", ") + ". ";
    }
    var urlToCall = "https://ai.hackclub.com/proxy/v1/chat/completions";
    var theApiKey = process.env.api;
    var instructionsForAi = "You are a Soviet language instructor for the ДУОЛИНКОВ app. " +
    "Generate a Russian lesson for the topic: " + lessonTitleString + " (" + lessonSubtitleString + "). " +
    "The user's difficulty level is: " + difficultyLevel + ". " +
    "For beginner: use very common simple words. For intermediate: use less common words and longer phrases. For advanced: use complex vocabulary, idioms, and Soviet-specific terminology. " +
    weakWordsPart +
    "You MUST output ONLY raw JSON. No text before or after. No markdown. No backticks. " +
    "The JSON structure must be exactly: " +
    "{ \"wordBank\": [ { \"russian\": \"...\", \"english\": \"...\" } ], " +
    "\"questionTemplates\": [ { \"type\": \"translate\", \"direction\": \"en_to_ru\", \"wordIndex\": 0 } ] }. " +
    "Include exactly 8 words in wordBank. Include exactly " + questionCount + " questions in questionTemplates. " +
    "Question types allowed: translate (needs direction: en_to_ru or ru_to_en, and wordIndex), match (needs wordIndices array of exactly 4 numbers), type (needs direction and wordIndex), listen (needs wordIndex). " +
    "Make sure wordIndex values are valid indexes into the wordBank array (0-7). " +
    "Make the vocabulary fit the Soviet theme and the lesson topic. " +
    "Output ONLY the JSON object. Nothing else.";
    var messageOne = {
        role: "system",
        content: instructionsForAi
    };
    var messageTwo = {
        role: "user",
        content: "Give me the JSON now. Raw JSON only, no backticks, no markdown."
    };
    var messagesList = [messageOne, messageTwo];
    var bigBodyObject = {
        model: "google/gemini-3.1-flash-lite",
        messages: messagesList,
        temperature: 0.7
    };
    var headersObj = {
        Authorization: "Bearer " + theApiKey,
        "Content-Type": "application/json"
    };
    fetch(urlToCall, {
        method: "POST",
        headers: headersObj,
        body: JSON.stringify(bigBodyObject)
    })
    .then(function(apiResponse) {
        return apiResponse.text();
    })
    .then(function(rawText) {
        var parsedRes = JSON.parse(rawText);
        var aiContent = parsedRes.choices[0].message.content;
        var cleanJsonString = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
        var finalJson = JSON.parse(cleanJsonString);
        var validation = validateQuestionSet(finalJson.wordBank, finalJson.questionTemplates);
        if (!validation.ok) {
        console.log("validateQuestionSet failed:", validation.reason);
        res.status(500).json({ error: "invalid lesson data from AI" });
        return;
            }
        res.json(finalJson);
    })
    .catch(function(error) {
        console.log("AI FAILED:", error);
        res.status(500).json({
            error: "Bureau error. The state never apologizes tho"
        });
    });
});

app.post("/api/teach-lesson", function(req, res) {
    var wordBank = req.body.wordBank || [];
    if (wordBank.length === 0) {
        return res.status(400).json({ error: "wordBank is required" });
    }
    var wordsListStr = JSON.stringify(wordBank);
    var urlToCall = "https://ai.hackclub.com/proxy/v1/chat/completions";
    var theApiKey = process.env.api;
    var instructionsForAi = "You are a Soviet language instructor for the ДУОЛИНКОВ app. " +
    "The user is a beginner learning Russian. " +
    "For each word in the provided JSON array, generate a 'description' and an 'example' sentence. " +
    "The description must be 1-2 sentences max, explaining the context/usage with a dry, Soviet, mildly intimidating, or bizarrely bureaucratic tone. No generic mnemonics. " +
    "The example should be a single sentence demonstrating the word naturally. Do NOT use labels like 'Example:'. " +
    "You MUST output ONLY raw JSON. No text before or after. No markdown. No backticks. " +
    "Output strictly a JSON array of objects in this exact format: " +
    "[ { \"russian\": \"...\", \"english\": \"...\", \"description\": \"...\", \"example\": \"...\" } ]\n" +
    "Here are the words you must process: " + wordsListStr;

    var messageOne = {
        role: "system",
        content: instructionsForAi
    };
    var messageTwo = {
        role: "user",
        content: "Give me the JSON array now. Raw JSON only, no backticks, no markdown."
    };
    var messagesList = [messageOne, messageTwo];
    var bigBodyObject = {
        model: "google/gemini-3.1-flash-lite",
        messages: messagesList,
        temperature: 0.7
    };
    var headersObj = {
        Authorization: "Bearer " + theApiKey,
        "Content-Type": "application/json"
    };
    fetch(urlToCall, {
        method: "POST",
        headers: headersObj,
        body: JSON.stringify(bigBodyObject)
    })
    .then(function(apiResponse) {
        return apiResponse.text();
    })
    .then(function(rawText) {
        var parsedRes = JSON.parse(rawText);
        var aiContent = parsedRes.choices[0].message.content;
        var cleanJsonString = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
        var finalJson = JSON.parse(cleanJsonString);
        res.json(finalJson);
    })
    .catch(function(error) {
        console.log("AI TEACH FAILED:", error);
        res.status(500).json({
            error: "Bureau error during curriculum generation. Stand by."
        });
    });
});
app.post("/api/review-session", function(req, res) {
    var wordBank = req.body.wordBank || [];
    var reviewWords = req.body.reviewWords || [];
    var allWords = [];
    var seen = {};
    var ri = 0;
    while (ri < reviewWords.length) {
        var rw = reviewWords[ri];
        if (rw.russian && rw.english && !seen[rw.russian]) {
            allWords.push({ russian: rw.russian, english: rw.english });
            seen[rw.russian] = true;
        }
        ri++;
    }
    var wi = 0;
    while (wi < wordBank.length) {
        var ww = wordBank[wi];
        if (ww.russian && ww.english && !seen[ww.russian]) {
            allWords.push({ russian: ww.russian, english: ww.english });
            seen[ww.russian] = true;
        }
        wi++;
    }
    if (allWords.length === 0) {
        res.status(400).json({ error: "no words to build session from" });
        return;
    }
    var questionTemplates = [];
    var allowedTypes = ["translate", "type", "listen", "translate"];
    var difficultyTier = req.body.difficultyTier || "beginner";
    if(difficultyTier === "intermediate") {
        allowedTypes = ["translate", "type", "listen", "translate"];
    } else if( difficultyTier === "advanced") {
        allowedTypes = ["translate", "type", "listen", "translate"];
    }
    var qi = 0;
    while (qi < allWords.length) {
        var typeIndex = qi % 4;
        var qType = allowedTypes[typeIndex];
        var template = {};
        template.type = qType;
        template.wordIndex = qi;
        if (qType === "translate" || qType === "type") {
            if (qi % 2 === 0) {
                template.direction = "en_to_ru";
            } else {
                template.direction = "ru_to_en";
            }
        }
        questionTemplates.push(template);
        qi++;
    }
    if (allWords.length >= 4) {
        var matchTemplate = {};
        matchTemplate.type = "match";
        matchTemplate.wordIndices = [0, 1, 2, 3];
        questionTemplates.splice(2, 0, matchTemplate);
    }
    var validation = validateQuestionSet(allWords, questionTemplates);
    if (!validation.ok) {
        console.log("review-session validateQuestionSet failed:", validation.reason);
        res.status(500).json({ error: "review session build failed: " + validation.reason });
        return;
    }
    res.json({
        wordBank: allWords,
        questionTemplates: questionTemplates
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("ДУОЛИНКОВ SERVER RUNNING ON PORT " + port);
});