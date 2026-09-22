const assert = require('node:assert/strict');
require('../js/self-pdf-parser.js');

const { isDayHeader } = globalThis.SelfPdfParser;

assert.equal(isDayHeader('lundi', 'LUNDI'), true);
assert.equal(isDayHeader('lundi 21/09', 'LUNDI'), true);
assert.equal(isDayHeader('MARDI 22/09/2026', 'MARDI'), true);
assert.equal(isDayHeader('  mercredi   23/09  ', 'MERCREDI'), true);
assert.equal(isDayHeader('lundi prochain', 'LUNDI'), false);
assert.equal(isDayHeader('mardi 22/09', 'LUNDI'), false);

console.log('PDF parser: en-têtes permanents et hebdomadaires reconnus.');
