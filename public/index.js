const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');

if (!questionContainer.innerText) {
    questionContainer.innerText = 'No question generated yet. Try to generate one!';
}
generateBtn.addEventListener('click', () => {
    questionContainer.innerHTML = `
    <img src="./assets/icon.gif" alt="QGenie Logo Anim" class="h-16 w-16"></img>
    `;
    const prompt = form.elements.prompt.options[form.elements.prompt.selectedIndex].text;
    const val = form.elements.prompt.options[form.elements.prompt.selectedIndex].value;
    if (prompt) {
        // Show the loader
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
            questionContainer.innerText = question;
            // Hide the loader
        })
        .catch(error => console.error(error));
    } else {
        alert('Please select a prompt.');
    }
});