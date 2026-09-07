(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.CasiersSyncLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const EDITABLE_FIELDS = ['eleve1', 'eleve2', 'estSolo', 'estMarge'];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function snapshots(casiers) {
        return asArray(casiers).reduce((result, casier) => {
            result[String(casier.numero)] = clone(casier);
            return result;
        }, {});
    }

    function matchesSnapshots(casiers, savedSnapshots) {
        const records = asArray(casiers);
        const savedKeys = Object.keys(savedSnapshots);
        if (records.length !== savedKeys.length) return false;
        return records.every(casier => {
            const saved = savedSnapshots[String(casier.numero)];
            return saved
                && casier.numero === saved.numero
                && casier.classe === saved.classe
                && casier.eleve1 === saved.eleve1
                && casier.eleve2 === saved.eleve2
                && casier.estSolo === saved.estSolo
                && casier.estMarge === saved.estMarge;
        });
    }

    function mergeServerWithPending(serverCasiers, localCasiers, pendingChanges) {
        const localByNumero = snapshots(localCasiers);
        const result = asArray(serverCasiers).map(casier => clone(casier));

        result.forEach(casier => {
            const numero = String(casier.numero);
            const pending = pendingChanges[numero];
            const local = localByNumero[numero];
            if (!pending || !local) return;
            EDITABLE_FIELDS.forEach(field => {
                if (pending[field]) casier[field] = local[field];
            });
        });

        return result;
    }

    function findConflicts(serverCasiers, savedSnapshots, pendingChanges) {
        const serverByNumero = snapshots(serverCasiers);
        const conflicts = [];

        Object.entries(pendingChanges).forEach(([numero, changes]) => {
            const server = serverByNumero[numero];
            const previous = savedSnapshots[numero];
            if (!server || !previous || server.classe !== previous.classe) {
                conflicts.push({ numero, fields: ['structure'] });
                return;
            }

            const fields = EDITABLE_FIELDS.filter(field => changes[field] && server[field] !== previous[field]);
            if (fields.length > 0) conflicts.push({ numero, fields });
        });

        return conflicts;
    }

    function applyPendingChanges(serverCasiers, localCasiers, pendingChanges) {
        const localByNumero = snapshots(localCasiers);
        return asArray(serverCasiers).map(server => {
            const updated = clone(server);
            const numero = String(updated.numero);
            const changes = pendingChanges[numero];
            const local = localByNumero[numero];
            if (!changes || !local) return updated;

            EDITABLE_FIELDS.forEach(field => {
                if (changes[field]) updated[field] = local[field];
            });
            return updated;
        });
    }

    return { EDITABLE_FIELDS, snapshots, matchesSnapshots, mergeServerWithPending, findConflicts, applyPendingChanges };
});
