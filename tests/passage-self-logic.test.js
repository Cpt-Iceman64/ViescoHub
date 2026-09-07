const assert = require('node:assert/strict');
const { clonePlanning, generate, getRotationWeekNumber, isValidPlanning } = require('../js/passage-self-logic.js');

const classes = [
    { name: '6°1', lvl: '6' },
    { name: '6°2', lvl: '6' },
    { name: '5°1', lvl: '5' },
    { name: '5°2', lvl: '5' },
    { name: '4°1', lvl: '4' },
    { name: 'Atelier Nature', lvl: 'club' }
];

function schedules(after13Classes, weekType = 'A') {
    const result = {};
    classes.forEach((classInfo) => {
        result[classInfo.name] = {
            LUNDI: { A: {}, B: {} },
            MARDI: { A: {}, B: {} },
            JEUDI: { A: {}, B: {} },
            VENDREDI: { A: {}, B: {} }
        };
    });
    after13Classes.forEach((name) => {
        ['LUNDI', 'MARDI', 'JEUDI', 'VENDREDI'].forEach((day) => {
            result[name][day][weekType] = { reprise: '14h00' };
        });
    });
    return result;
}

function p4(result) {
    const slot2 = result.find((slot) => slot.id === 'slot2').classes;
    return slot2.slice(slot2.indexOf('SEPARATOR') + 1);
}

// Lundi et mardi : les 6e restent en tête, les autres classes tournent individuellement.
const mondaySettings = schedules(['6°1', '6°2', '5°1', '5°2', '4°1']);
assert.deepEqual(p4(generate({ classes, settings: mondaySettings, day: 'LUNDI', weekType: 'A', weekNumber: 1 })), ['6°1', '6°2', '5°2', '4°1', '5°1']);
assert.deepEqual(p4(generate({ classes, settings: mondaySettings, day: 'MARDI', weekType: 'A', weekNumber: 2 })), ['6°1', '6°2', '4°1', '5°1', '5°2']);

// La sélection manuelle A/B utilise bien la semaine correspondant au type choisi.
assert.equal(getRotationWeekNumber(10, 'A'), 10);
assert.equal(getRotationWeekNumber(10, 'B'), 11);
assert.equal(getRotationWeekNumber(11, 'B'), 11);
assert.equal(getRotationWeekNumber(11, 'A'), 12);

// Jeudi et vendredi : toutes les classes, 6e comprises, tournent individuellement sur quatre semaines.
const thursdayOrders = [1, 2, 3, 4].map((weekNumber) => p4(generate({ classes, settings: mondaySettings, day: 'JEUDI', weekType: 'A', weekNumber })));
assert.deepEqual(thursdayOrders, [
    ['6°2', '5°1', '5°2', '4°1', '6°1'],
    ['5°1', '5°2', '4°1', '6°1', '6°2'],
    ['5°2', '4°1', '6°1', '6°2', '5°1'],
    ['4°1', '6°1', '6°2', '5°1', '5°2']
]);
assert.deepEqual(p4(generate({ classes, settings: mondaySettings, day: 'VENDREDI', weekType: 'A', weekNumber: 1 })), thursdayOrders[0]);

// Une seule catégorie de niveau tourne aussi classe par classe.
const onlyFifthSettings = schedules(['5°1', '5°2']);
assert.deepEqual(p4(generate({ classes, settings: onlyFifthSettings, day: 'LUNDI', weekType: 'A', weekNumber: 1 })), ['5°2', '5°1']);

// Avec uniquement des 6e sous le séparateur, leur ordre reste prioritaire le lundi et le mardi.
const onlySixthSettings = schedules(['6°1', '6°2']);
assert.deepEqual(p4(generate({ classes, settings: onlySixthSettings, day: 'LUNDI', weekType: 'A', weekNumber: 1 })), ['6°1', '6°2']);
assert.deepEqual(p4(generate({ classes, settings: onlySixthSettings, day: 'MARDI', weekType: 'A', weekNumber: 2 })), ['6°1', '6°2']);

// Les horaires A et B sont indépendants et les classes à 13h restent au-dessus du séparateur.
const abSettings = schedules(['5°1'], 'B');
abSettings['Atelier Nature'].MARDI.A = { reprise: '13h00' };
assert.deepEqual(generate({ classes, settings: abSettings, day: 'MARDI', weekType: 'A', weekNumber: 1 })[1].classes, ['Atelier Nature']);
assert.deepEqual(p4(generate({ classes, settings: abSettings, day: 'MARDI', weekType: 'B', weekNumber: 1 })), ['5°1']);

const separatorSettings = schedules(['6°1', '5°1']);
separatorSettings['Atelier Nature'].MARDI.A = { reprise: '13h00' };
const weekOne = generate({ classes, settings: separatorSettings, day: 'MARDI', weekType: 'A', weekNumber: 1 })[1].classes;
const weekTwo = generate({ classes, settings: separatorSettings, day: 'MARDI', weekType: 'A', weekNumber: 2 })[1].classes;
assert.deepEqual(weekOne.slice(0, weekOne.indexOf('SEPARATOR')), ['Atelier Nature']);
assert.deepEqual(weekTwo.slice(0, weekTwo.indexOf('SEPARATOR')), ['Atelier Nature']);

// Une même classe ne peut pas être générée deux fois.
const duplicateClasses = [...classes, { name: '5°1', lvl: '5' }];
assert.deepEqual(p4(generate({ classes: duplicateClasses, settings: mondaySettings, day: 'LUNDI', weekType: 'A', weekNumber: 1 })).filter((name) => name === '5°1'), ['5°1']);

// Un déplacement manuel enregistré est isolé de son objet d'origine et ne peut pas contenir de doublon.
const manualPlanning = generate({ classes, settings: mondaySettings, day: 'LUNDI', weekType: 'A', weekNumber: 1 });
const copiedPlanning = clonePlanning(manualPlanning);
copiedPlanning[0].classes.push('Test');
assert.equal(manualPlanning[0].classes.includes('Test'), false);
assert.equal(isValidPlanning(manualPlanning), true);
assert.equal(isValidPlanning([{ id: 'slot1', classes: ['6°1'] }, { id: 'slot2', classes: ['6°1'] }]), false);

console.log('Passage self: 11 scénarios de rotation validés.');
