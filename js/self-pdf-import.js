(() => {
 const panel=document.createElement('section'); panel.id='pdf-import'; panel.className='no-print';
 panel.innerHTML=`<h1>Comparer un emploi du temps PDF</h1><p>Le PDF est lu sur cet ordinateur. Seuls les réglages validés sont transmis à la synchronisation habituelle.</p><p>1. Choisir le PDF · 2. Vérifier et cocher les lignes · 3. Appliquer aux réglages du self</p><input id="pdf-file" type="file" accept="application/pdf,.pdf"><button id="pdf-export">Exporter mes réglages</button><button id="pdf-undo">Annuler le dernier import</button><p id="pdf-status" role="status">Format expérimental : emplois du temps de même présentation que le PDF fourni. Aucune proposition n’est cochée automatiquement.</p><div id="pdf-preview" hidden><p>Les horaires sont ceux des cours, pas les heures de passage au self. A = SA, B = SB. Les groupes restent indépendants ; vérifier leur correspondance avant de cocher. Le mercredi est affiché à titre informatif.</p><button id="pdf-apply">Appliquer les lignes cochées</button><div class="pdf-scroll"><table><thead><tr><th>Choix</th><th>Classe / groupe</th><th>Jour / semaine</th><th>Actuel fin / reprise</th><th>Nouvelle fin</th><th>Nouvelle reprise</th><th>Vérification / source</th></tr></thead><tbody id="pdf-rows"></tbody></table></div><details><summary>Voir une page du PDF</summary><select id="pdf-page"></select><canvas id="pdf-canvas"></canvas></details></div>`;
 document.getElementById('selfPdfMount').append(panel);
 const $=id=>document.getElementById(id); let rows=[],doc,base='',lib;
 const tableState=()=>JSON.stringify([...document.querySelectorAll('#settingsTableBody select')].map(s=>[s.id,s.value]));
 let renderedTable='',analysisTable='';
 const fingerprint=()=>JSON.stringify({classes:allClasses,settings:scheduleSettings});
 const status=message=>{$('pdf-status').textContent=message;};
 const elt=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const timeInput=value=>{const n=elt('input');n.type='time';n.value=value.replace('h',':');return n;};
 const validName=s=>/^[3-6]°\d+(?: [A-Za-zÀ-ÿ0-9 -]+)?$/.test(s);

 $('pdf-export').onclick=()=>exportSettings();
 function persist(){localStorage.setItem('viescoHub_allClasses',JSON.stringify(allClasses));localStorage.setItem('viescoHub_selfSettings',JSON.stringify(scheduleSettings));clearManualPlanning();autoGenerate();renderSettingsTable();shareSelfSettings();}
 $('pdf-undo').onclick=()=>{const raw=localStorage.getItem('viescoHub_backup');if(!raw){status('Aucun import à annuler.');return;}if(!confirm('Restaurer les réglages et placements précédant le dernier import ? Les réglages restaurés seront aussi partagés par la synchronisation habituelle.'))return;const b=JSON.parse(raw);allClasses=b.classes;scheduleSettings=b.settings;persist();manualPlanningByContext=b.manual;localStorage.setItem(manualPlanningStorageKey,JSON.stringify(b.manual));updateDayHeader();$('pdf-preview').hidden=true;status('Réglages et placements précédents restaurés.');};
 $('pdf-file').onchange=async e=>{
  $('pdf-preview').hidden=true;$('pdf-rows').replaceChildren();rows=[];const file=e.target.files[0];if(!file)return;
  if(renderedTable && tableState()!==renderedTable){status('Enregistre les modifications des paramètres avant d’importer le PDF.');e.target.value='';return;}
  analysisTable=tableState();e.target.disabled=true;
  try {
   if(file.size>30*1024*1024)throw Error('PDF trop volumineux (maximum 30 Mo).');
   status('Lecture du PDF en cours…');
   if(!lib){if(!window.SelfPdfEngine){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('../js/vendor/self-pdf-engine.js',location.href).href;script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('Moteur PDF indisponible. Réessaie après avoir vérifié la connexion.'));};document.head.append(script);});}lib=await SelfPdfEngine.load();}
   if(doc)await doc.destroy();doc=await lib.getDocument({data:await file.arrayBuffer(),useSystemFonts:true,isEvalSupported:false}).promise;
   if(doc.numPages>30)throw Error('Maximum 30 pages pour cet import.');
   for(let p=1;p<=doc.numPages;p++){status(`Analyse de la page ${p}/${doc.numPages}…`);rows.push(...await SelfPdfParser.extract(await doc.getPage(p),lib));}
   if(rows.some(r=>!validName(r.name)))throw Error('Un nom de classe ou groupe n’est pas reconnu. Aucun changement appliqué.');
   base=fingerprint();const body=$('pdf-rows');
   rows.forEach(r=>{const tr=elt('tr'),check=elt('input');tr.dataset.parent=r.parent;check.type='checkbox';check.disabled=r.day==='MERCREDI';r.check=check;let td=elt('td');td.append(check);tr.append(td);
    td=elt('td');const name=elt('select');const names=[...new Set([r.name,...allClasses.filter(c=>c.name.startsWith(r.parent)).map(c=>c.name)])];names.forEach(s=>name.add(new Option(s,s)));r.nameInput=name;td.append(name);tr.append(td);tr.append(elt('td',`${r.day} · ${r.week}`));
    const old=elt('td');const refresh=()=>{const s=scheduleSettings[name.value]?.[r.day]?.[r.week];old.textContent=s?`${s.fin||'—'} / ${s.reprise||'—'}`:'Non configuré';};name.onchange=refresh;refresh();tr.append(old);
    r.finInput=timeInput(r.fin);r.repInput=timeInput(r.reprise);[r.finInput,r.repInput].forEach(n=>{td=elt('td');td.append(n);tr.append(td);});
    td=elt('td');td.append(elt('p',r.warnings.join(' ')||'Vérifier les horaires avant de cocher.'));const detail=elt('details'),sum=elt('summary',`Source · page ${r.page}`);detail.append(sum,elt('pre',r.evidence||'Aucun cours proche de midi reconnu.'));td.append(detail);tr.append(td);body.append(tr);
   });
   $('pdf-page').replaceChildren();for(let p=1;p<=doc.numPages;p++)$('pdf-page').add(new Option(`Page ${p}`,p));$('pdf-preview').hidden=false;status(`${doc.numPages} pages analysées · ${new Set(rows.map(r=>r.parent)).size} classes · ${rows.length} propositions. Rien n’a été modifié. Coche uniquement les lignes vérifiées.`);await showPage();
  }catch(err){rows=[];$('pdf-preview').hidden=true;status(`Import interrompu : ${err.message}. Les réglages sont inchangés.`);}finally{e.target.disabled=false;}
 };
 async function showPage(){try{const page=await doc.getPage(Number($('pdf-page').value));const viewport=page.getViewport({scale:1.4}),canvas=$('pdf-canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;}catch(e){status('Aperçu indisponible : '+e.message);}}
 $('pdf-page').onchange=showPage;
 const filter=elt('select');filter.id='pdf-filter';filter.add(new Option('Toutes les classes',''));for(const level of [3,4,5,6])for(const n of [1,2,3])filter.add(new Option(`${level}°${n}`,`${level}°${n}`));filter.setAttribute('aria-label','Filtrer les propositions par classe');filter.onchange=()=>document.querySelectorAll('#pdf-rows tr').forEach(tr=>tr.hidden=!!filter.value&&tr.dataset.parent!==filter.value);$('pdf-apply').after(filter);
 $('pdf-apply').onclick=()=>{
  if(base!==fingerprint()||analysisTable!==tableState()){status('Les réglages ont changé depuis l’analyse. Réimporte le PDF avant d’appliquer.');return;}
   const chosen=rows.filter(r=>r.check.checked&&!r.check.disabled);if(!chosen.length){status('Coche au moins une différence à corriger.');return;}
  const keys=new Set();for(const r of chosen){const key=[r.nameInput.value,r.day,r.week].join('|');if(keys.has(key)){status('Deux lignes ciblent le même groupe, jour et semaine : garde une seule proposition.');return;}keys.add(key);const f=r.finInput.value,p=r.repInput.value;if(!f||!p||f<'11:00'||f>'12:00'||p<'13:00'||p>'17:00'){status('Renseigne pour chaque ligne cochée une fin entre 11h00 et 12h00 et une reprise entre 13h00 et 17h00.');return;}}
  if(!confirm(`Appliquer ${chosen.length} lignes aux réglages du self et les partager via la synchronisation habituelle ? Les autres réglages seront conservés. Les placements manuels seront recalculés.`))return;
  localStorage.setItem('viescoHub_backup',JSON.stringify({classes:allClasses,settings:scheduleSettings,manual:manualPlanningByContext}));
  for(const r of chosen){const name=r.nameInput.value;if(!allClasses.some(c=>c.name===name))allClasses.push({name,lvl:name[0]});scheduleSettings[name]??={};scheduleSettings[name][r.day]??={A:{},B:{}};scheduleSettings[name][r.day][r.week]={...scheduleSettings[name][r.day][r.week],fin:r.finInput.value.replace(':','h'),reprise:r.repInput.value.replace(':','h')};}
  persist();$('pdf-preview').hidden=true;status(`${chosen.length} lignes enregistrées. Synchronisation habituelle sollicitée : consulte son état sur la page. Tu peux annuler le dernier import.`);
 };
 // Vue centrée sur les écarts : les ambiguïtés ne sont pas des erreurs avérées.
 panel.querySelectorAll(':scope > p')[1].textContent='1. Importer le PDF · 2. Voir les différences · 3. Choisir les corrections';
 $('pdf-status').textContent='Compare le PDF aux réglages du self. Les horaires identiques seront masqués. Aucun changement automatique. Lecture adaptée à la présentation du PDF fourni, pas aux documents scannés.';
 $('pdf-preview').querySelector('p').textContent='Comparaison avec les réglages actuellement chargés dans le self. Les différences lisibles sont séparées des lectures incertaines. Le mercredi est exclu des corrections. Aucun groupe existant n’est supprimé sur la seule base de son absence du PDF.';
 const mode=elt('select');mode.id='pdf-view';mode.setAttribute('aria-label','Type de résultat');
 [['changes','Différences uniquement'],['uncertain','Lectures incertaines'],['same','Horaires identiques'],['all','Tout afficher']].forEach(([v,t])=>mode.add(new Option(t,v)));
 const overview=elt('p');overview.id='pdf-summary';const empty=elt('p');empty.id='pdf-empty';
 filter.after(mode);$('pdf-preview').prepend(overview);document.querySelector('.pdf-scroll').before(empty);
 const labels={changed:'Horaire différent',missing:'Configuration manquante',uncertain:'Lecture incertaine — pas une erreur confirmée',same:'Horaires identiques',excluded:'Mercredi — hors comparaison'};
 function classify(r){
  const old=scheduleSettings[r.nameInput.value]?.[r.day]?.[r.week];
  const changes=[];for(const [k,title] of [['fin','Fin'],['reprise','Reprise']])if(r[k]&&r[k]!==old?.[k])changes.push(`${title} : ${old?.[k]||'non configurée'} → ${r[k]}`);
  let kind;
  if(r.day==='MERCREDI')kind='excluded';
  else if(r.fin&&r.reprise&&old?.fin===r.fin&&old?.reprise===r.reprise)kind='same';
  else if(!r.fin||!r.reprise||r.warnings.length)kind='uncertain';
  else if(!old||!allClasses.some(c=>c.name===r.nameInput.value))kind='missing';
  else kind='changed';
  r.kind=kind;r.tr.dataset.kind=kind;
  r.description.textContent=labels[kind]+(changes.length?' · '+changes.join(' ; '):'')+(kind==='uncertain'?' · '+r.warnings.join(' '):'');
  r.description.style.color=kind==='same'?'#86efac':kind==='uncertain'?'#fcd34d':'#67e8f9';
  r.check.disabled=kind==='same'||kind==='excluded';if(r.check.disabled)r.check.checked=false;
 }
 function filterResults(){
  const counts={changed:0,missing:0,uncertain:0,same:0,excluded:0};let visible=0;
  for(const r of rows){if(!r.tr)continue;counts[r.kind]++;const show=(!filter.value||r.parent===filter.value)&&(mode.value==='all'||mode.value==='changes'&&['changed','missing'].includes(r.kind)||mode.value===r.kind);r.tr.hidden=!show;if(show)visible++;}
  overview.textContent=`${counts.changed} horaires différents · ${counts.missing} configurations manquantes · ${counts.uncertain} lectures incertaines · ${counts.same} horaires identiques masqués · ${counts.excluded} lignes du mercredi exclues. Comptage par jour et semaine A/B.`;
  empty.textContent=visible?`${visible} lignes affichées.`:mode.value==='changes'?'Aucune différence certaine dans cette sélection. Consulte les lectures incertaines avant de conclure que tout concorde.':'Aucune ligne dans cette sélection.';
 }
 filter.onchange=filterResults;mode.onchange=filterResults;
 const parseFile=$('pdf-file').onchange;
 $('pdf-file').onchange=async e=>{await parseFile(e);if($('pdf-preview').hidden)return;
  filter.value='';mode.value='changes';
  const trs=[...$('pdf-rows').children];rows.forEach((r,i)=>{r.tr=trs[i];r.description=r.tr.lastElementChild.querySelector('p');classify(r);const previous=r.nameInput.onchange;r.nameInput.onchange=()=>{previous();classify(r);filterResults();};});
  filterResults();status('Analyse terminée. Seules les différences sont affichées. Les lectures incertaines sont accessibles dans le filtre ; rien n’a été modifié.');
 };
 // Préserver les heures exactes importées lorsque les réglages sont ouverts.
 const original=renderSettingsTable;renderSettingsTable=function(){original();document.querySelectorAll('select[data-class][data-week][data-type]').forEach(s=>{const v=scheduleSettings[s.dataset.class]?.[s.dataset.day]?.[s.dataset.week]?.[s.dataset.type];if(v&&![...s.options].some(o=>o.value===v))s.add(new Option(v,v));if(v)s.value=v;});renderedTable=tableState();};
})();
