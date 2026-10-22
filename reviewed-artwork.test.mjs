import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {reviewedArtwork} from '../public/reviewed-artwork.js';
import {hardware,hardwareURL} from '../public/hardware.js';
import {mechanicsCSS,stickTravel,controlTravel} from '../public/mechanics.js';
test('audited controller-only views use installed files and image-derived moving pieces',async()=>{
 assert.equal(Object.keys(reviewedArtwork).length,7);
 for(const [id,art]of Object.entries(reviewedArtwork)){
  const m=hardware[id],bytes=await readFile(new URL('../public/hardware/'+art.file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),art.sha256,id);
  assert.equal(m.previewCalibrated,true);const css=mechanicsCSS(id);
  assert.ok(css.includes(hardwareURL(id)));assert.ok(css.includes('background-size:'));
  for(const key of Object.keys(m.controls))assert.ok(css.includes('[data-control="'+key+'"]'),id+' '+key);
 }
 assert.deepEqual(hardware['razer-raiju'].labels,['×','○','□','△']);
 assert.equal(hardware['razer-raiju'].controls.ls[1],hardware['razer-raiju'].controls.rs[1]);
 assert.equal(hardware['hori-fc4'].controls.ls,undefined);
 assert.equal(hardware['hori-fc4'].controls.rs,undefined);
 assert.ok(stickTravel(1,0).x>0);assert.ok(controlTravel(1).triggerY>controlTravel(0).triggerY);
});
