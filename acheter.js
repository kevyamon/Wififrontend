// On sélectionne les éléments de la nouvelle page
const paymentForm = document.getElementById('paymentForm');
const payButton = document.getElementById('payButton');
const resultBox = document.getElementById('resultBox');

// Toujours l'URL de notre backend sur Render
const GENERATE_CODE_URL = 'https://wifi-aego.onrender.com/api/generate-code';

// On écoute le clic sur le bouton "PAYER"
paymentForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    payButton.disabled = true;
    payButton.textContent = 'TRAITEMENT...';

    // On trouve quel plan a été coché par l'utilisateur
    const selectedPlan = document.querySelector('input[name="plan"]:checked').value;

    try {
        const response = await fetch(GENERATE_CODE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: selectedPlan })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Une erreur est survenue.');
        }

        // Si tout va bien, on affiche le message de succès avec le code
        displaySuccess(data.duration, data.code);
        paymentForm.style.display = 'none'; // On cache le formulaire après le succès

    } catch (error) {
        // En cas d'erreur
        resultBox.innerHTML = `<div class="message message-error">❌ ${error.message}</div>`;
        payButton.disabled = false;
        payButton.textContent = 'PAYER';
    }
});

// Fonction pour afficher le message de succès
function displaySuccess(duration, code) {
    resultBox.innerHTML = `
        <div class="message message-success">
            <h4>Félicitations !</h4>
            <p>Vous êtes abonné pour une durée de <strong>${duration}</strong>.</p>
            <p>Voici votre code de connexion :</p>
            <div class="generated-code">${code}</div>
            <small>Utilisez ce code sur la page de connexion.</small>
        </div>
    `;
}