const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');
const para = document.createElement('p');
const promptSelect = document.getElementById('prompt');
const subPromptSelect = document.getElementById('sub-prompt');
const nestedSelect = document.getElementById('nested-select');
const prompts = require("./subjects.json");
promptSelect.addEventListener('change', (e) => {
    const value = e.target.value;

    if (value !== 'none') {
        subPromptSelect.innerHTML = '';
        prompts[value].forEach((optionText) => {
            const option = document.createElement('option');
            option.value = value;
            option.innerText = optionText;
            subPromptSelect.appendChild(option);
        });
        nestedSelect.classList.remove('hidden');
    } else {
        nestedSelect.classList.add('hidden');
    }
});
if (!questionContainer.innerText) {
    questionContainer.innerText = 'No question generated yet. Try to generate one!';
}

generateBtn.addEventListener('click', async () => {
    // get value of nested  subprompt select
    const prompt = form.elements['sub-prompt'].options[form.elements['sub-prompt'].selectedIndex].text;
    const val = form.elements.prompt.options[form.elements.prompt.selectedIndex].value;
    if (prompt && val !== 'none') {
        // Show the loader
        questionContainer.innerHTML = `
            <img src="./assets/new/logo.gif" alt="QGenie Logo Anim" class="h-16 w-28"></img>
        `;
        const response = await fetch('/generate-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: val, prompt: prompt })
        })
        if(!response.ok){
            console.log(response);
            alert("Something went wrong. Please try again.");
            return;
        }
        const data = await response.json();
            console.log(data);
            const question = data.question;
            questionContainer.innerHTML = '';
            para.innerText = question;
            questionContainer.appendChild(para);
            if (MathJax) {
                await MathJax.Hub.Queue(["Typeset", MathJax.Hub, questionContainer]);
            }
            if(!MathJax) {
                console.log("MathJax not loaded");
            }
    } else {
        alert('Please select a prompt!');
        return;
    }
});