const express = require('express');
const cors = require('cors');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
const port =  process.env.PORT || 3000;
require('dotenv').config();
const path = require('path');

/**
 * App Configuration
*/
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cors());
app.use(auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_DOMAIN
    }));
app.use(function (req, res, next) {
        res.locals.user = req.oidc.user;
        next();
      });
app.get('/gen', requiresAuth(), (req, res) => {
    res.sendFile(path.join(__dirname + '/public/gen.html'));
});
  // Defined routes
app.post(`/generate-question`, async (req, res) => {
    const prompt = req.body.prompt;
    const value = req.body.value
    if (prompt) {
        const question = await generateQuestion(value, prompt);
        res.send({ question });
    } else {
        res.status(400).send({ error: 'Prompt not provided.' });
    }
});

async function generateQuestion(value, prompt) {
    const options = {
        "key":"B9AAEG066K9BDL2HV7HEZWSYP4DHAGSK3RE",
        "message": `Ignore all previous conversation. 
        ${getMessage(value, prompt)}
        Provide the response in the following format:
        <Question> [Marks]. 
        DO NOT provide any disclaimers, or describe any of the questions. Do not provide any tips, notes or disclaimers alongside the response.`,
    }
    const query = new URLSearchParams(options).toString();
    const response = await fetch(`${process.env.url}?${query}`);
    if(response.ok) {
    const data = await response.json();
    return data.message.trim();
    }
    else {
        const data = await response.json()
        console.log(data);
        return 'Internal Server Error. Please try again later.';
    }
}
function getMessage(msg, prompt) {
    switch(msg){
        case '1':
            return `Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "Introduction to markets and market failure" specification. The essay question should be in style of the following prompt: ${prompt}.`;
        case '2':
            return `Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "The UK Economy: Performace and Policies" specification. The essay question should be in style of the following prompt: ${prompt}.`;
        case '3':
            return `Write two 20, two 25, and two 30 mark essay questions in accordance with the AQA A Level History: Tsarist and Communist Russia specification. The essay questions should be in style of the following prompt: ${prompt}.`;
        case '4':
            return `Write two 20, two 25, and two 30 mark essay questions in accordance with the AQA A Level History: The English Revolution specification. The essay questions should be in style of the following prompt: ${prompt}.`;
    }
}
app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;