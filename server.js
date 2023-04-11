const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = 3000;
const config = require("./config.json")
app.use(express.static('public'));
app.use(express.json());
app.use(cors());
app.post('/generate-question', async (req, res) => {
    const prompt = req.body.prompt;
    if (prompt) {
        const question = await generateQuestion(prompt);
        res.send({ question });
    } else {
        res.status(400).send({ error: 'Prompt not provided.' });
    }
});

async function generateQuestion(prompt) {
    console.log(prompt)
    const options = {
        "key":"B9AAEG066K9BDL2HV7HEZWSYP4DHAGSK3RE",
        "message": "Ignore all previous conversation. Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel AS Level Economics specification. Each essay question should be in style of the following prompt: " + prompt + " Provide only the essay question, and the marks it's worth. Do not provide any other information, and do not describe any question.",
    }
    const query = new URLSearchParams(options).toString();
    const response = await fetch(`${config.url}?${query}`);
    const data = await response.json();
    return data.message.trim();
}


app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;