const assert = require('node:assert/strict');
const { rebuild, SOLO_PLACEHOLDER } = require('../js/casiers-logic.js');

function slot(numero, classe, eleve1 = '', eleve2 = '', options = {}) {
    return {
        numero,
        classe,
        eleve1,
        eleve2,
        estSolo: Boolean(options.estSolo),
        estMarge: Boolean(options.estMarge)
    };
}

function namesFor(result, classe) {
    return result.casiers
        .filter(casier => casier.classe === classe)
        .flatMap(casier => [casier.eleve1, casier.eleve2])
        .filter(name => name && name !== SOLO_PLACEHOLDER)
        .sort();
}

{
    const result = rebuild([
        slot(1, '6e1', 'Test-A', 'Test-B'),
        slot(2, '6e1', 'Test-C', SOLO_PLACEHOLDER, { estSolo: true }),
        slot(3, '5e1', 'Test-D', 'Test-E')
    ], [
        { nomClasse: '5e1', effectif: 4 },
        { nomClasse: '6e1', effectif: 4 }
    ], 20, 1);

    assert.equal(result.ok, true);
    assert.deepEqual(namesFor(result, '6e1'), ['Test-A', 'Test-B', 'Test-C']);
    assert.deepEqual(namesFor(result, '5e1'), ['Test-D', 'Test-E']);
    assert.deepEqual(result.casiers.filter(casier => casier.classe === '6e1').map(casier => casier.numero), [4, 5, 6]);
}

{
    const result = rebuild([
        slot(1, '6e1', 'Test-A', 'Test-B'),
        slot(2, '6e1', 'Test-C', 'Test-D'),
        slot(3, '6e1', 'Test-E', 'Test-F')
    ], [{ nomClasse: '6e1', effectif: 4 }], 20, 0);

    assert.equal(result.ok, false);
    assert.match(result.message, /aucune donnée n’a été modifiée/i);
}

{
    const result = rebuild([
        slot(1, '4e1', 'Test-A', 'Test-B', { estMarge: true }),
        slot(2, '4e1', 'Test-C', SOLO_PLACEHOLDER, { estSolo: true })
    ], [{ nomClasse: '4e1', effectif: 6 }], 20, 1);

    assert.equal(result.ok, true);
    const migrated = result.casiers.filter(casier => casier.eleve1 === 'Test-A')[0];
    assert.equal(migrated.estMarge, true);
    assert.equal(result.casiers.filter(casier => casier.eleve1 === 'Test-C')[0].estSolo, true);
}

{
    const result = rebuild([], [{ nomClasse: '6e1', effectif: 3 }], 10, 1);
    assert.equal(result.ok, true);
    assert.equal(result.casiers.length, 3);
    assert.equal(result.casiers[1].eleve2, SOLO_PLACEHOLDER);
    assert.equal(result.casiers[1].estSolo, true);
}

{
    const result = rebuild([], [
        { nomClasse: '6e1', effectif: 2 },
        { nomClasse: '6e1', effectif: 2 }
    ], 10, 1);
    assert.equal(result.ok, false);
    assert.match(result.message, /plusieurs fois/);
}

console.log('Casiers logic: 5 scenarios passed');
