// --- LOGIQUE POUR LE MODE NUIT/JOUR ---
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');

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


// --- LOGIQUE DE LA PAGE D'ACHAT (AVEC BOUTON COPIER) ---
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
        
        // NOUVEAUTÉ : On appelle la nouvelle fonction d'affichage
        displaySuccessWithCopyButton(data.duration, data.code);
        
        paymentForm.style.display = 'none';
    } catch (error) {
        resultBox.innerHTML = `<div class="message message-error">❌ ${error.message || 'Impossible de joindre le serveur. Réessayez.'}</div>`;
        payButton.disabled = false;
        payButton.textContent = 'PAYER';
    }
});

// NOUVEAUTÉ : La fonction d'affichage a été améliorée
function displaySuccessWithCopyButton(duration, code) {
    // 1. On affiche le message de succès et le nouveau bouton
    resultBox.innerHTML = `
        <div class="message message-success">
            <h4>Félicitations !</h4>
            <p>Abonnement pour <strong>${duration}</strong> réussi.</p>
            <p>Votre code de connexion :</p>
            <div class="generated-code">${code}</div>
            <button id="copy-redirect-btn" class="button button-primary" style="margin-top: 15px;">Copier & Se Connecter</button>
        </div>
    `;

    // 2. On ajoute la logique au bouton qui vient d'être créé
    const copyRedirectBtn = document.getElementById('copy-redirect-btn');
    copyRedirectBtn.addEventListener('click', () => {
        // On copie le code dans le presse-papiers
        navigator.clipboard.writeText(code).then(() => {
            // Si la copie réussit...
            copyRedirectBtn.textContent = 'Copié !'; // On donne un feedback à l'utilisateur
            // On attend un court instant puis on redirige
            setTimeout(() => {
                window.location.href = '/'; // Redirection vers la page de connexion
            }, 500); // 500ms = 0.5 seconde
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
            alert("Erreur lors de la copie du code.");
        });
    });
}