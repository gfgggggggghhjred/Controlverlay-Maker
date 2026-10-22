import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {hardware,hardwareURL} from '../public/hardware.js';
import {collectedArtwork} from '../public/collected-artwork.js';
import {mechanicsCSS} from '../public/mechanics.js';
test('99 new artwork previews are self-contained and keep the exact acquired source pixels',async()=>{
 assert.equal(Object.keys(collectedArtwork).length,99);
 for(const [id,source]of Object.entries(collectedArtwork)){
  const model=hardware[id];assert.equal(model.requiresArtwork,false);assert.equal(model.sourceArtwork,true);
  const svg=await readFile(new URL('../public/hardware/'+source.file,import.meta.url),'utf8');
  const bytes=Buffer.from(svg.match(/base64,([A-Za-z0-9+/=]+)/)[1],'base64');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,id);
  if(model.previewCalibrated)assert.ok(mechanicsCSS(id).includes('background-position:'),id+' needs image-derived moving pieces');
  else assert.equal(mechanicsCSS(id),'',id+' must not pretend an uncalibrated photo has separated moving parts');
  assert.ok(source.license&&source.reviewNote);
 }
});
test('four uncertain variants keep explicit review flags on their generated previews',()=>{
 const pending=Object.entries(hardware).filter(([,m])=>m.variantPending).map(([id])=>id).sort();
 assert.deepEqual(pending,['gulikit-kingkong2-base','razer-onza','scuf-instinct-base','scuf-reflex-base'].sort());
});
