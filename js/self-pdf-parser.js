(function(root) {
    const days = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI'];
    const minute = s => { const [h,m] = s.split('h').map(Number); return h*60+m; };
    const hour = m => `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    const isDayHeader = (value, day) => new RegExp(`^${day}(?:\\s+\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?)?$`).test(norm(value).replace(/\s+/g,' ').trim());
    const appWeekNumber = value => {
        const date=new Date(Date.UTC(value.getFullYear(),value.getMonth(),value.getDate()));
        date.setUTCDate(date.getUTCDate()+4-(date.getUTCDay()||7));
        const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1));
        return Math.ceil((((date-yearStart)/86400000)+1)/7);
    };
    function datedPeriod(headers, texts) {
        const first=headers[0]?.s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
        if(!first || !headers.every(h=>/\d{1,2}\/\d{1,2}/.test(h?.s||'')))return null;
        const printed=texts.map(t=>t.s).join(' ').match(/\b\d{1,2}\/\d{1,2}\/(\d{4})\b/);
        let year=Number(first[3]||printed?.[1]||new Date().getFullYear());
        if(year<100)year+=2000;
        const dates=headers.map((header,index)=>{
            const match=header.s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
            let itemYear=Number(match[3]||year);if(itemYear<100)itemYear+=2000;
            if(index && Number(match[2])<Number(first[2]))itemYear++;
            return new Date(itemYear,Number(match[2])-1,Number(match[1]));
        });
        const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        return {start:iso(dates[0]),end:iso(dates.at(-1)),weekType:appWeekNumber(dates[0])%2===0?'A':'B'};
    }
    const datedWeekType = (headers,texts) => datedPeriod(headers,texts)?.weekType||null;
    function groupOf(text, name) {
        if (/CHAM/.test(text)) return `${name} CHAM`;
        if (/LATIN/.test(text)) return `${name} Latin`;
        if (/DEVOIRS[. ]?FAITS/.test(text)) return `${name} Devoirs faits`;
        const code = text.match(/\[([^\]]+)\]/)?.[1];
        if (!code || /CLASSE|MATHS/.test(code)) return null;
        const language = text.match(/(ANGLAIS|ESPAGNOL)\s*LV\s*([12])/);
        if (language) return `${name} ${language[1]==='ANGLAIS'?'Ang':'Esp'} LV${language[2]}`;
        return `${name} Groupe ${code.replace(/[^A-Z0-9 -]/g,'').slice(0,24)}`;
    }
    async function extract(page, pdfjs) {
        const viewport = page.getViewport({scale:1});
        const content = await page.getTextContent();
        const seen = new Set();
        const texts = content.items.filter(i=>i.str?.trim()).map(i=> {
            const t=pdfjs.Util.transform(viewport.transform,i.transform);
            return {s:i.str.trim(),x:t[4],y:t[5],w:i.width,h:i.height};
        }).filter(i=>{const key=`${i.s}:${i.x.toFixed(1)}:${i.y.toFixed(1)}`;if(seen.has(key))return false;seen.add(key);return true;});
        const op=await page.getOperatorList(), rects=[];
        let matrix=[1,0,0,1,0,0],color='#000000';const stack=[];
        op.fnArray.forEach((fn,i)=>{
            const a=op.argsArray[i], O=pdfjs.OPS;
            if(fn===O.save) stack.push({matrix:[...matrix],color});
            else if(fn===O.restore) {const saved=stack.pop();if(saved){matrix=saved.matrix;color=saved.color;}}
            else if(fn===O.transform) matrix=pdfjs.Util.transform(matrix,a);
            else if(fn===O.setFillRGBColor) color=a[0];
            else if(fn===O.constructPath && [O.fill,O.eoFill,O.fillStroke,O.eoFillStroke].includes(a[0]) && a[2]) {
                // PDF.js 5.6 : bounding box des tracés. On n'accepte que les rectangles.
                const path=a[1]?.[0];
                if(!path || path.length!==13 || path[0]!==0 || path[3]!==1 || path[6]!==1 || path[9]!==1 || path[12]!==4)return;
                const m=pdfjs.Util.transform(viewport.transform,matrix),b=a[2];
                const p=[b[0],b[1]],q=[b[2],b[3]];
                pdfjs.Util.applyTransform(p,m);pdfjs.Util.applyTransform(q,m);
                const r={x:Math.min(p[0],q[0]),y:Math.min(p[1],q[1]),w:Math.abs(q[0]-p[0]),h:Math.abs(q[1]-p[1]),color};
                if(color!=='#ffffff'&&color!=='#000000'&&r.w>12&&r.h>5)rects.push(r);
            }
        });
        const titles=texts.filter(t=>/^[3-6]\s+[1-9]\d?$/.test(t.s)&&t.h>9).sort((a,b)=>a.y-b.y);
        const result=[];
        for(let ti=0;ti<titles.length;ti++) {
            const title=titles[ti],end=titles[ti+1]?.y||viewport.height;
            const name=title.s.replace(/\s+/,'°');
            const labels=texts.filter(t=>t.y>title.y&&t.y<end);
            // Pronote exporte soit « lundi », soit « lundi 21/09 » dans la vue
            // hebdomadaire. La date ne change pas la géométrie de la colonne.
            const heads=days.map(d=>labels.find(t=>isDayHeader(t.s,d)));
            if(heads.some(x=>!x))throw new Error(`Page ${page.pageNumber} : colonnes de ${name} non reconnues.`);
            const period=datedPeriod(heads,texts),datedWeek=period?.weekType||null;
            const centers=heads.map(t=>t.x+t.w/2),step=(centers[4]-centers[0])/4,left=centers[0]-step/2;
            const timeLabels=labels.filter(t=>t.x<left && /^(8h05|9h00|10h10|11h05|11h30|12h00|13h00|13h55|14h50|16h05)$/.test(t.s));
            if(timeLabels.length!==10) throw new Error(`Page ${page.pageNumber} : échelle horaire de ${name} non reconnue.`);
            const anchors=timeLabels.map(t=>({y:t.y-t.h*0.96,time:minute(t.s)})).sort((a,b)=>a.y-b.y);
            const getTime=y=>{
                const nearest=anchors.reduce((a,b)=>Math.abs(a.y-y)<Math.abs(b.y-y)?a:b);
                if(Math.abs(nearest.y-y)<1.4)return nearest.time;
                const lo=[...anchors].reverse().find(a=>a.y<y),hi=anchors.find(a=>a.y>y);
                if(!lo||!hi)return null;
                return Math.round((lo.time+(y-lo.y)/(hi.y-lo.y)*(hi.time-lo.time))/5)*5;
            };
            const blocks=rects.filter(r=>r.y>title.y&&r.y+r.h<end&&r.x>=left-2).map(r=>{
                const inside=labels.filter(t=>t.x+t.w/2>=r.x-0.6&&t.x+t.w/2<=r.x+r.w+0.6&&t.y-t.h/2>=r.y&&t.y-t.h/2<=r.y+r.h);
                const text=inside.map(t=>t.s).join(' '), upper=norm(text);
                const week=inside.some(t=>t.s==='SA')?'A':inside.some(t=>t.s==='SB')?'B':null;
                return {...r,text,week,group:groupOf(upper,name),start:getTime(r.y),end:getTime(r.y+r.h)};
            }).filter(b=>b.text && b.start!==null && b.start<900);
            for(let di=0;di<days.length;di++) {
                // Un bloc peut s'étendre sur deux jours : le traiter dans chacun.
                const dayBlocks=blocks.filter(b=>b.x<left+(di+1)*step-2&&b.x+b.w>left+di*step+2);
                for(const week of datedWeek?[datedWeek]:['A','B']) {
                    // Une vue datée contient déjà uniquement les cours de la semaine
                    // affichée. Les mentions SA/SB internes ne doivent pas la dupliquer.
                    const active=datedWeek?dayBlocks:dayBlocks.filter(b=>!b.week||b.week===week);
                    const relevant=active.filter(b=>(b.start<720&&b.end>600)||(b.start>=780&&b.start<=895));
                    const groups=[...new Set(relevant.map(b=>b.group).filter(Boolean))];
                    for(const group of [null,...groups]) {
                        const own=active.filter(b=>!b.group || b.group===group);
                        const morning=own.filter(b=>b.start<720&&b.end!==null);
                        const afternoon=own.filter(b=>b.start>=780);
                        const fin=morning.length?Math.max(...morning.map(b=>b.end)):null;
                        const reprise=afternoon.length?Math.min(...afternoon.map(b=>b.start)):null;
                        const warnings=[];
                        if (own.some(b=>!anchors.some(a=>a.time===b.start))) warnings.push('Horaire intermédiaire estimé : vérifier sur le PDF.');
                        if(groups.length)warnings.push(group?'Groupe : vérifier les élèves concernés et les cours communs.':'Groupes présents : proposition pour le reste de la classe à vérifier.');
                        if(fin===null||fin<660||fin>720)warnings.push('Fin de matinée non déterminée dans la plage du self.');
                        if(reprise===null&&days[di]!=='MERCREDI')warnings.push('Reprise non déterminée : conserver ou préciser l’horaire.');
                        if(days[di]==='MERCREDI')warnings.push('Mercredi : lecture seule, hors des jours gérés par le self.');
                        const evidence=relevant.filter(b=>!b.group||!group||b.group===group).map(b=>`${hour(b.start)}${b.end?'–'+hour(b.end):''} : ${b.text}`).join('\n');
                        result.push({name:group||name,parent:name,day:days[di],week,fin:fin>=660&&fin<=720?hour(fin):'',reprise:reprise!==null?hour(reprise):'',warnings,evidence,page:page.pageNumber,periodStart:period?.start||null,periodEnd:period?.end||null});
                    }
                }
            }
        }
        if(!titles.length)throw new Error(`Page ${page.pageNumber} : aucun tableau de classe reconnu. PDF scanné ou présentation non prise en charge.`);
        return result;
    }
    root.SelfPdfParser={extract,minute,hour,isDayHeader,appWeekNumber,datedPeriod,datedWeekType};
})(globalThis);
