const express = require('express');
const cors = require('cors');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
const port =  process.env.PORT || 3000;
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const keyvmysql = require('@keyv/mysql');
var db = new keyvmysql(process.env.mysql, {
    namespace: 'main',
    table: 'users',
    ttl: 60 * 60 * 24,
    ssl: {
        rejectUnauthorized:true, 
    }
})
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.key);
const gemini = genAI.getGenerativeModel({model:  "gemini-pro"});
db.on('error', err => console.log('[MAIN]: Error:', err));
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
app.use(async function (req, res, next) {
        res.locals.user = req.oidc.user;
        next();
    });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get('/', (req, res) => {
    res.render(path.join(__dirname + '/public/views/index.ejs'));
})
app.get('/countdown', (req, res) => {
    res.render(path.join(__dirname + '/public/views/countdown.ejs'));
});
app.get('/gen', requiresAuth(), async (req, res) => {

    let profile = await db.get(`user:${req.oidc.user.sid}`) ? db.get(`user:${req.oidc.user.sid}`)  : null;
    if (profile) {
        const reset_time = await db.get(profile).gen_refresh ? db.get(profile).gen_refresh : 0;
        if(Date.now() > reset_time) await setDB();
    }
   else {
    await setDB();
    profile = await db.get(`user:${req.oidc.user.sid}`);
   }

    res.render(path.join(__dirname + '/public/views/gen.ejs'), {
        user: req.oidc.user,
        profile: profile,
        premium: profile ? profile.premium !== 0 : false,
        db: db
    });
    const currentDate = new Date();
    var profile_obj = {
        user:req.oidc.user,
        premium: 0,
        premiumExpiry: null,
        gen_refresh:new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate() + 1,0,0,0),
        free_gens:10
    }
  async function setDB() {
    await db.set(`user:${req.oidc.user.sid}`, profile_obj);
  }
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
    const text = `
        You are a language model that provides correct and detailed exam style questions, in order, in accordance with a specific subject's specification. Put the question number then mention the question explicitly, as well as the marks, and then in the next line "Ans: " and Answer.
        Output format:
       <Question Number>. <Question> [<Marks>]

        Sample Output (Economics, Market Failure):

        1. Explain how ‘asymmetric information’ can lead to market failure in health provision. [5]
        2. Assess the benefits of indirect taxation to remove market failure for plastic bags. [8]
        3. ‘Public parks are a public good’. Assess this statement. [10]

        For this prompt specifically:
        ${getMessage(value, prompt)[0]}
        `;
    const result = await gemini.generateContent(text);
    const response = await result.response;
    if(!response){
        console.log(result);
        db.set(`Err:${Date.now()}`, result);    
        return 'Internal Server Error. Please try again later.';
    }
    return response.text().trim;
}


function getMessage(msg, prompt) {
    switch(msg){
        case '1':
            return [`Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "Introduction to markets and market failure" specification. The essay question should be in style of the following prompt: ${prompt}.`];
        case '2':
            return [`Write a 4, 5, 10, 15 and 20 mark essay question in accordance with the Edexcel A Level Economics A: "The UK Economy: Performace and Policies" specification. The essay question should also be in relation to: ${prompt}.`];
        case '3':
            return [`Write 5 25 mark essay questions in accordance with the AQA A Level History: Tsarist and Communist Russia specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the statements: "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`];
        case '4':
            return [`Write 5 25 mark essay questions in accordance with the AQA A Level History: The English Revolution specification. The essay questions should also be in relation to: ${prompt}. The essay questions should provide a statement, followed by one of the response "To what extent do you agree", "Assess the validity of this view", or "Explain why you disagree or agree with this view". The statement should also provide a time range, which would best fit the question.`];
        case '5':
            return [`Write  5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}.`];
        case '6':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 1 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`];
        case '7':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Pure Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`];
        case '8':
            return [`Write 5 exam style questions in accordance with the Edexcel A Level Mathematics: Year 2 Statistics and Mechanics Specification. Write any equations involved in any questions in LaTeX, inline format. The questions should be related to ${prompt}`];
        case '9':
            return [`Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Physical Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`];
        case '10':
            return [`Write a 3, 4, 6, 9 and 20 mark essay question in accordance with the AQA A Level Geography: Human Geography Specification. The essay questions should be in relation to the following prompt: ${prompt}.`];
        case '11':
            return [`Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Government Specification. The essay questions should be in relation to the following prompt: ${prompt}.`];
        case '12':
            return [`Write 5 30 mark essay questions in accordance with the Edexcel A Level Government and Politics: UK Politics Specification. The essay questions should be in relation to the following prompt: ${prompt}.`];
        case '13':
            return [`Write 2 10, 2 15 and 1 30 mark essay question in accordance with the OCR A Level Media: Evolving Media specification. The essay questions should be in relation to the following prompt: ${prompt}.`];
        case '14':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the AQA A Level Biology Specification. The questions should be in relation to the following prompt: ${prompt}.`];
        case '15':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Inorganic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`];
        case '16':
            return [`Write a 1, 2, 3, 4 and 6 mark exam style question in accordance with the Edexcel A Level Chemistry: Advanced Organic and Physical Chemistry Specification. Write any equations involved in any questions in LaTeX format. The questions should be in relation to the following prompt: ${prompt}.`];
    }
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
module.exports = app;