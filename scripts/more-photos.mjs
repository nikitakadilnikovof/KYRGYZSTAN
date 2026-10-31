import fs from 'node:fs/promises';
const all=JSON.parse(await fs.readFile('research/photos-candidates.json','utf8'));
for(const [group,query] of [['issyk','intitle:"Issyk-Kul" -intitle:Song -intitle:map -intitle:flag'],['thermal','intitle:"Altyn-Arashan"'],['canyonextra','intitle:"Skazka Canyon, Kyrgyzstan"']]){
 const params=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'10',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1280'});
 const data=await (await fetch('https://commons.wikimedia.org/w/api.php?'+params)).json();let n=0;
 for(const p of Object.values(data.query?.pages??{}).sort((a,b)=>a.index-b.index)){
  const i=p.imageinfo?.[0],m=i?.extmetadata;if(!i||!m||!/\.jpe?g$/i.test(p.title)||!/CC BY|CC0|Public domain/i.test(m.LicenseShortName?.value??''))continue;
  const item={id:group+'-'+(++n),group,title:p.title,source:i.descriptionurl,original:i.url.split('?')[0],preview:i.thumburl?.split('?')[0],width:i.width,height:i.height,author:(m.Artist?.value??'').replace(/<[^>]+>/g,''),license:m.LicenseShortName?.value,licenseUrl:m.LicenseUrl?.value??'',description:m.ImageDescription?.value??''};
  if(all.some(x=>x.id===item.id))continue;all.push(item);
  const r=await fetch(item.preview??item.original);if(r.ok)await fs.writeFile('research/candidates/'+item.id+'.jpg',Buffer.from(await r.arrayBuffer()));
 }
 console.log(group+': '+n);
}
await fs.writeFile('research/photos-candidates.json',JSON.stringify(all,null,2));
