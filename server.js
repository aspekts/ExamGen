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
    let options = {
        "model":"mistralai/Mixtral-8x7B-Instruct-v0.1",
        "prompt": `
        ${getMessage(value, prompt)[0]}
        Provide the response in the following format:
        <Question> [Marks]. 
        DO NOT provide the answer to the questions.
        Do NOT provide any tips, notes or disclaimers alongside the response.
        `,
    };
    options = Object.assign(options, getMessage(value, prompt)[1]);
    const query = new URLSearchParams(options).toString();
    const response = await fetch(`${process.env.url}?${query}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.key}`
    },
        body: JSON.stringify(options)
    });
    if(response.ok) {
    const data = await response.json();
    if(!data.output.choices[0].text) {
        return 'Internal Generation Error. Please try again momentarily. Please note that QGenie is still heavily experimental, and so the generation of questions may not always be successful.';
    }
    if(data.output.choices[0].text.toLowerCase().includes(`note`)) {
        return data.output.choices[0].text.trim().split(`Note:`)[0].trim();
    }
    return data.output.choices[0].text.trim();
    }
    else {
        const data = await response.json();
        if(data.status === 429) {
            return 'QGenie is currently at maximum capacity, and is therefore experiencing a rate limit. Please try again later.';
        }
        if(data.status === 503) {
            return 'QGenie is currently experiencing an outage. Please try again later.';
        }
        if(data.status === 529) {
            return "QGenie is currently facing a temporary internal server issue. If the issue persists please email admin@yarndev.co.uk"
        }
        console.log(data);
        return 'Internal Server Error. Please try again later.';
    }
}
var essay_params = {
    "max_tokens": 1000,
    "top_p":0.85,
    "top_k":50,
    "temperature": 0.8,
    "repetition_penalty":1.3
}
var moderate_params = {
"max_tokens":700,
"top_p":0.87,
"top_k":35,
"temperature":0.75,
"repetition_penalty":1.5
}
var precise_params ={
"max_tokens":450,
"top_p":0.9,
"top_k":20,
"temperature":0.5,
"repetition_penalty":1.7
}
function getMessage(msg, prompt) {
    switch(msg){
        case '1':
            return [`Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "Introduction to markets and market failure" specification. The essay question should be in style of the following prompt: ${prompt}.`, essay_params];
        case '2':
            return [`Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "The UK Economy: Performace and Policies" specification. The essay question should also be in relation to: ${prompt}.`, essay_params];
        case '3':
            return [`Write 5 25 mark essay questions in accordance with the AQA A Level History: Tsarist and Communist Russia specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the statements: "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`, essay_params];
        case '4':
            return [`Write 5 25 mark essay questions in accordance with the AQA A Level History: The English Revolution specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the response "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`, essay_params];
        case '5':
            return [`Write  5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}.`, precise_params];
        case '6':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`, precise_params];
        case '7':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`, precise_params];
        case '8':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`, precise_params];
        case '9':
            return [`Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Physical Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`, essay_params];
        case '10':
            return [`Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Human Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`, essay_params];
        case '11':
            return [`Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Government Specification. The essay questions should be in relation to the following prompt: ${prompt}.`, essay_params];
        case '12':
            return [`Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Politics Specification. The essay questions should be in relation to the following prompt: ${prompt}.`, essay_params];
        case '13':
            return [`Write 2 10, 2 15 and 1 30 mark essay question in accordance with the OCR A Level Media: Evolving Media specification. The essay questions should be in relation to the following prompt: ${prompt}.`, essay_params];
        case '14':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the AQA A Level Biology Specification. The questions should be in relation to the following prompt: ${prompt}.`, moderate_params];
        case '15':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Inorganic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`, precise_params];
        case '16':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Organic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`, precise_params];
    }
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;