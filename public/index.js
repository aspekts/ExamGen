const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');
const loader = document.getElementById('loader');

if (!questionContainer.innerText) {
    questionContainer.innerText = 'No question generated yet. Try to generate one!';
}
generateBtn.addEventListener('click', () => {
    const prompt = form.elements.prompt.options[form.elements.prompt.selectedIndex].text;

    if (prompt) {
        // Show the loader
loader.classList.add('opacity-100');
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
            // Hide the loader
            loader.classList.remove('opacity-100');
            loader.classList.add('opacity-0');
        })
        .catch(error => console.error(error));
    } else {
        alert('Please select a prompt.');
    }
});