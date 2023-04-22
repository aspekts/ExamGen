const form = document.getElementById('question-form');
const generateBtn = document.getElementById('generate-btn');
const questionContainer = document.getElementById('question-container');

if (!questionContainer.innerText) {
    questionContainer.innerText = 'No question generated yet. Try to generate one!';
}
generateBtn.addEventListener('click', () => {
    questionContainer.innerHTML = `
    <div style="border-top-color:transparent"
    class="w-16 h-16 border-4 border-blue-400 border-dotted rounded-full animate-spin"></div>
</div>
    `;
    const prompt = form.elements.prompt.options[form.elements.prompt.selectedIndex].text;

    if (prompt) {
        // Show the loader
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
            questionContainer.innerHTML = '';
            questionContainer.innerText = question;
            // Hide the loader
        })
        .catch(error => console.error(error));
    } else {
        alert('Please select a prompt.');
    }
});