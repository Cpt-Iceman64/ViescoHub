const assert = require('node:assert/strict');
const sync = require('../js/casiers-sync-logic.js');

function slot(numero, classe, eleve1, eleve2, estSolo = false, estMarge = false) {
    return { numero, classe, eleve1, eleve2, estSolo, estMarge };
}

{
    const server = [slot(1, '6e1', 'Serveur-A', 'Serveur-B'), slot(2, '6e1', 'Serveur-C', 'Serveur-D')];
    const local = [slot(1, '6e1', 'Local-A', 'Serveur-B'), slot(2, '6e1', 'Serveur-C', 'Serveur-D')];
    const merged = sync.mergeServerWithPending(server, local, { 1: { eleve1: true } });
    assert.equal(merged[0].eleve1, 'Local-A');
    assert.equal(merged[1].eleve1, 'Serveur-C');
}

{
    const initial = [slot(1, '6e1', 'Valeur-0', 'Autre-0')];
    const remoteDifferentField = [slot(1, '6e1', 'Valeur-0', 'Autre-1')];
    const remoteSameField = [slot(1, '6e1', 'Valeur-1', 'Autre-0')];
    const pending = { 1: { eleve1: true } };
    const snapshots = sync.snapshots(initial);

    assert.deepEqual(sync.findConflicts(remoteDifferentField, snapshots, pending), []);
    assert.deepEqual(sync.findConflicts(remoteSameField, snapshots, pending), [{ numero: '1', fields: ['eleve1'] }]);
}

{
    const server = [slot(1, '5e1', 'Valeur-0', 'Autre-0', false, false)];
    const local = [slot(1, '5e1', 'Valeur-1', 'Autre-0', false, true)];
    const updated = sync.applyPendingChanges(server, local, { 1: { eleve1: true } });
    assert.equal(updated[0].eleve1, 'Valeur-1');
    assert.equal(updated[0].estMarge, false);
}

{
    const snapshots = sync.snapshots([slot(1, '4e1', 'Valeur-0', 'Autre-0')]);
    const conflicts = sync.findConflicts([], snapshots, { 1: { eleve1: true } });
    assert.deepEqual(conflicts, [{ numero: '1', fields: ['structure'] }]);
}

{
    const reference = [slot(1, '3e1', 'Valeur-0', 'Autre-0')];
    const snapshots = sync.snapshots(reference);
    assert.equal(sync.matchesSnapshots(reference, snapshots), true);
    assert.equal(sync.matchesSnapshots([slot(1, '3e1', 'Valeur-1', 'Autre-0')], snapshots), false);
    assert.equal(sync.matchesSnapshots([], snapshots), false);
}

console.log('Casiers sync logic: 5 scenarios passed');
