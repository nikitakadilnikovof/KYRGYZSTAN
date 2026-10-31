import sharp from 'sharp';
import fs from 'node:fs/promises';
const list=JSON.parse(await fs.readFile('research/photos-candidates.json','utf8'));
for(const group of [...new Set(list.map(i=>i.group))]){
 const items=list.filter(i=>i.group===group);
 const layers=[];
 for(let n=0;n<items.length;n++){
  const i=items[n];let tile;
  try{tile=await sharp('research/candidates/'+i.id+'.jpg').resize(350,230,{fit:'cover'}).toBuffer();}catch{continue;}
  const x=(n%3)*360,y=Math.floor(n/3)*270;
  layers.push({input:tile,left:x,top:y});
  const label=Buffer.from(`<svg width="350" height="32"><rect width="350" height="32" fill="#fff"/><text x="8" y="23" fill="#111" font-size="19">${i.id} · ${i.width}×${i.height}</text></svg>`);
  layers.push({input:label,left:x,top:y+230});
 }
 await sharp({create:{width:1080,height:Math.ceil(items.length/3)*270,channels:3,background:'#ddd'}}).composite(layers).jpeg({quality:85}).toFile('research/contact-'+group+'.jpg');
 console.log(group);
}
