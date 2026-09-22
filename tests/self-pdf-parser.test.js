const assert = require('node:assert/strict');
require('../js/self-pdf-parser.js');

const { isDayHeader, appWeekNumber, datedWeekType } = globalThis.SelfPdfParser;

assert.equal(isDayHeader('lundi', 'LUNDI'), true);
assert.equal(isDayHeader('lundi 21/09', 'LUNDI'), true);
assert.equal(isDayHeader('MARDI 22/09/2026', 'MARDI'), true);
assert.equal(isDayHeader('  mercredi   23/09  ', 'MERCREDI'), true);
assert.equal(isDayHeader('lundi prochain', 'LUNDI'), false);
assert.equal(isDayHeader('mardi 22/09', 'LUNDI'), false);
assert.equal(appWeekNumber(new Date(2026, 8, 28)), 39);
assert.equal(datedWeekType(
    ['lundi 28/09','mardi 29/09','mercredi 30/09','jeudi 01/10','vendredi 02/10'].map(s=>({s})),
    [{s:'22/09/2026 14:38'}]
), 'B');
assert.equal(datedWeekType(
    ['lundi','mardi','mercredi','jeudi','vendredi'].map(s=>({s})),
    [{s:'22/09/2026 14:38'}]
), null);

console.log('PDF parser: en-têtes permanents et hebdomadaires reconnus.');
