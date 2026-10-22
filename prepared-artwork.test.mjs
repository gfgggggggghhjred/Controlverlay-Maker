import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {preparedArtwork} from '../public/prepared-artwork.js';
import {hardware,hardwareURL,controlRect} from '../public/hardware.js';
import {mechanicsCSS} from '../public/mechanics.js';
import {designCSS} from '../public/design.js';

test('every catalog entry resolves to bundled artwork and a motion stylesheet',async()=>{
 assert.equal(Object.keys(hardware).length,116);
 assert.equal(Object.keys(preparedArtwork).length,103);
 for(const [id,m]of Object.entries(hardware)){
  assert.notEqual(m.requiresArtwork,true,id);
  const bytes=await readFile(new URL('../public'+hardwareURL(id),import.meta.url));
  assert.ok(bytes.length>100,id);
  assert.ok(mechanicsCSS(id).includes('background-position:'),id);
  for(const [key,v]of Object.entries(m.controls)){
   assert.ok(v.every(Number.isFinite),id+' '+key);
   assert.ok(v[0]>=0&&v[0]<=1&&v[1]>=0&&v[1]<=1,id+' '+key);
   const r=controlRect(id,key);assert.ok(r.width>0&&r.height>0,id+' '+key);
  }
 }
});
test('cleaned artwork dimensions, checksums and normalized coordinates travel together',async()=>{
 for(const [id,a]of Object.entries(preparedArtwork)){
  const m=hardware[id],bytes=await readFile(new URL('../public'+hardwareURL(id),import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,id);
  assert.equal(bytes.readUInt32BE(16),m.width,id);assert.equal(bytes.readUInt32BE(20),m.height,id);
  assert.deepEqual(m.controls,a.controls,id);
  const css=designCSS({model:id,accent:'#ffffff',shell:'#222222',strength:65,positions:{},effect:'glow'});
  for(const key of Object.keys(a.controls))assert.ok(css.includes('[data-control="'+key+'"] .moving-piece'),id+' '+key);
 }
});
test('specific hardware layouts retain distinct model anatomy',()=>{
 assert.notEqual(hardwareURL('razer-wolverine-v2'),hardwareURL('razer-wolverine-chroma'));
 assert.ok(preparedArtwork['razer-wolverine-v2'].reference.includes('3941-1-EN-v1'));
 assert.equal(hardware['razer-raiju'].generatedArtwork,false);
 assert.equal(hardware['hori-fc4'].generatedArtwork,false);
 assert.equal(hardware['hori-fc4'].controls.ls,undefined);
 assert.ok(hardware['madcatz-fightpadpro'].controls.ls);
 assert.ok(hardware['hori-octa-pro'].controls.rs);
 for(const id of ['hori-fc4','razer-raion','8bitdo-m30bt','victrix-bfg-fight']){
  assert.ok(hardware[id].controls.punch&&hardware[id].controls.kick,id);
  assert.equal(hardware[id].controls.rb,undefined,id+' must not duplicate R1 face control');
 }
 assert.ok(hardware['hyperkin-xenon'].controls.ls[1]<hardware['hyperkin-xenon'].controls.rs[1]);
});
