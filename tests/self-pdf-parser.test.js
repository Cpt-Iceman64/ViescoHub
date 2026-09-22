const assert = require('node:assert/strict');
require('../js/self-pdf-parser.js');

const { isDayHeader, appWeekNumber, datedPeriod, datedWeekType } = globalThis.SelfPdfParser;

assert.equal(isDayHeader('lundi', 'LUNDI'), true);
assert.equal(isDayHeader('lundi 21/09', 'LUNDI'), true);
assert.equal(isDayHeader('MARDI 22/09/2026', 'MARDI'), true);
assert.equal(isDayHeader('  mercredi   23/09  ', 'MERCREDI'), true);
assert.equal(isDayHeader('lundi prochain', 'LUNDI'), false);
assert.equal(isDayHeader('mardi 22/09', 'LUNDI'), false);
assert.equal(appWeekNumber(new Date(2026, 8, 28)), 40);
assert.equal(datedWeekType(
    ['lundi 28/09','mardi 29/09','mercredi 30/09','jeudi 01/10','vendredi 02/10'].map(s=>({s})),
    [{s:'22/09/2026 14:38'}]
), 'A');
assert.equal(datedWeekType(
    ['lundi','mardi','mercredi','jeudi','vendredi'].map(s=>({s})),
    [{s:'22/09/2026 14:38'}]
), null);
assert.deepEqual(datedPeriod(
    ['lundi 28/12','mardi 29/12','mercredi 30/12','jeudi 31/12','vendredi 01/01'].map(s=>({s})),
    [{s:'20/12/2026 14:38'}]
), {start:'2026-12-28',end:'2027-01-01',weekType:'B'});

console.log('PDF parser: en-têtes permanents et hebdomadaires reconnus.');
