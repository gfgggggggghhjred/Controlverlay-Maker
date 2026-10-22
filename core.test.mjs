import test from 'node:test';
import assert from 'node:assert/strict';
import { axis, normalizeCSS, sanitizeConfig } from '../public/core.js';
test('deadzone removes drift, rescales travel, and caps full input',()=>{
  assert.equal(axis(.08,.12),0);assert.equal(axis(-.08,.12),0);
  assert.equal(axis(.56,.12),.5000000000000001);assert.equal(axis(-1,.12),-1);
  assert.equal(axis(2,.12),1);
});
test('pasted chat CSS repairs encoded spaces and Imgur page links',()=>{
  assert.equal(normalizeCSS('&#x20;background:url([https://imgur.com/RUyISIi.gif](https://imgur.com/RUyISIi.gif));'),' background:url(https://i.imgur.com/RUyISIi.gif);');
});
test('imported settings constrain colors, file paths, model and axes settings',()=>{
  const c=sanitizeConfig({accent:'red; } body { display:none',image:'https://evil.invalid/a.png',model:'unknown',deadzone:1,strength:200,positions:null});
  assert.equal(c.accent,'#a5f36c');assert.equal(c.image,'');assert.equal(c.model,'xbox');assert.equal(c.deadzone,.5);assert.equal(c.strength,100);assert.deepEqual(c.positions,{});
  assert.equal(sanitizeConfig({deadzone:0}).deadzone,0);
});
