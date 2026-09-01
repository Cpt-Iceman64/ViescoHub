function initMenu() {
    // 1. Déterminer le chemin de base et la page courante
    const path = window.location.pathname;
    const inOutils = path.includes('/outils/');
    const inDocuments = path.includes('/documents/');
    const basePath = (inOutils || inDocuments) ? '../' : './';
    
    let pageName = path.split('/').pop().replace('.html', '');
    if (pageName === '' || pageName === 'index') {
        if (inDocuments) pageName = 'documents';
        else pageName = 'accueil';
    }

    // 2. Générer le HTML de l'en-tête
    const headerHTML = `
    <header class="w-full no-print z-50 bg-[#05080f]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0">
        <div class="w-full px-4 md:px-12 py-4 flex justify-between items-center relative">
            
            <!-- Logo -->
            <a href="${basePath}index.html" class="flex items-center gap-3 group">
                <div class="text-cyan-400 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
                </div>
                <span class="text-xl font-black tracking-tight text-white group-hover:text-slate-200 transition-colors">Viesco<span class="text-cyan-400">Hub</span></span>
            </a>

            <!-- Bouton Mobile -->
            <button id="mobile-menu-btn" class="lg:hidden text-slate-400 hover:text-white transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            <!-- Navigation Bureau -->
            <nav class="hidden lg:flex items-center gap-2 xl:gap-4 text-xs font-bold tracking-widest uppercase text-slate-400">
                
                <a href="${basePath}index.html" class="px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-cyan-400 transition-all ${pageName==='accueil'?'text-white bg-slate-800/30':''}">Accueil</a>
                
                <!-- Pôle Absences -->
                <div class="relative group px-1">
                    <button class="px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-emerald-400 transition-all flex items-center gap-1 ${pageName.includes('absence')?'text-white':''}">
                        Absences <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <!-- Wrapper transparent pour le hover -->
                    <div class="absolute left-0 top-full pt-2 hidden group-hover:block z-50 w-56">
                        <div class="flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
                            <a href="${basePath}outils/absences-traitement.html" class="px-5 py-3.5 hover:bg-slate-800 hover:text-cyan-400 transition-colors flex items-center gap-3">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Traitement Absences
                            </a>
                            <a href="${basePath}outils/absences-bilan.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-emerald-500 transition-colors flex items-center gap-3">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bilan Journalier
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Pôle Sanctions -->
                <div class="relative group px-1">
                    <button class="px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-orange-400 transition-all flex items-center gap-1 ${pageName.includes('sanction')?'text-white':''}">
                        Sanctions <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <!-- Wrapper transparent pour le hover -->
                    <div class="absolute left-0 top-full pt-2 hidden group-hover:block z-50 w-56">
                        <div class="flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
                            <a href="${basePath}outils/sanctions-retenues.html" class="px-5 py-3.5 hover:bg-slate-800 hover:text-orange-500 transition-colors flex items-center gap-3">
                                <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Retenues
                            </a>
                            <a href="${basePath}outils/sanctions-bilan.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-violet-400 transition-colors flex items-center gap-3">
                                <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span> Bilan Global
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Pôle Outils -->
                <div class="relative group px-1">
                    <button class="px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-yellow-400 transition-all flex items-center gap-1 ${['planning','casiers','createur-devoirs','documents','passage-self'].includes(pageName)?'text-white':''}">
                        Outils <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <!-- Wrapper transparent pour le hover -->
                    <div class="absolute right-0 top-full pt-2 hidden group-hover:block z-50 w-64">
                        <div class="flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
                            <a href="${basePath}outils/planning.html" class="px-5 py-3.5 hover:bg-slate-800 hover:text-yellow-400 transition-colors flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Planning Journalier
                            </a>
                            <a href="${basePath}outils/casiers.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-blue-400 transition-colors flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Gestion des Casiers
                            </a>
                            <a href="${basePath}outils/passage-self.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-amber-500 transition-colors flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg> Passage Self
                            </a>
                            <a href="${basePath}outils/createur-devoirs.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Créateur Devoirs
                            </a>
                            <a href="${basePath}documents/index.html" class="px-5 py-3.5 border-t border-slate-800/50 hover:bg-slate-800 hover:text-pink-400 transition-colors flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> Bibliothèque
                            </a>
                        </div>
                    </div>
                </div>

                <div class="h-6 w-px bg-slate-700 mx-1"></div>

                <!-- Horloge -->
                <div class="flex items-center gap-2 bg-slate-900 border border-slate-700/50 px-4 py-1.5 rounded-full shadow-inner">
                    <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
                    <span id="live-time-global" class="text-xs font-bold text-cyan-400 font-mono tracking-wider">--:--</span>
                </div>
            </nav>
        </div>

        <!-- Menu Mobile (simplifié) -->
        <div id="mobile-menu" class="hidden lg:hidden border-t border-slate-800/50 bg-[#05080f] w-full px-6 py-6 shadow-2xl">
            <nav class="flex flex-col gap-4 text-sm font-bold tracking-wider uppercase text-slate-300">
                <a href="${basePath}index.html" class="hover:text-cyan-400 border-b border-slate-800 pb-2">Accueil</a>
                <span class="text-xs text-slate-500 mt-2 mb-1">Absences</span>
                <a href="${basePath}outils/absences-traitement.html" class="hover:text-cyan-400 ml-4">Traitement</a>
                <a href="${basePath}outils/absences-bilan.html" class="hover:text-emerald-500 ml-4 border-b border-slate-800 pb-2">Bilan</a>
                <span class="text-xs text-slate-500 mt-2 mb-1">Sanctions</span>
                <a href="${basePath}outils/sanctions-retenues.html" class="hover:text-orange-500 ml-4">Retenues</a>
                <a href="${basePath}outils/sanctions-bilan.html" class="hover:text-violet-400 ml-4 border-b border-slate-800 pb-2">Bilan</a>
                <span class="text-xs text-slate-500 mt-2 mb-1">Outils</span>
                <a href="${basePath}outils/planning.html" class="hover:text-yellow-400 ml-4">Planning</a>
                <a href="${basePath}outils/casiers.html" class="hover:text-blue-400 ml-4">Casiers</a>
                <a href="${basePath}outils/passage-self.html" class="hover:text-amber-500 ml-4">Passage Self</a>
                <a href="${basePath}outils/createur-devoirs.html" class="hover:text-indigo-400 ml-4">Devoirs</a>
                <a href="${basePath}documents/index.html" class="hover:text-pink-400 ml-4">Documents</a>
            </nav>
        </div>
    </header>`;

    // 3. Injecter l'en-tête (remplace l'existant s'il y en a un, sinon ne rien faire pour les pages sans menu)
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
        existingHeader.outerHTML = headerHTML;
    }

    // 4. Activer le menu mobile
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 5. Horloge globale
    function updateGlobalClock() {
        const clock = document.getElementById('live-time-global');
        if (clock) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            clock.textContent = timeStr;
        }
    }
    setInterval(updateGlobalClock, 1000);
    updateGlobalClock();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
} else {
    initMenu();
}
