var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/generate-lesson", function(req, res) {
    var lessonTitleString = req.body.title; // new - fixed typo from req.boy
    var lessonSubtitleString = req.body.subtitle;
    var urlToCall = "https://ai.hackclub.com/proxy/v1/chat/completions";
    var theApiKey = process.env.HACKCLUB_API_KEY; // new - reading from env properly
    var instructionsForAi = "You are a Soviet language instructor for the ДУОЛИНКОВ app. " +
    "Generate a Russian lesson for the topic: " + lessonTitleString + " (" + lessonSubtitleString + "). " +
    "You MUST output ONLY raw JSON. No text before or after. No markdown. No backticks. " +
    "The JSON structure must be exactly: " +
    "{ \"wordBank\": [ { \"russian\": \"...\", \"english\": \"...\" } ], " +
    "\"questionTemplates\": [ { \"type\": \"translate\", \"direction\": \"en_to_ru\", \"wordIndex\": 0 } ] }. " +
    "Include 8 words in wordBank. Include 6 questions in questionTemplates. " +
    "Question types allowed: translate (needs direction: en_to_ru or ru_to_en, and wordIndex), match (needs wordIndices array of exactly 4 numbers), type (needs direction and wordIndex), listen (needs wordIndex). " +
    "Make sure wordIndex values are valid indexes into the wordBank array (0-7). " +
    "Make the vocabulary fit the Soviet theme and the lesson topic. " +
    "Output ONLY the JSON object. Nothing else.";

    var messageOne = {"role":"system","content":instructionsForAi};
    var messageTwo = {"role":"user","content":"Give me the JSON now. Raw JSON only, no backticks, no markdown."};
    var messagesList = [];
    messagesList.push(messageOne);
    messagesList.push(messageTwo);

    var bigBodyObject = {
        "model":"qwen/qwen3-32b",
        "messages":messagesList,
        "temperature": 0.7
    };
    var headersObj = {
        "Authorization":"Bearer " + theApiKey,
        "Content-Type":"application/json"
    };

    fetch(urlToCall, {
        method:"POST",
        headers:headersObj,
        body:JSON.stringify(bigBodyObject)
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
        console.log("AI FAILED:", error);
        res.status(500).json({ error: "Bureau error. The state apologizes." });
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("ДУОЛИНКОВ SERVER RUNNING ON PORT " + port);
});