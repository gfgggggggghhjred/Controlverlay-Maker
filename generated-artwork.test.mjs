import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {generatedArtwork} from '../public/generated-artwork.js';
import {hardware,hardwareURL} from '../public/hardware.js';
test('six generated previews are installed with provenance and separate review flags',async()=>{
 assert.equal(Object.keys(generatedArtwork).length,6);
 for(const [id,art]of Object.entries(generatedArtwork)){
  const m=hardware[id],bytes=await readFile(new URL('../public/hardware/'+art.file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),art.sha256,id);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(m.generatedArtwork,true);assert.equal(m.sourceArtwork,true);
  assert.equal(m.requiresArtwork,false);assert.ok(m.artworkNote.includes('AI-generated'));
 }
 assert.equal(Object.values(hardware).filter(m=>!m.requiresArtwork).length,116);
 assert.equal(Object.values(hardware).filter(m=>m.variantPending).length,4);
});
