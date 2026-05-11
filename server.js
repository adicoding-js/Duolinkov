var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/generate-lesson", function(req, res) {
    var lessonTitleString = req.body.title;
    var lessonSubtitleString = req.body.subtitle;
    var userXp = req.body.xp || 0;
    var completedCount = req.body.completedCount || 0;
    var weakWords = req.body.weakWords || [];
    var difficultyLevel = "beginner";
    if (completedCount >= 2 && userXp >= 50) {
        difficultyLevel = "intermediate";
    }
    if (completedCount >= 4 && userXp >= 150) {
        difficultyLevel = "advanced";
    }
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
        model: "x-ai/grok-4.1-fast",
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
        var isValid = true;
        var cyrillicRegex = /[\u0400-\u04FF]/;
        var vi = 0;
        while (vi < finalJson.wordBank.length) {
            if (!cyrillicRegex.test(finalJson.wordBank[vi].russian)) {
                isValid = false;
            }
            vi++;
        }
        var qi = 0;
        while (qi < finalJson.questionTemplates.length) {
            var qt = finalJson.questionTemplates[qi];
            if (qt.wordIndex !== undefined && qt.wordIndex >= finalJson.wordBank.length) {
                isValid = false;
            }
            if (qt.wordIndices !== undefined) {
                var wi2 = 0;
                while (wi2 < qt.wordIndices.length) {
                    if (qt.wordIndices[wi2] >= finalJson.wordBank.length) {
                        isValid = false;
                    }
                    wi2++;
                }
            }
            qi++;
        }
        if (!isValid) {
            console.log("AI returned invalid lesson data, rejecting");
            res.status(500).json({
                error: "invalid lesson data from AI"
            });
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

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("ДУОЛИНКОВ SERVER RUNNING ON PORT " + port);
});