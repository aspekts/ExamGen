const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');
const para = document.createElement('p');
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
            console.log(question);
            questionContainer.innerHTML = '';
            para.innerText = question;
            questionContainer.appendChild(para);
            if(MathJax) {
                MathJax.typeset([questionContainer]);
            }
            // Hide the loader
        })
        .catch(error => console.error(error));
    } 
    else {
        alert('Please select a prompt.');
        return;
    }

});