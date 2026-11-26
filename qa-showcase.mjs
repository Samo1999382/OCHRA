import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('.qa',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.waitForLoadState('networkidle');
async function seek(rootSelector,stageSelector,p){await page.evaluate(async({rootSelector,stageSelector,p})=>{const root=document.querySelector(rootSelector),stage=document.querySelector(stageSelector);window.scrollTo(0,root.getBoundingClientRect().top+scrollY+(root.offsetHeight-stage.offsetHeight)*p);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))},{rootSelector,stageSelector,p});await page.waitForFunction(selector=>document.querySelector(selector).dataset.motion==='settled',stageSelector);}
const cloud=async p=>seek('.feature-constellation','.constellation-stage',p);
const audience=async p=>seek('.audience-panels','.audience-stage',p);
const rects=()=>page.locator('.floating-feature').evaluateAll(cards=>cards.map(c=>({y:c.getBoundingClientRect().y,h:c.offsetHeight})));
await cloud(.15);const before=await rects();const headingBefore=await page.locator('.constellation-heading h2').boundingBox();await page.screenshot({path:'.qa/cloud-enter.png'});
await cloud(.48);const mid=await rects();const headingAfter=await page.locator('.constellation-heading h2').boundingBox();await page.screenshot({path:'.qa/cloud-mid.png'});
assert(Math.abs(headingBefore.y-headingAfter.y)<1,'Title must remain pinned while cards pass');
assert(mid.filter(c=>c.y<900&&c.y+c.h>0).length>=4,'Multiple cards should be on stage together');
assert(mid[1].y<before[1].y-200);assert(Math.abs((mid[1].y-before[1].y)-(mid[2].y-before[2].y))>20,'Cards need independent travel speeds');
await cloud(.8);await page.screenshot({path:'.qa/cloud-exit.png'});
await cloud(.15);const reversed=await rects();assert(Math.abs(reversed[1].y-before[1].y)<1,'Reverse scroll restores card positions');
for(const [i,p] of [[0,.08],[1,.51],[2,.94]]){await audience(p);assert.equal(await page.locator('.audience-stage').getAttribute('data-active'),String(i));assert(await page.locator('.audience-card').nth(i).evaluate(c=>!c.inert));const box=await page.locator('.audience-card').nth(i).boundingBox();assert(box.y>90&&box.y<180);await page.screenshot({path:`.qa/audience-${i}.png`});assert(await page.locator('.audience-card').nth(i).getByRole('link').isVisible());}
await page.getByRole('button',{name:'01 For surgeons'}).click();await page.waitForFunction(()=>document.querySelector('.audience-stage').dataset.active==='0'&&document.querySelector('.audience-stage').dataset.motion==='settled');
await page.locator('.audience-surgeons').getByRole('link',{name:'View case library'}).click();await page.getByRole('heading',{name:'Every case. One place.'}).waitFor();
await page.goto('http://127.0.0.1:5173');await page.waitForLoadState('networkidle');await page.setViewportSize({width:390,height:844});
await cloud(.48);await page.screenshot({path:'.qa/cloud-mobile.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await audience(.51);await page.screenshot({path:'.qa/audience-mobile.png'});const cta=await page.locator('.audience-reviewers .audience-cta').boundingBox();assert(cta.y>0&&cta.y+cta.height<844);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert(await page.locator('.audience-card').evaluateAll(cards=>cards.every(c=>!c.inert)));assert.equal(await page.locator('.constellation-stage').evaluate(s=>getComputedStyle(s).position),'relative');await page.screenshot({path:'.qa/showcase-reduced-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS: pinned title, staggered card lanes, reverse scrolling, 3 audience panels, active links, direct navigation, mobile bounds and reduced motion.');await browser.close();
