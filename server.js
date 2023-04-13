const express = require('express');
const cors = require('cors');
const app = express();
const port =  process.env.PORT || 3000;
require('dotenv').config();
const path = require('path');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
app.use(express.json());
app.use(cors());
app.post(`/generate-question`, async (req, res) => {
    const prompt = req.body.prompt;
    if (prompt) {
        const question = await generateEconQuestion(prompt);
        res.send({ question });
    } else {
        res.status(400).send({ error: 'Prompt not provided.' });
    }
});

async function generateEconQuestion(prompt) {
    const options = {
        "key":"B9AAEG066K9BDL2HV7HEZWSYP4DHAGSK3RE",
        "message": "Ignore all previous conversation. Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics specification. Each essay question should be in style of the following prompt: " + prompt + " Provide only the essay question, and the marks it's worth. Do not provide any other information, and do not describe any question.",
    }
    const query = new URLSearchParams(options).toString();
    const response = await fetch(`${process.env.url}?${query}`);
    const data = await response.json();
    return data.message.trim();
}


app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;