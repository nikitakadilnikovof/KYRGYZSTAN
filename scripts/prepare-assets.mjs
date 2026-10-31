import fs from 'node:fs/promises';
import sharp from 'sharp';
const candidates=JSON.parse(await fs.readFile('research/photos-candidates.json','utf8'));
const chosen=['issyk-2','issyk-6','lake-5','issyk-9','canyonextra-2','canyonextra-3','canyonextra-7','falls-1','falls-2','falls-9','park-4','park-8','park-10','city-2','city-3','city-9','kemin-2','kemin-4','kemin-5','manas-2','manas-5','manas-8'];
await fs.mkdir('public/assets/photos',{recursive:true});
await fs.mkdir('research/originals',{recursive:true});
const photos=[];
for(const id of chosen){
 const item=candidates.find(p=>p.id===id);if(!item)throw Error('Missing '+id);
 let input='research/originals/'+id+'.jpg';
 try{await fs.access(input);}catch{
  try{const r=await fetch(item.original);if(!r.ok)throw Error('HTTP '+r.status);await fs.writeFile(input,Buffer.from(await r.arrayBuffer()));}catch(e){console.log(id+' original unavailable, using downloaded preview: '+e.message);input='research/candidates/'+id+'.jpg';}
 }
 const meta=await sharp(input).metadata();
 for(const width of [640,1280,1920])await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:width===1920?85:80}).toFile('public/assets/photos/'+id+'-'+width+'.webp');
 photos.push({...item,licenseUrl:item.licenseUrl||item.source+'#Summary',local:'/assets/photos/'+id+'-1280.webp',actualWidth:meta.width,actualHeight:meta.height,changes:'Resized, converted to WebP; responsive crops in page layout. No AI editing of website photographs.'});
 console.log(id);
}
await fs.writeFile('public/assets/photo-credits.json',JSON.stringify(photos,null,2));
console.log('Prepared '+photos.length+' real photographs');
