import test from 'node:test';
import assert from 'node:assert/strict';
import {deformPhoto,photoControls,influence} from '../public/photo-motion.js';
import {hardware,controlRect} from '../public/hardware.js';
import {defaults} from '../public/core.js';

const fixture=()=>{
  const pixels=new Uint8ClampedArray(100*100*4);
  for(let y=0;y<100;y++)for(let x=0;x<100;x++)pixels.set([x*2,y*2,50,255],(y*100+x)*4);
  return pixels;
};
const control={cx:50,cy:50,rx:30,ry:30,dx:5,dy:-3,shrink:0,brightness:0,power:2};
test('release restores the original pixels exactly after movement',()=>{
  const source=fixture(),buffer=deformPhoto(source,100,100,[control]);
  assert.notDeepEqual(buffer,source);
  assert.deepEqual(deformPhoto(source,100,100,[],buffer),source);
});
test('stick image translates in both axes without duplicating the original cap',()=>{
  const source=fixture(),moved=deformPhoto(source,100,100,[control]);
  assert.deepEqual([...moved.slice((47*100+55)*4,(47*100+55)*4+4)],[100,100,50,255]);
  assert.deepEqual([...moved.slice((50*100+50)*4,(50*100+50)*4+4)],[90,106,50,255]);
});
test('motion blends to identity at its boundary and never changes outside pixels',()=>{
  const source=fixture(),moved=deformPhoto(source,100,100,[control]);
  assert.equal(influence(80,50,control),0);
  assert.ok(influence(79.99,50,control)<.00001);
  for(let y=0;y<100;y++)for(let x=0;x<100;x++)if(!influence(x,y,control)){
    const i=(y*100+x)*4;assert.deepEqual(moved.slice(i,i+4),source.slice(i,i+4));
  }
});
test('simultaneous overlapping inputs are independent of iteration order',()=>{
  const source=fixture(),other={...control,cx:57,dx:-2,brightness:.1};
  assert.deepEqual(deformPhoto(source,100,100,[control,other]),deformPhoto(source,100,100,[other,control]));
});
test('every calibrated model uses its measured centers, input mapping, and saved alignment',()=>{
  for(const [id,m]of Object.entries(hardware)){
    if(!m.previewCalibrated&&!m.photo)continue;
    const config={...defaults,model:id};
    assert.deepEqual(photoControls(config,{buttons:[],axes:[0,0,0,0]}),[]);
    const active=photoControls(config,{buttons:Array(19).fill(1),axes:[1,0,0,-1]});
    assert.equal(active.length,Object.keys(m.controls).length,id);
    for(const c of active){const r=controlRect(id,c.key);assert.equal(c.cx,r.left+r.width/2,id);assert.equal(c.cy,r.top+r.height/2,id);}
  }
  const config={...defaults,model:'scuf-infinity4ps',positions:{ls:[200,300]},buttonMap:{ls:25}};
  const buttons=Array(26).fill(0);buttons[25]=1;
  const [c]=photoControls(config,{buttons,axes:[]});
  assert.equal(c.key,'ls');assert.equal(c.cx,200+controlRect(config.model,'ls').width/2);
  assert.ok(c.shrink>0);
});
test('transparent edges interpolate without black color fringes',()=>{
  const source=new Uint8ClampedArray([255,100,50,255,0,0,0,0]);
  const c={cx:0,cy:0,rx:10,ry:10,dx:-.5,dy:0,shrink:0,brightness:0,power:2};
  assert.deepEqual([...deformPhoto(source,2,1,[c]).slice(0,4)],[255,100,50,128]);
});

import {createPhotoMotion} from '../public/photo-motion.js';
test('canvas adapter scales small artwork, switches models, and disables for uploaded images',()=>{
 const originalDocument=globalThis.document,originalRAF=globalThis.requestAnimationFrame;
 const pending=[],classes=new Set(),calls=[],events={};
 const ctx={clearRect(){},drawImage(...args){calls.push(args);},getImageData(){return {data:new Uint8ClampedArray(750*630*4)};},createImageData(){return {data:new Uint8ClampedArray(750*630*4)};},putImageData(){}};
 const canvas={setAttribute(){},getContext(){return ctx;}};
 globalThis.document={createElement(){return canvas;}};
 globalThis.requestAnimationFrame=fn=>{pending.push(fn);return pending.length;};
 const controller={classList:{toggle(key,on){if(on)classes.add(key);else classes.delete(key);},remove(key){classes.delete(key);}}};
 const image={src:'first.png',complete:true,naturalWidth:300,naturalHeight:200,after(){},addEventListener(name,fn){events[name]=fn;}};
 try{
  const renderer=createPhotoMotion(controller,image);
  renderer.configure({...defaults,model:'razer-wolverine-v2'});pending.shift()();
  assert.ok(classes.has('continuous-photo'));assert.deepEqual(calls[0].slice(1),[0,65,750,500]);
  image.src='second.png';image.complete=false;renderer.configure({...defaults,model:'hyperkin-duke'});pending.shift()();
  assert.equal(classes.has('continuous-photo'),false);
  image.complete=true;events.load();pending.shift()();assert.equal(calls.length,2);
  renderer.configure({...defaults,model:'hyperkin-duke',image:'/assets/custom.png'});pending.shift()();
  assert.equal(classes.has('continuous-photo'),false);
 }finally{globalThis.document=originalDocument;globalThis.requestAnimationFrame=originalRAF;}
});
test('photo controls retain accent, pop and ripple choices',()=>{
 const state={buttons:[1],axes:[]},config={...defaults,model:'razer-wolverine-v2',accent:'#ff8040'};
 assert.deepEqual(photoControls(config,state)[0].color,[255,128,64]);
 assert.ok(photoControls({...config,effect:'pop'},state)[0].shrink<0);
 assert.notEqual(photoControls({...config,effect:'ripple'},state,0)[0].brightness,photoControls({...config,effect:'ripple'},state,.2)[0].brightness);
});
