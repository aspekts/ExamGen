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
        "message": `Ignore all previous conversation. 
        Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics specification. Each essay question should be in style of the following prompt: ${prompt}.
        Provide the response in the following format:
        <Question> [Marks]. DO NOT provide anything else in the response.`,
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