import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('output/qa',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const report={pages:[],interactions:[],errors:[]};
try{
 for(const [width,height] of [[1440,1000],[768,1024],[390,844],[320,760]])for(const lang of ['ru','tr']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:4173/')&&r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  await page.goto('http://127.0.0.1:4173/'+lang+'/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{for(const i of document.images){i.loading='eager';}await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})));});
  const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.querySelectorAll('main img')].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),h1:document.querySelector('h1').textContent,language:document.documentElement.lang}));
  report.pages.push({lang,width,...metrics});if(metrics.scrollWidth>width)report.errors.push('Overflow '+lang+' '+width+': '+metrics.scrollWidth);if(metrics.broken.length)report.errors.push('Broken images '+lang+' '+width);
  if(width===1440||width===390)await page.screenshot({path:'output/qa/'+lang+'-'+width+'.png',fullPage:true});
  if(width===390){
    await page.locator('.menu-toggle').click();if(!(await page.locator('#mobile-nav').isVisible()))throw Error('Menu did not open');
    await page.locator('#mobile-nav a[href="#route"]').click();if(await page.locator('#mobile-nav').isVisible())throw Error('Menu did not close');report.interactions.push(lang+': mobile menu and route anchor');
  }
  if(width===1440){
    await page.locator('.story .gallery-main').first().click();if(!(await page.locator('.lightbox').isVisible()))throw Error('Gallery failed');
    const first=await page.locator('.lightbox-image').getAttribute('src');await page.keyboard.press('ArrowRight');const second=await page.locator('.lightbox-image').getAttribute('src');if(first===second)throw Error('Gallery next failed');
    await page.keyboard.press('Escape');if(await page.locator('.lightbox').isVisible())throw Error('Gallery close failed');report.interactions.push(lang+': gallery open, next, escape');
    await page.locator('.questions summary').first().click();if(!await page.locator('.questions details').first().evaluate(e=>e.open))throw Error('FAQ failed');report.interactions.push(lang+': FAQ');
    const other=lang==='ru'?'tr':'ru';await page.evaluate(()=>location.hash='#faq');await page.locator('.languages a[lang="'+other+'"]').click();await page.waitForURL('**/'+other+'/#faq');report.interactions.push(lang+': language switch preserves section');
  }
  await context.close();
 }
 const page=await browser.newPage();for(const p of ['/','/ru/credits/','/tr/credits/','/absent-page']){const r=await page.goto('http://127.0.0.1:4173'+p);report.interactions.push(p+': HTTP '+r.status());if(r.status()!==(p==='/absent-page'?404:200))report.errors.push('Unexpected status '+p);}
 report.passed=report.errors.length===0;
}catch(e){report.errors.push(e.message);report.passed=false;}
finally{await browser.close();await fs.writeFile('output/qa/browser-check.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
