(function () {
    // Éviter la double injection
    if (document.getElementById('viesco-assistant-container')) return;

    // --- Base de données d'astuces d'efficacité et de raccourcis par page ---
    const helpMessages = {
        'default': [
            "⌨️ <b>Raccourci Global</b> : Utilise <code>Alt + Tab</code> pour basculer instantanément entre Pronote et ton navigateur sans toucher à la souris.",
            "⚡ <b>Zéro Clic</b> : Pour sélectionner toute la barre d'adresse de ton navigateur, presse <code>Ctrl + L</code> ou <code>F6</code>.",
            "📋 <b>Productivité</b> : Double-clique sur un mot pour le sélectionner. Triple-clique pour sélectionner tout un paragraphe de motif."
        ],
        'index': [
            "🖥️ <b>Astuce Bureau</b> : Presse <code>Windows + D</code> pour masquer instantanément toutes tes fenêtres si un élève ou un parent s'approche du bureau.",
            "🌐 <b>Ouvrir plusieurs onglets</b> : Clique avec la molette de ta souris sur un lien pour l'ouvrir en arrière-plan sans quitter la page actuelle.",
            "📐 <b>Écran scindé</b> : Maintiens la touche <code>Windows</code> et appuie sur la flèche <code>Gauche</code> ou <code>Droite</code> pour diviser parfaitement ton écran."
        ],
        'Absences': [
            "🚀 <b>Pronote Web</b> : Utilise le bouton d'export/copie intégré en haut à droite des listes Pronote plutôt que de tout sélectionner à la main.",
            "🔍 <b>Recherche Flash</b> : Sur navigateur Internet, fais <code>Ctrl + F</code> pour ouvrir la recherche rapide et trouver un élève instantanément dans une liste.",
            "📞 <b>Gain de temps</b> : Sur la version Web de Pronote, clique parfois directement sur l'icône de statut pour le basculer sans ouvrir le menu déroulant."
        ],
        'bilan_absences': [
            "🖨️ <b>Mise en page A4</b> : Utilise toujours notre bouton 'Imprimer' au lieu de <code>Ctrl + P</code> brut pour que la mise en page s'adapte parfaitement.",
            "📝 <b>Sélection rapide</b> : Pour copier l'intégralité d'un grand tableau, clique n'importe où dedans puis fais <code>Ctrl + A</code> (Tout sélectionner) et <code>Ctrl + C</code> (Copier)."
        ],
        'bilan_trimestriel': [
            "📊 <b>Copie brute</b> : Colle tes données avec <code>Ctrl + V</code>. Notre outil filtre et nettoie généralement les lignes inutiles automatiquement.",
            "📋 <b>Coller sans mise en forme</b> : Utilise <code>Ctrl + Shift + V</code> pour coller du texte brut, sans récupérer les polices, tailles ou couleurs d'origine."
        ],
        'retenues': [
            "⏹️ <b>Sans souris</b> : Utilise la touche <code>Espace</code> pour cocher ou décocher une case présélectionnée.",
            "⏳ <b>Navigation rapide</b> : Utilise la touche <code>Tab</code> pour passer au champ de saisie suivant, et <code>Shift + Tab</code> pour revenir au précédent."
        ],
        'documents': [
            "📁 <b>Chemin d'accès</b> : Dans tes dossiers Windows, fais <code>Maj + Clic droit</code> sur un fichier et choisis 'Copier en tant que chemin d'accès'.",
            "📂 <b>Explorateur direct</b> : Presse <code>Windows + E</code> pour ouvrir instantanément tes dossiers Windows (Mes Documents, Téléchargements...).",
            "♻️ <b>Oups !</b> : Presse <code>Ctrl + Shift + T</code> dans ton navigateur pour rouvrir instantanément le dernier onglet fermé par erreur."
        ],
        'planning': [
            "🖱️ <b>Création</b> : Clique directement dans les cases vides du tableau pour commencer à planifier une tâche.",
            "⚙️ <b>Modifications</b> : Pense à faire un clic droit sur tes blocs pour afficher des menus contextuels d'options (si activés sur ta version).",
            "🖨️ <b>Impression propre</b> : Le format de ce planning a été optimisé pour une impression parfaite en mode 'Paysage'."
        ]
    };

    // --- Astuces Système Générales (Windows / Browser indispensables) ---
    const systemTips = [
        "🔓 <b>Windows + L</b> : Verrouille instantanément ta session quand tu t'éloignes du bureau (sécurité des données élèves).",
        "📋 <b>Windows + V</b> : Active l'historique du presse-papiers (nécessite de cliquer sur 'Activer' la 1ère fois) pour retrouver tes 10 derniers copiés.",
        "🛑 <b>Ctrl + Shift + Échap</b> : Ouvre directement le gestionnaire des tâches si un logiciel freeze, sans passer par l'écran bleu Ctrl+Alt+Suppr.",
        "📸 <b>Windows + Maj + S</b> : Lance l'outil de capture d'écran Windows pour sélectionner une zone précise de ton écran.",
        "🔄 <b>Ctrl + F5</b> : Force le rechargement complet d'une page Web et vide son cache si un bouton semble bloqué.",
        "📁 <b>Ctrl + Shift + N</b> : Crée un nouveau dossier jaune instantanément (Attention : à faire quand tu es dans un dossier Windows, pas sur Internet).",
        "🔍 <b>F2</b> : Renomme instantanément un fichier ou un dossier sélectionné sous Windows.",
        "❌ <b>Alt + F4</b> : Ferme immédiatement le logiciel ou la fenêtre actuellement active à l'écran.",
        "🔎 <b>Ctrl + Molette souris</b> : Zoom ou dézoom instantanément la taille du texte sur un navigateur ou un document.",
        "🔙 <b>Alt + Flèche Gauche</b> : Retourne à la page Internet précédente sans avoir à chercher la petite flèche en haut à gauche.",
        "🧹 <b>Ctrl + W</b> : Ferme instantanément l'onglet de ton navigateur actuel (plus rapide que de viser la petite croix).",
        "⚡ <b>Ctrl + T</b> : Ouvre un nouvel onglet Internet vide prêt pour une nouvelle recherche."
    ];

    let tipHistory = [];

    function getRandomSystemTip() {
        let availableTips = systemTips.filter(t => !tipHistory.includes(t));
        if (availableTips.length === 0) availableTips = systemTips;

        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];

        tipHistory.push(randomTip);
        if (tipHistory.length >= 10) {
            tipHistory.shift(); // Garde les 10 dernières astuces en mémoire pour éviter les répétitions directes
        }

        return randomTip;
    }

    function getContextualMessage() {
        const path = window.location.pathname.toLowerCase();
        let msgs = helpMessages['default'];

        if (path.includes('bilan-absences')) msgs = helpMessages['bilan_absences'];
        else if (path.includes('absences.html')) msgs = helpMessages['Absences'];
        else if (path.includes('bilan-sanctions')) msgs = helpMessages['bilan_trimestriel'];
        else if (path.includes('retenues')) msgs = helpMessages['retenues'];
        else if (path.includes('documents')) msgs = helpMessages['documents'];
        else if (path.includes('planning')) msgs = helpMessages['planning'];
        else if (path.includes('index') || path.endsWith('/')) msgs = helpMessages['index'];

        let msg = msgs[Math.floor(Math.random() * msgs.length)];

        const randomSystemTip = getRandomSystemTip();
        return `<div class="mb-3">${msg}</div><div class="pt-3 border-t border-slate-700/50 text-[12px] text-slate-400 font-mono"><span class="text-pink-400 font-bold">💡 ASTUCE SYSTÈME :</span><br>${randomSystemTip}</div>`;
    }

    function getThemeColor() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('bilan-absences')) return '16, 185, 129'; // Emerald
        if (path.includes('bilan-sanctions')) return '139, 92, 246'; // Violet
        if (path.includes('retenues')) return '249, 115, 22'; // Orange
        if (path.includes('documents')) return '236, 72, 153'; // Pink
        if (path.includes('planning')) return '250, 204, 21'; // Yellow
        return '6, 182, 212'; // Cyan (Défaut)
    }

    const themeRgb = getThemeColor();

    const style = document.createElement('style');
    style.innerHTML = `
        #viesco-assistant-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Inter', sans-serif;
            pointer-events: none;
        }

        #viesco-assistant-bubble {
            background: linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(8, 12, 24, 0.98) 100%);
            border: 2px solid rgba(${themeRgb}, 0.85);
            box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(${themeRgb}, 0.4);
            color: #f8fafc;
            padding: 16px 18px;
            border-radius: 18px 18px 0 18px;
            width: 310px;
            font-size: 13.5px;
            line-height: 1.5;
            margin-bottom: 15px;
            opacity: 0;
            transform: translateY(20px) scale(0.92);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
            pointer-events: auto;
            visibility: hidden;
            backdrop-filter: blur(12px);
        }

        #viesco-assistant-bubble code {
            background: rgba(255, 255, 255, 0.1);
            color: #f472b6;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        #viesco-assistant-bubble.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            visibility: visible;
        }

        #viesco-assistant-avatar-wrapper {
            animation: float 4s ease-in-out infinite;
        }

        #viesco-assistant-avatar {
            width: 90px;
            height: 90px;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s;
            filter: drop-shadow(0 5px 15px rgba(${themeRgb}, 0.8));
            pointer-events: auto;
        }

        #viesco-assistant-avatar:hover {
            transform: scale(1.05) rotate(-3deg);
            filter: drop-shadow(0 8px 25px rgba(${themeRgb}, 1));
        }

        .cup-svg {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }

        .avatar-face {
            position: absolute;
            top: 44px;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 5;
        }

        .avatar-eyes {
            display: flex;
            gap: 10px;
            margin-bottom: 3px;
        }

        .eye {
            width: 7px;
            height: 12px;
            background: #1e293b;
            border-radius: 5px;
            animation: blink 4s infinite;
            position: relative;
        }

        .eye::after {
            content: '';
            position: absolute;
            top: 2px;
            right: 1px;
            width: 3px;
            height: 3px;
            background: white;
            border-radius: 50%;
        }

        .avatar-mouth {
            width: 22px;
            height: 10px;
            background: #7f1d1d;
            border: 2px solid #1e293b;
            border-radius: 0 0 15px 15px;
            position: relative;
            overflow: hidden;
            transition: height 0.2s;
        }

        .avatar-mouth::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 3px;
            width: 12px;
            height: 6px;
            background: #fca5a5;
            border-radius: 5px 5px 0 0;
        }

        .avatar-mouth.talking {
            height: 18px;
            animation: talk 0.3s alternate infinite;
        }

        .cup-hand {
            position: absolute;
            top: 48px;
            left: -5px;
            font-size: 32px;
            z-index: 6;
            transform: rotate(-15deg);
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
            animation: bounce-hand 2s infinite alternate;
        }

        @keyframes bounce-hand {
            0% { transform: rotate(-15deg) translateY(0); }
            100% { transform: rotate(-15deg) translateY(-5px); }
        }

        #viesco-assistant-avatar::after {
            content: '';
            position: absolute;
            top: -15px;
            left: 25px;
            width: 20px;
            height: 15px;
            background: transparent;
            border-radius: 50%;
            box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.5);
            animation: steam 2.5s infinite ease-in-out alternate;
            filter: blur(3px);
            pointer-events: none;
        }

        @keyframes steam {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }

        @keyframes blink {
            0%, 96%, 98%, 100% { transform: scaleY(1); }
            97%, 99% { transform: scaleY(0.1); }
        }
        
        @keyframes talk {
            0% { height: 10px; }
            100% { height: 16px; }
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
        }
        
        @media print {
            #viesco-assistant-container { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'viesco-assistant-container';

    const bubble = document.createElement('div');
    bubble.id = 'viesco-assistant-bubble';

    const wrapper = document.createElement('div');
    wrapper.id = 'viesco-assistant-avatar-wrapper';

    const avatar = document.createElement('div');
    avatar.id = 'viesco-assistant-avatar';
    avatar.innerHTML = `
        <svg class="cup-svg" width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Corps gobelet -->
            <path d="M 15 20 L 75 20 L 60 80 L 30 80 Z" fill="#d4a373" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
            <!-- Manchon isolant -->
            <path d="M 19 40 L 71 40 L 64 65 L 26 65 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
            <!-- Couvercle -->
            <rect x="10" y="8" width="70" height="12" rx="3" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
            <rect x="30" y="2" width="30" height="6" rx="2" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
        </svg>
        <div class="avatar-face">
            <div class="avatar-eyes">
                <div class="eye"></div>
                <div class="eye"></div>
            </div>
            <div class="avatar-mouth" id="viesco-mouth"></div>
        </div>
        <div class="cup-hand">☝️</div>
    `;

    // wrapper.appendChild(avatar);
    container.appendChild(bubble);
    // container.appendChild(wrapper);
    document.body.appendChild(container);

    let isBubbleOpen = true; // Affiché par défaut au changement de page
    let talkTimeout;

    function simulateTalking(duration) {
        const mouth = document.getElementById('viesco-mouth');
        if (mouth) {
            mouth.classList.add('talking');
            clearTimeout(talkTimeout);
            talkTimeout = setTimeout(() => {
                mouth.classList.remove('talking');
            }, duration);
        }
    }

    // Affichage au chargement de la page après un léger délai
    setTimeout(() => {
        if (isBubbleOpen) {
            bubble.innerHTML = getContextualMessage();
            bubble.classList.add('show');
            simulateTalking(2000);
        }
    }, 500);

    // Toggle au clic sur l'avatar
    avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        isBubbleOpen = !isBubbleOpen;
        if (isBubbleOpen) {
            bubble.innerHTML = getContextualMessage();
            bubble.classList.add('show');
            simulateTalking(1500);
        } else {
            bubble.classList.remove('show');
        }
    });

    // Cacher l'astuce en cliquant n'importe où ailleurs sur la page
    document.addEventListener('click', (e) => {
        if (isBubbleOpen && !container.contains(e.target)) {
            isBubbleOpen = false;
            bubble.classList.remove('show');
        }
    });

    // --- Alarme 9h30 : Rappel Cantine ---
    function checkCantineAlarm() {
        const now = new Date();
        const day = now.getDay();
        
        // Pas d'alarme le Mercredi (3), Samedi (6), Dimanche (0)
        if (day === 0 || day === 3 || day === 6) return;
        
        // Entre 9h30 et 9h45
        if (now.getHours() === 9 && now.getMinutes() >= 30 && now.getMinutes() <= 45) {
            const todayStr = now.toLocaleDateString('fr-FR');
            const lastCalled = localStorage.getItem('viesco_cantine_alarm');
            
            if (lastCalled !== todayStr) {
                localStorage.setItem('viesco_cantine_alarm', todayStr);
                
                isBubbleOpen = true;
                bubble.innerHTML = `
                    <div class="mb-2 text-amber-400 font-black text-base flex items-center gap-2">
                        <span class="text-xl">📞</span> APPEL CANTINE
                    </div>
                    <div class="text-[13px] text-white font-medium">
                        Il est 9h30 ! C'est l'heure d'appeler la cantine pour leur communiquer les effectifs du jour.
                    </div>
                `;
                bubble.classList.add('show');
                simulateTalking(4000);
            }
        }
    }

    // Vérifier au chargement puis toutes les minutes
    setTimeout(checkCantineAlarm, 1000); // Petit délai pour ne pas écraser le message de bienvenue
    setInterval(checkCantineAlarm, 60000);

})();