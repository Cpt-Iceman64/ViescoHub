const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../outils/sanctions-retenues.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];

function parse(raw) {
    const elements = { input: { value: raw }, output: { innerHTML: '' } };
    const context = vm.createContext({
        document: { getElementById: id => elements[id] || null },
        setInterval: () => {},
        records: []
    });
    vm.runInContext(script, context);
    vm.runInContext('renderHalfDay = rows => { records.push(...rows); return ""; }; processData();', context);
    return JSON.parse(JSON.stringify(context.records));
}

// Données entièrement fictives : exécuter le vrai parseur de la page.
for (const duration of ['1h00', '2h00', '3h00', '1h30']) {
    const rows = parse(`4 1\tELEVE TEST\tRetenue\tMotif fictif\t${duration}\t18/09/2026\t14h50`);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].duree, duration);
    assert.equal(rows[0].heure, '14h50');
    assert.equal(rows[0].dateStr, '18/09/2026');
}

const fallback = parse('4 1\tELEVE TEST\tRetenue\tMotif fictif\t18/09/2026\t14h50\t16h50');
assert.equal(fallback[0].duree, '1h00');
const invalid = parse('4 1\tELEVE TEST\tRetenue\tMotif fictif\t2h99\t18/09/2026\t14h50');
assert.equal(invalid[0].duree, '1h00');

const continuation = parse('4 1\tELEVE TEST\tRetenue\tMotif fictif\t2h00\n\t\t18/09/2026\t14h50');
assert.equal(continuation.length, 1);
assert.equal(continuation[0].duree, '2h00');

const successive = parse('4 1\tELEVE TEST A\tRetenue\tMotif fictif\t2h00\t18/09/2026\t14h50\n4 1\tELEVE TEST B\tRetenue\tMotif fictif\t18/09/2026\t10h00');
assert.equal(successive.find(row => row.nom === 'ELEVE TEST B').duree, '1h00');
assert.equal(successive.length, 2);
assert.equal(parse('4 1\tELEVE TEST\tRetenue\tReportée\t2h00\t18/09/2026\t14h50').length, 0);
console.log('Retenues : 9 scénarios validés.');
