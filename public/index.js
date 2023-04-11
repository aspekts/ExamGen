const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');
if (!questionContainer.innerText) {
    questionContainer.innerText = 'No question generated yet. Try to generate one!';
}
generateBtn.addEventListener('click', () => {
    const prompt = form.elements.prompt.options[form.elements.prompt.selectedIndex].text;

    if (prompt) {
        fetch('/generate-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        })
        .then(response => response.json())
        .then(data => {
            const question = data.question;
            questionContainer.innerText = question;
        })
        .catch(error => console.error(error));
    } else {
        alert('Please select a prompt.');
    }
});