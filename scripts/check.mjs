import fs from 'node:fs/promises';
import path from 'node:path';
import {content,settings} from '../src/content.mjs';
import {basePath,siteRoot,outputDir} from '../src/site-config.mjs';
const problems=[];let localLinks=0,images=0;
async function checkLocal(file,url){
 if(!url.startsWith('/')||url.startsWith('//'))return;
 if(basePath&&!url.startsWith(basePath+'/')){problems.push(file+': missing base path '+url);return;}
 let dest=path.join(outputDir,url.slice(basePath.length).split(/[?#]/)[0]);
 if(url.split(/[?#]/)[0].endsWith('/'))dest=path.join(dest,'index.html');
 try{await fs.access(dest);localLinks++;}catch{problems.push(file+': missing '+url);}
}
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
async function checkLinks(file,html){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const url=decode(m[1]);if(url.startsWith('#')){if(!ids.includes(url.slice(1)))problems.push(file+': missing anchor '+url);continue;}
  await checkLocal(file,url);
 }
 for(const m of html.matchAll(/srcset="([^"]+)"/g))for(const entry of m[1].split(','))await checkLocal(file,entry.trim().split(/\s+/)[0]);
 for(const m of html.matchAll(/data-gallery="([^"]+)"/g))for(const photo of JSON.parse(decode(m[1]))){await checkLocal(file,photo.src);if(photo.preview)await checkLocal(file,photo.preview);}
}
for(const lang of ['ru','tr'])for(const section of ['','credits/']){
 const file=path.join(outputDir,lang,section,'index.html');const html=await fs.readFile(file,'utf8');
 if(!html.includes(`<html lang="${lang}">`))problems.push(file+': wrong lang');
 if((html.match(/<h1\b/g)||[]).length!==1)problems.push(file+': h1 count');
 if(/undefined|\[object Object\]|TODO|placeholder|lorem ipsum|\ufffd/i.test(html))problems.push(file+': unfinished content');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)problems.push(file+': duplicate IDs');
 await checkLinks(file,html);
 if(!html.includes(`rel="canonical" href="${siteRoot}/${lang}/${section}"`))problems.push(file+': wrong canonical URL');
 for(const m of html.matchAll(/<img\b[^>]*>/g)){images++;if(!/\balt="[^"]*"/.test(m[0]))problems.push(file+': missing alt');}
 if(!section){
  if(!html.includes('https://t.me/TV1331'))problems.push(file+': telegram');
  if(!html.includes('https://wa.me/'+settings.phoneDigits))problems.push(file+': whatsapp');
  for(const d of content[lang].destinations)if(d.images.length<3)problems.push(d.id+': less than 3 photos');
  if(content[lang].days.length!==7)problems.push(lang+': days');
  if(lang==='tr'&&/[А-Яа-яЁё]/.test(html))problems.push(file+': Russian in Turkish page');
 }
}
for(const page of ['index.html','404.html']){const file=path.join(outputDir,page);await checkLinks(file,await fs.readFile(file,'utf8'));}
const credits=JSON.parse(await fs.readFile('public/assets/photo-credits.json','utf8'));
for(const p of credits){if(!p.author||!p.source||!p.license||!p.licenseUrl)problems.push(p.id+': incomplete credit');}
await fs.mkdir('output/qa',{recursive:true});
await fs.writeFile('output/qa/static-check.json',JSON.stringify({passed:problems.length===0,localLinks,images,photographs:credits.length,problems},null,2));
console.log(JSON.stringify({passed:!problems.length,localLinks,images,photographs:credits.length,problems},null,2));
if(problems.length)process.exitCode=1;
