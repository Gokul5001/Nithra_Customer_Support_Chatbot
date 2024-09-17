const { NlpManager } = require("node-nlp");
const fs = require("fs");

const manager = new NlpManager({ languages: ["en"] });

// Read the single JSON file
const data = fs.readFileSync("./intents/intents.json");
const intents = JSON.parse(data).intents;

// Loop through the intents in the single JSON file
for (const intent in intents) {
    const questions = intents[intent].questions;
    const answers = intents[intent].answers;

    for (const question of questions) {
        manager.addDocument("en", question, intent);
    }
    for (const answer of answers) {
        manager.addAnswer("en", intent, answer);
    }
}

async function train_save(){
    await manager.train();
    manager.save();
}

train_save();
