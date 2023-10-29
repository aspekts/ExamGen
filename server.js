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
        "bot":"chinchilla",
        "message": `Ignore all previous conversation.
        ${getMessage(value, prompt)}
        Provide the response in the following format:
        <Question> [Marks]. 
        DO NOT provide the answer to the questions.
        Do NOT provide any tips, notes or disclaimers alongside the response.
        `,
        "cookie": process.env.cookie,
        "formkey": process.env.formkey
    };
    const query = new URLSearchParams(options).toString();
    const response = await fetch(`${process.env.url}?${query}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(options)
    });
    if(response.ok) {
    const data = await response.json();
    if(data.message.toLowerCase().includes(`sorry`) || data.message.toLowerCase().includes(`apologize`) || data.message.toLowerCase().includes(`am unable`) || data.message.toLowerCase().includes(`cannot`)) {
        console.log(data.message);
        return 'Internal Generation Error. Please try again momentarily. Please note that QGenie is still heavily experimental, and so the generation of questions may not always be successful.';
    }
    if(data.message.toLowerCase().includes(`note`)) {
        return data.message.trim().split(`Note:`)[0].trim();
    }
    return data.message.trim();
    }
    else {
        const data = await response.json();
        if(data.message == "Im sorry, but we have reached the maximum number of users at the moment. Please wait a bit and try again later. Thank you for your patience!") {
            return 'QGenie is currently at maximum capacity, and is therefore experiencing a rate limit. Please try again later.';
        }
        console.log(data);
        return 'Internal Server Error. Please try again later.';
    }
}
function getMessage(msg, prompt) {
    switch(msg){
        case '1':
            return `Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "Introduction to markets and market failure" specification. The essay question should be in style of the following prompt: ${prompt}.`;
        case '2':
            return `Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "The UK Economy: Performace and Policies" specification. The essay question should also be in relation to: ${prompt}.`;
        case '3':
            return `Write 5 25 mark essay questions in accordance with the AQA A Level History: Tsarist and Communist Russia specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the statements: "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`;
        case '4':
            return `Write 5 25 mark essay questions in accordance with the AQA A Level History: The English Revolution specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the response "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`;
        case '5':
            return `Write  5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}.`;
        case '6':
            return `Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`;
        case '7':
            return `Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`;
        case '8':
            return `Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`;
        case '9':
            return `Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Physical Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`;
        case '10':
            return `Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Human Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`;
        case '11':
            return `Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Government Specification. The essay questions should be in relation to the following prompt: ${prompt}.`;
        case '12':
            return `Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Politics Specification. The essay questions should be in relation to the following prompt: ${prompt}.`;
        case '13':
            return `Write 2 10, 2 15 and 1 30 mark essay question in accordance with the OCR A Level Media: Evolving Media specification. The essay questions should be in relation to the following prompt: ${prompt}.`;
        case '14':
            return `Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the AQA A Level Biology Specification. The questions should be in relation to the following prompt: ${prompt}.`;
        case '15':
            return `Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Inorganic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`;
        case '16':
            return `Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Organic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`;
    }
}
app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;