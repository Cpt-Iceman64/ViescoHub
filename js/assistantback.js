// assistant.js
(function () {
    // Éviter la double injection
    if (document.getElementById('viesco-assistant-container')) return;

    // --- Configuration des messages contextuels (Astuces et Conseils) ---
    const helpMessages = {
        'default': [
            "⚡ Astuce rapidité : utilise (Ctrl+V) pour coller directement tes données, c'est bien plus rapide que le clic droit !",
            "⌨️ Gain de temps : pour rafraîchir la page, presse simplement (F5) ou (Ctrl+R).",
            "🚀 Pense à utiliser les raccourcis clavier au lieu de la souris, tes poignets te remercieront !"
        ],
        'index': [
            "👋 Bonjour ! Passe une excellente journée à la VieSco !",
            "☕ Salut ! Prêt(e) à affronter les élèves aujourd'hui ?",
            "☀️ Coucou ! N'oublie pas de sourire et d'être bienveillant, ça fait toujours du bien.",
            "👋 Hello ! Prends une grande inspiration, la journée va bien se passer.",
            "💡 Navigue rapidement entre les différents outils depuis ce tableau de bord. Tout est à portée de clic !"
        ],
        'Absences': [
            "🚀 Astuce de pro : Dans Pronote, inutile de faire Ctrl+A ! Clique simplement sur l'icône de copie en haut à droite pour tout exporter.",
            "📞 Clique plusieurs fois sur les étiquettes 'À appeler' pour faire évoluer le statut (Appelé, Répondeur, Régularisé, etc.) !",
            "📋 N'oublie pas d'utiliser le bouton 'Générer rapport' à la fin de ton appel pour copier le récapitulatif parfait pour les CPE."
        ],
        'bilan_absences': [
            "🖨️ Attention : Une fois le bilan affiché, clique bien sur le bouton 'Imprimer' (et non Ctrl+P) pour garantir une mise en page parfaite !",
            "📊 Astuce : Assure-toi de bien sélectionner la plage de dates complète dans Pronote avant de copier les données."
        ],
        'bilan_trimestriel': [
            "⚡ Gagne du temps : Le bilan trimestriel consolide automatiquement toutes les données que tu as collées.",
            "🖨️ Utilise le bouton d'impression pour obtenir des fiches propres et claires pour les conseils de classe."
        ],
        'retenues': [
            "🕒 Tu peux trier la liste des retenues par date ou par élève en un clin d'œil.",
            "⚡ Pour copier les retenues depuis Pronote, cherche le petit bouton 'Copier les données' dédié à ça !"
        ],
        'documents': [
            "💡 Astuce : Sur Windows, fais (Maj + Clic droit) sur un fichier puis choisis 'Copier en tant que chemin d'accès' pour l'ajouter ici.",
            "🚀 Centralise tout : Ajoute ici tous tes tableurs et plannings récurrents pour les ouvrir d'un seul clic depuis n'importe où !",
            "📁 Info : Tes raccourcis sont sauvegardés dans ton navigateur actuel. Ils seront là à ta prochaine session."
        ],
        'planning': [
            "🖱️ Création rapide : Sélectionne un outil à gauche (ex: Permanence), puis clique dans la colonne d'un AED pour ajouter un bloc.",
            "📏 Ajustement : Place ta souris sur le bord inférieur d'un bloc et glisse-le vers le bas pour changer sa durée visuellement.",
            "⚙️ Modification : Fais un clic droit sur n'importe quel bloc pour ouvrir la modale, changer son heure à la minute près ou changer sa tâche !",
            "🖇️ Sélection Multiple : Maintiens la touche (MAJ) enfoncée et clique sur plusieurs blocs pour les sélectionner et les fusionner !",
            "📋 Copier/Coller : Tu peux 'Copier' un bloc via le clic droit (modale), puis faire un clic droit dans une zone vide du planning pour le 'Coller ici' !",
            "🖨️ Impression : Le bouton Imprimer génère un super classeur de 5 pages indépendantes, avec les blocs parfaitement adaptés à l'horizontale !"
        ]
    };


    const jokes = [
        "🥶 (Il fait 25°C dehors, mais quelqu'un a sûrement encore froid ici. Désolé, je ne peux pas importer le soleil des Antilles en Bluetooth.)",
        "☕ (Niveau critique : la jauge de caféine de notre râleur en chef est au plus bas. Mettez-vous tous à l'abri !)",
        "👮‍♀️ (Un certain regard foudroyant suffit pour figer n'importe quel 6ème. Dommage que ça ne marche pas pour débugger l'ordinateur...)",
        "⌨️ (Alerte lenteur : quelqu'un est en train de taper un motif de punition avec seulement deux index. Temps estimé : 15 minutes.)",
        "🧸 (Mon code est purement froid et logique, heureusement qu'il y a un peu de douceur dans l'équipe pour équilibrer tout ça.)",
        "🎯 (Ici, ça dégaine les heures de colle plus vite que son ombre. J'ai dû rajouter de la RAM à mes serveurs pour suivre la cadence !)",
        "🗣️ ('S'il vous plaiiiit !' Mes capteurs audio ont encore détecté un certain accent parisien résonner dans le couloir.)",
        "📞 (Ce fameux coup de téléphone aux parents... l'intéressé compte le reporter à 2027 ou cliquer sur le numéro maintenant ?)",
        "🥪 (Alerte sécurité : surveillez vos tiroirs, mes algorithmes m'indiquent qu'une petite faim s'est encore déclarée dans l'équipe.)",
        "🍝 (C'est l'heure de la surveillance cantine. Que le sort vous soit favorable. Moi je reste bien sagement caché dans mon écran.)",
        "⚙️ (Quand l'autorité naturelle croise le sens de l'organisation, le bureau tourne tellement bien qu'on dirait un script sans aucun bug.)",
        "🖥️ (Certains regardent encore cet ordinateur avec beaucoup de méfiance. Le suspense est total : qui va planter en premier ?)",
        "📻 (Pendant que ça refait le monde en bavardant allègrement, n'oubliez pas que le téléphone sonne depuis 5 bonnes minutes !)",
        "⚠️ (Radar activé : un spécimen d'élève classé catégorie 'relou' approche du bureau. Préparez vos meilleurs soupirs.)"
    ];


    let jokeHistory = [];

    function getRandomJoke() {
        let availableJokes = jokes.filter(j => !jokeHistory.includes(j));
        if (availableJokes.length === 0) availableJokes = jokes; // Failsafe

        const randomJoke = availableJokes[Math.floor(Math.random() * availableJokes.length)];

        jokeHistory.push(randomJoke);
        if (jokeHistory.length >= 15) {
            jokeHistory.shift(); // Garde en mémoire les 15 dernières blagues
        }

        return randomJoke;
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

        // 20% de chances d'ajouter le message pour le créateur au hasard
        if (Math.random() < 0.2) {
            msg += "<br><br><span style='color: #fbbf24; font-weight: 500;'>💡 Pense à remercier mon créateur (et offre-lui un café ☕) !</span>";
        }

        const randomJoke = getRandomJoke();
        return msg + "<br><br><span style='font-size: 0.85em; color: #94a3b8; font-style: italic;'>" + randomJoke + "</span>";
    }

    function getThemeColor() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('bilan-absences')) return '16, 185, 129'; // Emerald
        if (path.includes('bilan-sanctions')) return '139, 92, 246'; // Violet
        if (path.includes('retenues')) return '249, 115, 22'; // Orange
        if (path.includes('documents')) return '236, 72, 153'; // Pink
        if (path.includes('planning')) return '250, 204, 21'; // Yellow 400
        return '6, 182, 212'; // Cyan (Défaut)
    }

    const themeRgb = getThemeColor();

    // --- Injection du style CSS encapsulé ---
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
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
            border: 2px solid rgba(${themeRgb}, 0.8);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 25px rgba(${themeRgb}, 0.6);
            color: #f8fafc;
            padding: 15px 20px;
            border-radius: 20px 20px 0 20px;
            max-width: 280px;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
            visibility: hidden;
            backdrop-filter: blur(10px);
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
            top: 44px; /* Centré sur le manchon élargi */
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

    // --- Injection du HTML ---
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
            <!-- Cup Body (Conical - Wider) -->
            <path d="M 15 20 L 75 20 L 60 80 L 30 80 Z" fill="#d4a373" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
            <!-- Sleeve (Conical - Wider) -->
            <path d="M 19 40 L 71 40 L 64 65 L 26 65 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
            <!-- Lid -->
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

    // --- Logique d'interaction ---
    let isBubbleOpen = true; // Ouvert par défaut au changement de page !
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

    // Affichage automatique au chargement
    setTimeout(() => {
        if (isBubbleOpen) {
            bubble.innerHTML = getContextualMessage();
            bubble.classList.add('show');
            simulateTalking(2500); // Il parle pendant 2.5s
        }
    }, 600); // Petit délai de 600ms pour laisser la page s'afficher d'abord

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

    // Fermer la bulle si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (isBubbleOpen && !container.contains(e.target)) {
            isBubbleOpen = false;
            bubble.classList.remove('show');
        }
    });

})();
