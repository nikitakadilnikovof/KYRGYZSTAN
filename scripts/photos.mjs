import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
await fs.mkdir(path.join(root,'research/candidates'), {recursive:true});
const queries = {
 lake: '"Issyk-Kul" lake landscape -filetype:svg',
 canyon: '"Skazka Canyon"',
 falls: '"Barskoon" waterfall',
 park: '"Ala-Archa" landscape',
 city: '"Bishkek" "Ala-Too Square"',
 springs: '"Altyn Arashan" hot springs',
 kemin: '"Chon Kemin"',
 manas: '"Manas International Airport" terminal'
};
const all=[];
for(const [group, q] of Object.entries(queries)) {
 const params = new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:q,gsrnamespace:'6',gsrlimit:'10',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1280'});
 const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params, {headers:{'User-Agent':'KyrgyzstanJourney/1.0 (photo attribution research)'}});
 if(!response.ok) throw Error('Commons '+response.status);
 const data=await response.json();
 const pages=Object.values(data.query?.pages??{}).sort((a,b)=>a.index-b.index);
 let idx=0;
 for(const p of pages) {
  const i=p.imageinfo?.[0], m=i?.extmetadata;
  if(!i || !m || !/\.jpe?g$/i.test(p.title) || !/CC BY|CC0|Public domain/i.test(m.LicenseShortName?.value??'')) continue;
  idx++;
  const id=group+'-'+idx;
  const item={id,group,title:p.title,source:i.descriptionurl,original:i.url.split('?')[0],preview:i.thumburl?.split('?')[0],width:i.width,height:i.height,author:(m.Artist?.value??'').replace(/<[^>]+>/g,''),license:m.LicenseShortName?.value,licenseUrl:m.LicenseUrl?.value??'',description:m.ImageDescription?.value??'',date:m.DateTimeOriginal?.value};
  all.push(item);
  const file=path.join(root,'research/candidates',id+'.jpg');
  try {await fs.access(file);}catch{try {const r=await fetch(item.preview??item.original);if(r.ok)await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));else console.log(id+' HTTP '+r.status);}catch(e){console.log(id+' '+e.message);}}
 }
 console.log(group+': '+idx+' candidates');
 await fs.writeFile(path.join(root,'research/photos-candidates.json'),JSON.stringify(all,null,2));
}
console.log('Saved '+all.length+' candidates');
