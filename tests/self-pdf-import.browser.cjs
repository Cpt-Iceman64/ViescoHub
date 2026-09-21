// Usage: node tests/self-pdf-import.browser.cjs /path/to/playwright /path/to/EmploiDuTemps.pdf [screenshot.png]
// Isolated browser, Firebase blocked: never reads or changes the shared database.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
 const browser = await chromium.launch({ headless: true, channel: 'msedge' });
 try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.route(/firebase|firestore|googleapis\.com/, route => route.abort());
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(pathToFileURL(path.resolve(__dirname, '../outils/passage-self.html')).href);
  assert.equal(await page.locator('#pdf-file').isVisible(), false);
  assert.equal(await page.evaluate(() => !!window.SelfPdfEngine), false);
  await page.evaluate(() => { window.publishCount=0;settingsSync={publish(){window.publishCount++;},resume(){}};openSettingsModal(); });
  assert.equal(await page.locator('#pdf-file').isVisible(), false);
  await page.locator('#selfPdfSettings summary').first().click();
  assert.equal(await page.locator('#pdf-file').isVisible(), true);
  const before = await page.evaluate(() => JSON.stringify(scheduleSettings));
  await page.locator('#pdf-file').setInputFiles(process.argv[3]);
  await page.waitForFunction(() => document.getElementById('pdf-summary').textContent.length > 0, null, {timeout:60000});
  assert.equal(await page.evaluate(() => JSON.stringify(scheduleSettings)), before);
  assert.equal(await page.evaluate(() => publishCount), 0);
  assert.deepEqual(await page.locator('#pdf-rows tr:visible').evaluateAll(rs=>[...new Set(rs.map(r=>r.dataset.kind))]), ['changed']);
  console.log(await page.locator('#pdf-summary').innerText());
  if (process.argv[4]) await page.screenshot({path:process.argv[4]});
  await page.locator('#pdf-rows tr:visible').first().locator('input[type=checkbox]').check();
  // Unsaved edits cannot be overwritten by an import.
  const select=page.locator('#settingsTableBody select').first();const original=await select.inputValue();
  await select.selectOption('11h30');await page.locator('#pdf-apply').click();
  assert.match(await page.locator('#pdf-status').innerText(),/changé/);
  assert.equal(await page.evaluate(() => publishCount), 0);
  await select.selectOption(original);await page.locator('#pdf-apply').click();
  assert.equal(await page.evaluate(() => publishCount), 1);
  assert.equal(await page.evaluate(() => scheduleSettings['3°1'].LUNDI.A.reprise), '13h55');
  assert.equal(await page.locator('[data-class="3°1"][data-day="LUNDI"][data-week="A"][data-type="reprise"]').inputValue(), '13h55');
  await page.locator('#pdf-undo').click();
  assert.equal(await page.evaluate(() => publishCount), 2);
  assert.equal(await page.evaluate(() => JSON.stringify(scheduleSettings)), before);
  await page.locator('#pdf-file').setInputFiles({name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('invalid')});
  await page.waitForFunction(() => !document.getElementById('pdf-file').disabled);
  assert.match(await page.locator('#pdf-status').innerText(),/interrompu/);
  assert.equal(await page.evaluate(() => publishCount), 2);
  assert.deepEqual(errors, []);
  console.log('PDF integration: discreet settings, real PDF, differences, no auto-write, stale edits, apply, exact times, undo, invalid PDF passed.');
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
