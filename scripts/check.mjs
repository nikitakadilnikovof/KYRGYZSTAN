import fs from 'node:fs/promises';
import path from 'node:path';
import {content,settings} from '../src/content.mjs';
const problems=[];let localLinks=0,images=0;
for(const lang of ['ru','tr'])for(const section of ['','credits/']){
 const file='dist/'+lang+'/'+section+'index.html';const html=await fs.readFile(file,'utf8');
 if(!html.includes(`<html lang="${lang}">`))problems.push(file+': wrong lang');
 if((html.match(/<h1\b/g)||[]).length!==1)problems.push(file+': h1 count');
 if(/undefined|\[object Object\]|TODO|placeholder|lorem ipsum|\ufffd/i.test(html))problems.push(file+': unfinished content');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)problems.push(file+': duplicate IDs');
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const url=match[1].replaceAll('&amp;','&');if(url.startsWith('#')){if(!ids.includes(url.slice(1)))problems.push(file+': missing anchor '+url);continue;}
  if(!url.startsWith('/')||url.startsWith('//'))continue;let dest='dist'+url.split('#')[0];if(dest.endsWith('/'))dest+='index.html';try{await fs.access(dest);localLinks++;}catch{problems.push(file+': missing '+url);}
 }
 for(const m of html.matchAll(/<img\b[^>]*>/g)){images++;if(!/\balt="[^"]*"/.test(m[0]))problems.push(file+': missing alt');}
 if(!section){
  if(!html.includes('https://t.me/TV1331'))problems.push(file+': telegram');
  if(!html.includes('https://wa.me/'+settings.phoneDigits))problems.push(file+': whatsapp');
  for(const d of content[lang].destinations)if(d.images.length<3)problems.push(d.id+': less than 3 photos');
  if(content[lang].days.length!==7)problems.push(lang+': days');
  if(lang==='tr'&&/[А-Яа-яЁё]/.test(html))problems.push(file+': Russian in Turkish page');
 }
}
const credits=JSON.parse(await fs.readFile('public/assets/photo-credits.json','utf8'));
for(const p of credits){if(!p.author||!p.source||!p.license||!p.licenseUrl)problems.push(p.id+': incomplete credit');}
await fs.mkdir('output/qa',{recursive:true});
await fs.writeFile('output/qa/static-check.json',JSON.stringify({passed:problems.length===0,localLinks,images,photographs:credits.length,problems},null,2));
console.log(JSON.stringify({passed:!problems.length,localLinks,images,photographs:credits.length,problems},null,2));
if(problems.length)process.exitCode=1;
