import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('.qa',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.waitForLoadState('networkidle');
async function scrub(p){await page.evaluate(async p=>{const root=document.querySelector('.scroll-story');const stage=document.querySelector('.story-stage');window.scrollTo(0,root.getBoundingClientRect().top+scrollY+(root.offsetHeight-stage.offsetHeight)*p);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))},p);await page.waitForFunction(()=>document.querySelector('.story-stage').dataset.motion==='settled');return page.locator('.story-stage').evaluate(el=>({top:el.getBoundingClientRect().top,cap:parseFloat(el.style.getPropertyValue('--capsule')),opacity:parseFloat(el.style.getPropertyValue('--copy-opacity')),phase:el.dataset.phase,x:parseFloat(el.style.getPropertyValue('--subject-x')),words:[...el.querySelectorAll('.story-copy span')].map(e=>parseFloat(e.style.opacity))}));}
const a=await scrub(.02);await page.screenshot({path:'.qa/story-01-start.png'});
const b=await scrub(.36);await page.screenshot({path:'.qa/story-02-capsules.png'});
const c=await scrub(.76);await page.screenshot({path:'.qa/story-03-reading.png'});
const d=await scrub(.98);await page.screenshot({path:'.qa/story-04-complete.png'});
assert(a.cap<.05);assert(b.cap>.99);assert(Math.abs(b.top)<2);assert(c.opacity>.99);assert(c.x>100);assert(d.words.every(v=>v>.99));
const reverse=await scrub(.02);assert(reverse.cap<.05);assert(reverse.opacity===0);
// A large wheel jump must produce several monotonic intermediate frames,
// then stop rendering after the animation catches up.
const samples=await page.evaluate(async()=>{const root=document.querySelector('.scroll-story');const panel=document.querySelector('.story-stage');const start=root.getBoundingClientRect().top+scrollY;window.scrollTo(0,start+(root.offsetHeight-panel.offsetHeight)*.4);const values=[];for(let i=0;i<12;i++){await new Promise(requestAnimationFrame);values.push(parseFloat(panel.style.getPropertyValue('--progress')))}return values});
assert(new Set(samples.map(v=>v.toFixed(2))).size>5,'Scroll should interpolate across frames');
assert(samples.every((v,i)=>i===0||v>=samples[i-1]),'Damping should never bounce or overshoot');
await page.waitForFunction(()=>document.querySelector('.story-stage').dataset.motion==='settled');
await page.getByRole('tab',{name:'Omission'}).click();await page.getByText('Step 03 was not observed in this illustrative sequence.').waitFor();
await page.getByRole('tab',{name:'Timing'}).click();await page.getByText('Example: a 5-second reference step takes 7 seconds.').waitFor();
await page.getByRole('tab',{name:'Timing'}).press('ArrowLeft');assert.equal(await page.getByRole('tab',{name:'Omission'}).getAttribute('aria-selected'),'true');
await page.locator('summary').filter({hasText:'Is the AI analysis live?'}).click();assert(await page.locator('details[open]').innerText().then(t=>t.includes('not yet connected')));
await page.getByRole('button',{name:'Preview Identify appendix'}).click();assert.equal(await page.locator('.preview-film-label h3').textContent(),'Identify appendix');
await page.setViewportSize({width:390,height:844});
await scrub(.36);await page.screenshot({path:'.qa/story-mobile-capsules.png'});
await scrub(.98);await page.screenshot({path:'.qa/story-mobile-reading.png'});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
const bounds=await page.locator('.story-subject').boundingBox();assert(bounds.x+bounds.width<391,'Subject exceeds mobile width');
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForLoadState('networkidle');assert(await page.locator('.scroll-story').evaluate(e=>e.offsetHeight<innerHeight));
await page.screenshot({path:'.qa/landing-expanded-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['pinned position','capsule expansion','subject migration','word-by-word reveal','reverse scroll','finding tabs and keyboard','FAQ','preview selection','mobile bounds','reduced motion'],states:{a,b,c,d}}));
await browser.close();
