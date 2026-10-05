import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {chromium} from 'playwright';
import {startServer} from './serve.mjs';import {textContrast} from './contrast.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'review');await fs.mkdir(out,{recursive:true});
const server=process.env.TEDUSTORE_REVIEW_URL?null:await startServer(0),url=process.env.TEDUSTORE_REVIEW_URL||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.TEDUSTORE_CHROMIUM?{executablePath:process.env.TEDUSTORE_CHROMIUM}:{})});
const report={states:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(url);await page.waitForSelector('.product-card');await page.evaluate(()=>document.fonts.ready);
 async function inspect(name){const contrast=await textContrast(page),overflow=await page.evaluate(()=>[...document.querySelectorAll('dialog[open]')].filter(d=>d.scrollWidth>d.clientWidth+1).map(d=>d.id));report.states.push({name,...contrast,overflow});}
 await inspect('desktop');
 const brokenAnchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href')));assert.equal(brokenAnchors.length,0);report.anchors=true;
 await page.locator('.product-card [data-product="hoodie"]').first().click();await inspect('product');await page.locator('[data-open="size-dialog"]').click();await inspect('size-guide');
 for(let i=0;i<6;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('dialog')?.id),'size-dialog');}report.focusTrap=true;await page.keyboard.press('Escape');
 await page.locator('[data-size="M"]').click();await page.locator('#add-to-bag').click();await inspect('bag');await page.keyboard.press('Escape');
 await page.locator('.header-actions [data-open="search-dialog"]').click();await inspect('search');await page.keyboard.press('Escape');
 await page.locator('[data-open="privacy-dialog"]').first().click();await inspect('privacy');await page.keyboard.press('Escape');
 await page.locator('.header-actions [data-open="bag-dialog"]').click();await page.locator('#begin-checkout').click();await inspect('contact');
 await page.locator('#demo-details').click();await page.locator('#checkout-form button[type="submit"]').click();await inspect('payment');
 await page.locator('#simulate-checkout').click();await inspect('payment-error');await page.locator('#demo-ack').check();assert.equal(await page.locator('#checkout-error').textContent(),'');report.correctedError=true;
 for(const width of [320,390]){await page.setViewportSize({width,height:844});await inspect('payment-'+width);await page.locator('#simulate-checkout').scrollIntoViewIfNeeded();const rect=await page.locator('#simulate-checkout').boundingBox();assert(rect.x>=0&&rect.x+rect.width<=width);}
 await page.setViewportSize({width:1440,height:1000});await page.locator('#simulate-checkout').click();await page.waitForSelector('.receipt-reference');await inspect('receipt');
 await page.locator('[data-open-payout]').click();await inspect('payout');await page.keyboard.press('Escape');
 for(const width of [320,390]){await page.setViewportSize({width,height:844});await inspect('homepage-'+width);}
 assert.equal(report.errors.length,0);assert(report.states.every(s=>s.issues.length===0&&s.overflow.length===0));report.pass=true;
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,'quality.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
