import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {basePath} from '../src/site-config.mjs';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:4175';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const report={passed:false,checks:[],errors:[]};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
try{
 for(const [lang,width] of [['ru',1440],['tr',390]]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  const held=new Map(),failed=new Set();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/assets/photos/*.webp',async route=>{
   const file=new URL(route.request().url()).pathname.split('/').pop();
   if(failed.has(file))return route.abort('failed');
   const gate=held.get(file);if(gate){gate.started.resolve();await gate.release.promise;}
   await route.continue().catch(()=>{});
  });
  const hold=id=>{const gate={started:deferred(),release:deferred()};held.set(id+'-1920.webp',gate);return gate;};
  const assertSelection=async id=>{
   const state=await page.locator('.lightbox-image').evaluate(img=>({src:img.currentSrc,visible:!img.hidden&&getComputedStyle(img).visibility!=='hidden'&&getComputedStyle(img).display!=='none'&&img.getClientRects().length>0}));
   assert(!state.visible||state.src.includes('/'+id+'-'),'Old photograph still visible while opening '+id+': '+state.src);
  };
  const waitPhoto=async id=>page.waitForFunction(id=>{
   const img=document.querySelector('.lightbox-image'),box=document.querySelector('.lightbox');
   return box.open&&box.getAttribute('aria-busy')!=='true'&&!img.hidden&&img.complete&&img.naturalWidth>0&&img.currentSrc.includes('/'+id+'-');
  },id);
  const settle=async id=>{
   await page.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();await new Promise(requestAnimationFrame);},basePath+'/assets/photos/'+id+'-1920.webp');
  };
  try{
   await page.goto(origin+basePath+'/'+lang+'/',{waitUntil:'networkidle'});
   await page.locator('#issyk-kul .gallery a[data-index="1"]').click();
   await waitPhoto('issyk-6');await page.keyboard.press('Escape');
   const canyon=hold('canyonextra-3'),earlier=hold('canyonextra-2'),latest=hold('canyonextra-7');
   await page.locator('#skazka .gallery-main').click();await canyon.started.promise;
   await page.evaluate(()=>new Promise(requestAnimationFrame));
   await assertSelection('canyonextra-3');
   canyon.release.resolve();await waitPhoto('canyonextra-3');
   report.checks.push(lang+': reopened a different gallery without showing the old photograph');

   await page.keyboard.press('ArrowRight');await earlier.started.promise;
   await page.keyboard.press('ArrowRight');await latest.started.promise;
   latest.release.resolve();await waitPhoto('canyonextra-7');
   earlier.release.resolve();await settle('canyonextra-2');
   await assertSelection('canyonextra-7');
   assert.equal(await page.locator('.lightbox-counter').textContent(),'3 / 3');
   report.checks.push(lang+': rapid navigation ignores older responses arriving later');
   await page.keyboard.press('Escape');

   const waterfall=hold('falls-1');
   await page.locator('#barskoon .gallery-main').click();await waterfall.started.promise;
   await page.keyboard.press('Escape');
   await page.locator('#ala-archa a[data-index="2"]').click();await waitPhoto('park-4');
   waterfall.release.resolve();await settle('falls-1');await assertSelection('park-4');
   assert.equal(await page.locator('.lightbox-counter').textContent(),'3 / 3');
   report.checks.push(lang+': closing during loading cannot overwrite the next gallery');
   await page.keyboard.press('Escape');

   failed.add('issyk-9-1920.webp');failed.add('issyk-9-640.webp');
   await page.locator('#issyk-kul .gallery-main').click();
   await page.keyboard.press('ArrowLeft');
   await page.waitForFunction(()=>document.querySelector('.lightbox').dataset.state==='error');
   await assertSelection('issyk-9');
   failed.clear();await page.locator('.lightbox-retry').click();await waitPhoto('issyk-9');
   report.checks.push(lang+': failed loading shows a retry action and retry displays the selected photo');
   await page.locator('.lightbox-image').evaluate(img=>{
    const touch=x=>new Touch({identifier:1,target:img,clientX:x,clientY:200});
    img.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,changedTouches:[touch(250)]}));
    img.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch(80)]}));
   });
   await waitPhoto('issyk-2');
   assert.equal(await page.locator('.lightbox-counter').textContent(),'1 / 4');
   report.checks.push(lang+': swipe still works after replacing the decoded image');
   await page.keyboard.press('Escape');
  }finally{
   for(const gate of held.values())gate.release.resolve();
   await context.close();
  }
 }
 report.passed=report.errors.length===0;
}catch(e){report.errors.push(e.message);}
finally{
 await browser.close();await fs.mkdir('output/qa',{recursive:true});
 await fs.writeFile('output/qa/gallery-check.json',JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
