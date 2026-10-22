import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {hardware,modelFromDevice,controlRect,hardwareURL} from '../public/hardware.js';
import {sanitizeConfig} from '../public/core.js';
test('legacy saved layouts migrate to named real hardware',()=>{
  assert.equal(sanitizeConfig({model:'playstation'}).model,'dualsense');
  assert.equal(sanitizeConfig({model:'xbox'}).model,'xbox');
});
test('device detection distinguishes controller generations and leaves unknown hardware alone',()=>{
  const ids=[['Sony DualSense Wireless Controller','dualsense'],['Wireless Controller (Vendor: 054c Product: 09cc)','dualshock4'],['Xbox 360 Controller','xbox360'],['Xbox One Controller','xbox-one'],['Nintendo Pro Controller','switch-pro'],['Joy-Con (L+R)','joycon'],['Steam Controller','steam'],['Steam Deck','steamdeck'],['Generic Gamepad',null]];
  for(const [id,expected]of ids)assert.equal(modelFromDevice(id),expected,id);
});
test('catalog distinguishes bundled artwork from named calibration profiles and keeps targets on the canvas',async()=>{
  for(const [key,m]of Object.entries(hardware)){
    if(m.requiresArtwork)assert.equal(hardwareURL(key),null,key+' must never show another model’s artwork');
    else {
      const url=hardwareURL(key),data=await readFile(new URL('../public'+url,import.meta.url));
      if(url.endsWith('.png')){assert.equal(data.readUInt32BE(16),m.width,key+' image width');assert.equal(data.readUInt32BE(20),m.height,key+' image height');}
      else {assert.ok(data.toString().includes('<svg'));assert.match(data.toString(),/data:image\/(png|jpeg|webp|gif);base64,/,key+' must render without external SVG image dependencies');}
    }
    assert.equal(new Set(m.labels).size,4);
    for(const name of Object.keys(m.controls)){
      const r=controlRect(key,name);assert.ok(r,key+' '+name);
      assert.ok(r.left>=0&&r.top>=0&&r.left+r.width<=750&&r.top+r.height<=630,key+' '+name+' must stay inside the output canvas');
    }
  }
});
test('six-button fight pads have independent third-punch and third-kick targets',()=>{
  const fightpads=Object.values(hardware).filter(m=>m.type?.startsWith('fightpad'));
  assert.ok(fightpads.length>=10);
  for(const m of fightpads){assert.ok(m.controls.punch&&m.controls.kick,m.name);if(m.type==='fightpad')assert.equal(m.controls.ls,undefined,m.name);if(m.dualSticks)assert.ok(m.controls.ls&&m.controls.rs,m.name);else assert.equal(m.controls.rs,undefined,m.name);}
});

