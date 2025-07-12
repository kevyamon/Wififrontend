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


// --- LOGIQUE DE VALIDATION DE CODE (AVEC ACTUALISATION AUTO) ---
const loginForm = document.getElementById('loginForm');
const codeInput = document.getElementById('codeInput');
const messageBox = document.getElementById('messageBox');
const submitButton = document.getElementById('submitButton');
const BACKEND_URL = 'https://wifi-aego.onrender.com/api/validate-code';

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    const userCode = codeInput.value.trim();
    displayMessage('Vérification en cours...', 'loading');
    submitButton.disabled = true;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: userCode })
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message); }
        displayMessage(`✅ ${data.message}`, 'success');
        codeInput.disabled = true;

    } catch (error) {
        displayMessage(`❌ ${error.message || 'Impossible de joindre le serveur. Réessayez.'}`, 'error');

    } finally {
        // Le bouton est déjà géré par la logique du try/catch
        
        // NOUVEAUTÉ : On actualise la page après 3 secondes
        setTimeout(() => {
            location.reload();
        }, 3000); // 3000 millisecondes = 3 secondes
    }
});

function displayMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'message';
    messageBox.classList.add(`message-${type}`);
}