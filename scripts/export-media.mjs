import sharp from 'sharp';
import fs from 'node:fs/promises';
for(const lang of ['ru','tr']){
 const text=lang==='ru'?['Кыргызстан','Ближе к природе','7 дней · Маршрут из Бишкека']:['Kırgızistan','Doğaya daha yakın','7 gün · Bişkek’ten başlayan rota'];
 const gradient=Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="g"><stop offset="0" stop-color="#102f29" stop-opacity=".96"/><stop offset="1" stop-color="#102f29" stop-opacity=".15"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><text x="70" y="115" fill="#e9c594" font-family="Georgia" font-size="30">KYRGYZSTAN · NATURE JOURNEY</text><text x="70" y="252" fill="#f7f5ef" font-family="Georgia" font-size="78">${text[0]}</text><text x="70" y="345" fill="#e9c594" font-family="Georgia" font-style="italic" font-size="56">${text[1]}</text><text x="70" y="465" fill="#edf0e8" font-family="Arial" font-size="26">${text[2]}</text></svg>`);
 await sharp('public/assets/photos/park-10-1920.webp').resize(1200,630,{fit:'cover'}).composite([{input:gradient}]).jpeg({quality:90}).toFile('public/assets/social-'+lang+'.jpg');
 for(const kind of ['feed','story']){
  const [width,height]=kind==='feed'?[1080,1350]:[1080,1920];
  const input='output/advertising/originals/'+lang+'-'+kind+(kind==='story'?'-safe':'')+'.png';
  await sharp(input).resize(width,height,{fit:'cover',position:'centre'}).png().toFile('output/advertising/'+lang+'-'+kind+'-'+width+'x'+height+'.png');
  await sharp(input).resize(width,height,{fit:'cover',position:'centre'}).jpeg({quality:93,mozjpeg:true}).toFile('output/advertising/'+lang+'-'+kind+'-'+width+'x'+height+'.jpg');
 }
}
console.log('Exported social previews and 4 ads in PNG/JPG');
