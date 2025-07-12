// --- LOGIQUE POUR LE MODE NUIT/JOUR ---
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');

// Appliquer le thème sauvegardé au chargement de la page
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggleButton.innerHTML = '☀️';
} else {
    themeToggleButton.innerHTML = '🌙';
}

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    let theme = 'dark';
    if (document.body.classList.contains('light-mode')) {
        theme = 'light';
        themeToggleButton.innerHTML = '☀️';
    } else {
        themeToggleButton.innerHTML = '🌙';
    }
    localStorage.setItem('theme', theme);
});


// --- LOGIQUE DE LA PAGE D'ACHAT (AMÉLIORÉE) ---
const paymentForm = document.getElementById('paymentForm');
const payButton = document.getElementById('payButton');
const resultBox = document.getElementById('resultBox');
const GENERATE_CODE_URL = 'https://wifi-aego.onrender.com/api/generate-code';

paymentForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    payButton.textContent = 'TRAITEMENT...';
    payButton.disabled = true;

    const selectedPlan = document.querySelector('input[name="plan"]:checked').value;

    try {
        const response = await fetch(GENERATE_CODE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: selectedPlan })
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Une erreur est survenue.'); }
        displaySuccess(data.duration, data.code);
        paymentForm.style.display = 'none'; // On cache le formulaire après le succès
    } catch (error) {
        resultBox.innerHTML = `<div class="message message-error">❌ ${error.message || 'Impossible de joindre le serveur. Réessayez.'}</div>`;
    } finally {
        // Ce bloc s'exécute toujours.
        // On ne réactive le bouton que si le formulaire est encore visible (c-à-d en cas d'erreur)
        if (paymentForm.style.display !== 'none') {
            payButton.disabled = false;
            payButton.textContent = 'PAYER';
        }
    }
});

// Fonction pour afficher le message de succès dans la boîte de résultat
function displaySuccess(duration, code) {
    resultBox.innerHTML = `
        <div class="message message-success">
            <h4>Félicitations !</h4>
            <p>Abonnement pour <strong>${duration}</strong> réussi.</p>
            <p>Votre code de connexion :</p>
            <div class="generated-code">${code}</div>
            <small>Utilisez ce code sur la page de connexion.</small>
        </div>
    `;
}