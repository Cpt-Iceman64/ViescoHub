const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../outils/passage-self.html'), 'utf8');
// Exécuter le rendu et les commandes réels avec un DOM minimal, sans données élèves.
const code = html.slice(html.indexOf('function renderSlots()'), html.indexOf('// --- LOGIQUE DE PARAMÉTRAGE'));
class Element {
    constructor() { this.children = []; this.dataset = {}; this.style = {}; }
    set innerHTML(value) { this.markup = value; this.children = []; }
    get innerHTML() { return this.markup || ''; }
    appendChild(child) { this.children.push(child); }
    addEventListener() {}
}
const elements = {
    slotsContainer: new Element(), validationBanner: new Element(),
    daySelector: { value: 'JEUDI' }
};
const context = vm.createContext({
    document: { getElementById: id => elements[id], createElement: () => new Element() },
    planningData: [
        { id: 'slot1', time: '11h30', classes: ['4°1 CHAM'] },
        { id: 'slot2', time: '12h00', classes: ['4°1', 'SEPARATOR', '4°1 ULIS'] }
    ],
    allClasses: ['4°1', '4°1 CHAM', '4°1 ULIS'].map(name => ({ name, lvl: '4' })),
    scheduleSettings: {}, saves: 0
});
vm.runInContext('function saveManualPlanning() { saves++; }\n' + code, context);
function visibleNames(mode) {
    return elements.slotsContainer.children.flatMap(card =>
        card.children.filter(area => area.className.startsWith(mode)).flatMap(area =>
            area.children.map(tag => tag.innerHTML)
        )
    ).join('\n');
}
function check(names) {
    for (const mode of ['edit-mode-only', 'print-mode-only']) {
        const rendered = visibleNames(mode);
        for (const name of names) assert.ok(rendered.includes(`>${name}</span>`), `${mode}: ${name} visible`);
    }
}
context.renderSlots();
check(['4°1', '4°1 CHAM', '4°1 ULIS']);
context.moveClass('slot1', 0, 'slot2', 0);
check(['4°1', '4°1 CHAM', '4°1 ULIS']);
context.removeClass('slot2', 1); // Retirer la classe ne retire pas ses groupes.
check(['4°1 CHAM', '4°1 ULIS']);
assert.equal(context.planningData[1].classes.includes('4°1'), false);
context.addClass('slot2', '4°1');
check(['4°1', '4°1 CHAM', '4°1 ULIS']);
context.removeClass('slot2', 0); // Retirer CHAM ne retire pas la classe.
check(['4°1', '4°1 ULIS']);
assert.equal(context.planningData[1].classes.includes('4°1 CHAM'), false);
assert.equal(context.saves, 4);
console.log('Groupes self : affichage écran/impression, déplacement, ajout et suppressions indépendants validés.');
