import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stickTravel,controlTravel} from '../public/mechanics.js';
import {hardware,hardwareURL} from '../public/hardware.js';
test('stick returns to center inside deadzone and travels in the physical axis direction',()=>{
  assert.deepEqual(stickTravel(.05,-.05),{x:0,y:0});
  assert.deepEqual(stickTravel(1,0,.12,20),{x:20,y:0});
  assert.deepEqual(stickTravel(0,-1,.12,20),{x:0,y:-20});
});
test('diagonals are constrained to the circular stick gate',()=>{
  const p=stickTravel(1,1,.12,20);assert.ok(Math.abs(Math.hypot(p.x,p.y)-20)<1e-8);assert.equal(p.x,p.y);
});
test('half trigger pull has half travel and release restores the rest pose',()=>{
  assert.equal(controlTravel(.5).triggerY,controlTravel(1).triggerY/2);
  assert.equal(controlTravel(0).buttonY,0);assert.equal(controlTravel(0).triggerScale,1);
  assert.equal(controlTravel(10).pull,1);assert.equal(controlTravel(-2).pull,0);
});
test('every built-in controller has an independent shell with the same canvas dimensions',async()=>{
  for(const [id,m] of Object.entries(hardware)){
    if(m.requiresArtwork)continue;
    const url=hardwareURL(id,true);
    const b=await readFile(new URL('../public'+url,import.meta.url));
    if(url.endsWith('.svg')){assert.ok(b.toString().includes('<svg'));continue;}
    assert.equal(b.readUInt32BE(16),m.width,id);assert.equal(b.readUInt32BE(20),m.height,id);
  }
});

import {mechanicsCSS} from '../public/mechanics.js';
import {controlRect} from '../public/hardware.js';
test('prepared control geometry preserves measured cap aspect and trigger size',()=>{
 for(const [id,m] of Object.entries(hardware)){
  if(!m.previewCalibrated)continue;
  const scale=Math.min(750/m.width,630/m.height);
  for(const [key,a] of Object.entries(m.controls)){
   const r=controlRect(id,key);
   assert.ok(Math.abs(r.width-a[2]*m.width*scale)<1e-8,id+' '+key);
   assert.ok(Math.abs(r.height-a[3]*m.height*scale)<1e-8,id+' '+key);
  }
 }
});
test('moving crop samples the adjusted position including clamped coordinates',()=>{
 const id='scuf-infinity4ps',m=hardware[id],scale=Math.min(750/m.width,630/m.height);
 const ox=(750-m.width*scale)/2,oy=(630-m.height*scale)/2;
 for(const [pos,left,top] of [[[240,310],240,310],[[-20,900],0,580]]){
  const css=mechanicsCSS(id,{ls:pos});
  const line=css.split('\n').find(s=>s.includes('[data-control="ls"]'));
  assert.ok(line.includes(`background-position:${ox-left}px ${oy-top}px;`));
 }
});
