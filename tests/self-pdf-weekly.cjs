// node tests/self-pdf-weekly.cjs /path/to/pdfjs-dist/legacy/build/pdf.mjs /path/to/weekly.pdf
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
require('../js/self-pdf-parser.js');
(async()=>{
 const pdf=await import(pathToFileURL(process.argv[2]).href);
 const doc=await pdf.getDocument({data:new Uint8Array(fs.readFileSync(process.argv[3])),useSystemFonts:true}).promise;
 const page=await doc.getPage(1);
 await assert.rejects(()=>SelfPdfParser.extract(page,pdf),/choisis la semaine/);
 let rows=[];
 for(let p=1;p<=doc.numPages;p++)rows.push(...await SelfPdfParser.extract(await doc.getPage(p),pdf,{weekType:'B'}));
 assert.equal(new Set(rows.map(r=>r.parent)).size,12);
 assert.ok(rows.every(r=>r.week==='B'&&r.dated&&r.date));
 const monday=rows.find(r=>r.name==='3°1'&&r.day==='LUNDI');
 assert.equal(monday.fin,'12h00');assert.equal(monday.reprise,'13h05');
 assert.equal(rows.find(r=>r.name==='3°1'&&r.day==='VENDREDI').fin,'11h05');
 // Simulate the undated grid vocabulary: still yields both A and B.
 const content=await page.getTextContent();
 const legacy={pageNumber:1,getViewport:x=>page.getViewport(x),getOperatorList:()=>page.getOperatorList(),getTextContent:async()=>({...content,items:content.items.map(i=>({...i,str:i.str.replace(/ \d{2}\/\d{2}$/,'').replace('13h05','13h00').replace('14h00','13h55').replace('14h55','14h50')}))})};
 const old=await SelfPdfParser.extract(legacy,pdf);
 assert.deepEqual([...new Set(old.map(r=>r.week))],['A','B']);
 console.log(`Weekly PDF: ${doc.numPages} pages, 12 classes, ${rows.length} rows; explicit A/B, dates, shifted headings and undated-grid compatibility passed.`);
 await doc.destroy();
})().catch(e=>{console.error(e);process.exitCode=1;});
