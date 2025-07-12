// On sélectionne les éléments HTML avec lesquels on veut interagir
const loginForm = document.getElementById('loginForm');
const codeInput = document.getElementById('codeInput');
const messageBox = document.getElementById('messageBox');
const submitButton = document.getElementById('submitButton');

// L'URL de votre backend déployé sur Render.
// C'est le lien le plus important de tout le projet !
const BACKEND_URL = 'https://wifi-aego.onrender.com/api/validate-code';


// On écoute l'événement "submit" du formulaire (quand l'utilisateur clique sur le bouton)
loginForm.addEventListener('submit', async function(event) {
    // Empêche le comportement par défaut du formulaire (qui est de recharger la page)
    event.preventDefault(); 
    
    // On récupère le code entré par l'utilisateur
    const userCode = codeInput.value.trim();

    // On affiche un message de chargement et on désactive le bouton
    displayMessage('Vérification en cours...', 'loading');
    submitButton.disabled = true;

    try {
        // C'est ici que le frontend contacte le backend !
        const response = await fetch(BACKEND_URL, {
            method: 'POST', // On utilise la méthode POST comme défini dans notre backend
            headers: {
                'Content-Type': 'application/json' // On lui dit qu'on envoie du JSON
            },
            body: JSON.stringify({ code: userCode }) // On convertit notre code en chaîne de caractères JSON
        });

        // On récupère la réponse du serveur (qui est aussi en JSON)
        const data = await response.json();

        // Si la réponse n'est pas "ok" (ex: erreur 400), on traite ça comme une erreur
        if (!response.ok) {
            // On utilise le message d'erreur envoyé par le backend (ex: "Code invalide")
            throw new Error(data.message);
        }

        // Si tout s'est bien passé (réponse "ok"), on affiche le message de succès
        displayMessage(`✅ ${data.message}`, 'success');
        codeInput.disabled = true; // On désactive le champ de saisie après un succès

    } catch (error) {
        // S'il y a eu une erreur (code invalide, serveur inaccessible...)
        // On affiche le message d'erreur
        displayMessage(`❌ ${error.message}`, 'error');
        submitButton.disabled = false; // On réactive le bouton pour que l'utilisateur puisse réessayer
    }
});


// Fonction simple pour afficher les messages dans la boîte prévue à cet effet
function displayMessage(text, type) {
    messageBox.textContent = text;
    // On réinitialise les classes pour enlever les anciennes couleurs
    messageBox.className = 'message'; 
    // On ajoute la classe de couleur qui correspond au type de message
    messageBox.classList.add(`message-${type}`);
}