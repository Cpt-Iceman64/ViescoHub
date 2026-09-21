// Configuration partagée uniquement : les placements manuels restent locaux.
(function (root) {
    const copy = value => JSON.parse(JSON.stringify(value));
    function valid(value) {
        return value && Array.isArray(value.classes) && value.classes.length > 0 &&
            value.classes.every(c => c && typeof c.name === 'string' && typeof c.lvl === 'string') &&
            new Set(value.classes.map(c => c.name)).size === value.classes.length &&
            value.settings && typeof value.settings === 'object' && !Array.isArray(value.settings);
    }
    function start({ db, storage, getConfig, applyConfig, isEditing, status }) {
        const ref = db.collection('viescohub_data').doc('self_settings');
        const key = 'viescoHub_selfSyncPending';
        let revision = null, pending = null, busy = false, latest = null, connected = false, connecting = false;
        try { pending = JSON.parse(storage.getItem(key)); } catch (_) { /* Cache absent ou illisible. */ }
        if (pending && (!valid(pending.config) || !Number.isInteger(pending.revision))) pending = null;
        const persist = () => pending ? storage.setItem(key, JSON.stringify(pending)) : storage.removeItem(key);

        function receive(doc) {
            latest = doc;
            if (!doc || !valid(doc.config) || !Number.isInteger(doc.revision)) {
                status('Configuration partagée indisponible. Vos réglages locaux sont conservés.');
                return;
            }
            if (pending || busy || isEditing()) return;
            revision = doc.revision;
            applyConfig(copy(doc.config));
            status('Réglages synchronisés entre ordinateurs');
        }

        async function flush() {
            if (!pending || busy) return;
            busy = true;
            const sent = copy(pending);
            status('Enregistrement des réglages partagés…');
            try {
                await db.runTransaction(async transaction => {
                    const doc = await transaction.get(ref);
                    if (!doc.exists || doc.data().revision !== sent.revision) {
                        throw new Error('Conflit : des réglages ont changé sur un autre ordinateur. Exportez votre copie puis utilisez « Charger la version partagée » pour comparer.');
                    }
                    transaction.update(ref, { config: sent.config, revision: sent.revision + 1 });
                });
                revision = sent.revision + 1;
                if (JSON.stringify(pending.config) === JSON.stringify(sent.config)) pending = null;
                else pending.revision = revision;
                persist();
                status(pending ? 'Modifications suivantes en attente…' : 'Réglages synchronisés entre ordinateurs');
            } catch (error) {
                status(`${error.message} — Copie locale conservée ; cliquez sur Réessayer après une coupure réseau.`);
                busy = false;
                return;
            }
            busy = false;
            if (pending) flush();
            else if (latest && latest.revision > revision) receive(latest);
        }

        function publish() {
            const config = copy(getConfig());
            if (!valid(config)) { status('Configuration invalide : partage annulé.'); return; }
            if (revision === null && !pending) {
                pending = { config, revision: 0 };
                persist();
                status('Connexion non prête : copie locale conservée. Exportez-la avant de charger la version partagée.');
                return;
            }
            pending = { config, revision: pending ? pending.revision : revision };
            persist();
            flush();
        }

        async function connect() {
            if (connecting || connected) return;
            connecting = true;
            status('Connexion aux réglages partagés…');
            try {
                const seed = copy(getConfig());
                if (!valid(seed)) throw new Error('Configuration locale invalide');
                await db.runTransaction(async transaction => {
                    const doc = await transaction.get(ref);
                    if (!doc.exists) transaction.set(ref, { config: seed, revision: 1 });
                });
                connected = true;
                ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
                    if (snapshot.metadata.hasPendingWrites || snapshot.metadata.fromCache) return;
                    if (snapshot.exists) receive(snapshot.data());
                }, error => {
                    connected = false;
                    status(`Synchronisation indisponible : ${error.message}. Copie locale conservée.`);
                });
                if (pending) { applyConfig(copy(pending.config)); flush(); }
            } catch (error) {
                status(`Connexion impossible : ${error.message}. Le self reste utilisable localement.`);
            } finally {
                connecting = false;
            }
        }
        connect();
        return {
            publish,
            retry: () => !connected ? connect() : flush(),
            resume: () => { if (latest) receive(latest); },
            loadShared: () => {
                if (busy || !latest || !valid(latest.config)) return;
                pending = null; persist(); revision = latest.revision;
                applyConfig(copy(latest.config)); status('Version partagée chargée');
            }
        };
    }
    root.SelfSettingsSync = { start, valid };
})(typeof window === 'undefined' ? globalThis : window);
