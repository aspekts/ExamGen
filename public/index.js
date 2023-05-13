const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');
const para = document.createElement('p');
const promptSelect = document.getElementById('prompt');
const subPromptSelect = document.getElementById('sub-prompt');
const nestedSelect = document.getElementById('nested-select');
import prompts from './subjects.json' assert { type: "json" };
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

generateBtn.addEventListener('click', () => {
    const prompt = form.elements.prompt.options[form.elements.prompt.selectedIndex].text;
    const val = form.elements.prompt.options[form.elements.prompt.selectedIndex].value;
    if (prompt && val !== 'none') {
        // Show the loader
        questionContainer.innerHTML = `
            <img src="./assets/icon.gif" alt="QGenie Logo Anim" class="h-16 w-16"></img>
        `;
        fetch('/generate-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: val, prompt: prompt })
        })
        .then(response => response.json())
        .then(data => {
            const question = data.question;
            questionContainer.innerHTML = '';
            para.innerText = question;
            questionContainer.appendChild(para);
            if (MathJax) {
                MathJax.typeset([questionContainer]);
            }
            // Hide the loader
        })
        .catch(error => alert(error));
    } else {
        alert('Please select a prompt!');
        return;
    }
});