import fs from 'node:fs/promises';
const origin='https://kyrgyzstan-nature-journey.iteachet-9750.chatgpt.site';
const checks=[];
for(const p of ['/ru/','/tr/','/assets/styles.css','/assets/site.js','/assets/photos/park-10-1920.webp']){
 const r=await fetch(origin+p,{redirect:'manual'});
 const record={path:p,status:r.status,type:r.headers.get('content-type')};
 if(p.endsWith('/')){
  const h=await r.text();record.correctLanguage=h.includes(p==='/ru/'?'lang="ru"':'lang="tr"');
  record.telegram=h.includes('https://t.me/TV1331');record.whatsapp=h.includes('wa.me/905393859164');
 }
 checks.push(record);
}
const report={anonymous:true,checks,passed:checks.every(c=>c.status===200&&c.correctLanguage!==false)};
await fs.writeFile('output/qa/public-check.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
