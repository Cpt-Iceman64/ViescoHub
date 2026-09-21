// Generate the vendored browser bundle from an installed pdfjs-dist 5.6.205.
// Usage: node scripts/build-self-pdf-engine.cjs /path/to/pdfjs-dist
const fs = require('node:fs');
const path = require('node:path');
const source = process.argv[2];
if (!source || JSON.parse(fs.readFileSync(path.join(source, 'package.json'))).version !== '5.6.205') {
    throw new Error('pdfjs-dist 5.6.205 is required.');
}
const read = file => fs.readFileSync(path.join(source, 'legacy/build', file)).toString('base64');
const output = path.join(__dirname, '../js/vendor');
fs.mkdirSync(output, { recursive: true });
const code = `// Generated from Mozilla PDF.js 5.6.205. Apache-2.0; see PDFJS-LICENSE.txt.
// Kept as a classic script to support both HTTPS and local file previews.
window.SelfPdfEngine = (() => {
 let promise;
 return { load() {
  if (!promise) promise = (async () => {
   const url = URL.createObjectURL(new Blob([atob('${read('pdf.min.mjs')}')], {type:'text/javascript'}));
   try {
    const api = await import(url);
    api.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([atob('${read('pdf.worker.min.mjs')}')], {type:'text/javascript'}));
    return api;
   } finally { URL.revokeObjectURL(url); }
  })().catch(error => { promise = null; throw error; });
  return promise;
 }};
})();
`;
fs.writeFileSync(path.join(output, 'self-pdf-engine.js'), code);
fs.copyFileSync(path.join(source, 'LICENSE'), path.join(output, 'PDFJS-LICENSE.txt'));
