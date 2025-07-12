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


// --- LOGIQUE DE LA PAGE D'ACHAT (AVEC COPIE AMÉLIORÉE) ---
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
        
        displaySuccessWithCopyButton(data.duration, data.code);
        
        paymentForm.style.display = 'none';
    } catch (error) {
        resultBox.innerHTML = `<div class="message message-error">❌ ${error.message || 'Impossible de joindre le serveur. Réessayez.'}</div>`;
        payButton.disabled = false;
        payButton.textContent = 'PAYER';
    }
});

// NOUVELLE FONCTION DE COPIE "PLAN B"
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Style pour rendre le textarea invisible
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        return successful;
    } catch (err) {
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
}


// La fonction d'affichage a été améliorée pour utiliser la nouvelle logique de copie
function displaySuccessWithCopyButton(duration, code) {
    resultBox.innerHTML = `
        <div class="message message-success">
            <h4>Félicitations !</h4>
            <p>Abonnement pour <strong>${duration}</strong> réussi.</p>
            <p>Votre code de connexion :</p>
            <div class="generated-code">${code}</div>
            <button id="copy-redirect-btn" class="button button-primary" style="margin-top: 15px;">Copier & Se Connecter</button>
        </div>
    `;

    const copyRedirectBtn = document.getElementById('copy-redirect-btn');
    copyRedirectBtn.addEventListener('click', () => {
        // On essaie d'abord la méthode moderne
        if (!navigator.clipboard) {
            // Si le navigateur ne supporte pas du tout la méthode moderne, on passe au plan B
            handleCopy(fallbackCopyTextToClipboard(code));
            return;
        }
        navigator.clipboard.writeText(code).then(() => {
            // Si ça marche, on gère le succès
            handleCopy(true);
        }).catch(err => {
            // Si ça échoue, on tente le plan B
            console.warn('La méthode de copie moderne a échoué, tentative de la méthode de secours.');
            handleCopy(fallbackCopyTextToClipboard(code));
        });
    });

    function handleCopy(success) {
        const copyRedirectBtn = document.getElementById('copy-redirect-btn');
        if (success) {
            copyRedirectBtn.textContent = 'Copié !';
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } else {
            alert("Erreur lors de la copie du code.");
        }
    }
}