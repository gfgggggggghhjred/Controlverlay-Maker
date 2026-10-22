import { defaults, axis, sanitizeConfig } from './core.js';
import { designCSS } from './design.js';
import { hardware,hardwareURL } from './hardware.js';
import {stickTravel,controlTravel} from './mechanics.js';
import {createPhotoMotion} from './photo-motion.js';
const controller = document.querySelector('#controller');
const controls = [...document.querySelectorAll('[data-control]')];
let config = {...defaults}, editing = false;
let lastModel = '';
// The generic placeholder shell is replaced by the selected hardware artwork.
document.querySelector('.shell-art')?.remove();
const hardwareImage=document.createElement('img');hardwareImage.className='hardware-art';hardwareImage.alt='';
const tint=document.createElement('div');tint.className='hardware-tint';
const screen=document.createElement('div');screen.className='deck-screen';
controller.prepend(screen);controller.prepend(tint);controller.prepend(hardwareImage);
const photoMotion=createPhotoMotion(controller,hardwareImage);
for(const [key,index,label] of [['home',16,'Home button'],['touch',17,'Touchpad click'],['capture',18,'Capture button'],['punch',5,'Third punch button'],['kick',7,'Third kick button']]){
  const el=document.createElement('div');el.className='extra-control';el.dataset.control=key;el.dataset.button=index;el.setAttribute('aria-label',label);controller.append(el);controls.push(el);
}
for(const el of controls){
  el.dataset.defaultButton=el.dataset.button;
  const piece=document.createElement('div');piece.className='moving-piece';piece.setAttribute('aria-hidden','true');
  if(el.classList.contains('stick')){
    piece.classList.add('stick-cap');
    if(config.model==='steam'&&el.dataset.control==='rs')piece.classList.add('trackpad');
  }
  if(el.classList.contains('trigger'))piece.classList.add('trigger-cap');
  el.prepend(piece);
}
const artNeeded=document.createElement('div');artNeeded.className='artwork-needed';controller.append(artNeeded);
function apply(value) {
  config = sanitizeConfig(value);
  const model=hardware[config.model];
  const needsArt=model.requiresArtwork&&!config.image&&!config.legacy;
  controller.className = `controller xbox ${config.model} ${config.effect} ${config.legacy ? 'legacy' : 'hardware'} ${config.image ? 'artwork' : ''} ${model.sourceArtwork&&!config.image?'source-art':''} ${!config.legacy&&!config.image&&!needsArt&&(!model.sourceArtwork||model.previewCalibrated)?'mechanical':''} ${model.previewCalibrated&&!config.image&&!config.legacy?'source-crops':''} ${needsArt?'needs-art':''} ${config.idleMotion ? 'idle' : ''} ${editing ? 'editing' : ''} ${config.originalColors ? '' : 'tinted'}`;
  hardwareImage.hidden=needsArt;
  if(lastModel!==config.model){const file=hardwareURL(config.model,true);if(file)hardwareImage.src=file;else hardwareImage.removeAttribute('src');lastModel=config.model;}
  artNeeded.hidden=!needsArt;
  artNeeded.replaceChildren();if(needsArt){const title=document.createElement('strong');title.textContent=model.name;const text=document.createElement('span');text.textContent='Upload front-facing artwork, then align the inputs.';artNeeded.append(title,text);}
  document.querySelector('.stick.right .moving-piece').classList.toggle('trackpad',config.model==='steam');
  const triggerLabels=model.labels[0]==='×'?['L2','R2']:model.labels[0]==='B'?['ZL','ZR']:['LT','RT'];
  document.querySelectorAll('.trigger-cap').forEach((el,i)=>el.textContent=triggerLabels[i]);
  hardwareImage.alt=model.name+' controller';
  photoMotion.configure(config);
  for(const el of controls){el.hidden=needsArt||(!config.legacy&&!model.controls[el.dataset.control]);el.dataset.button=config.buttonMap[el.dataset.control]??el.dataset.defaultButton;}
  document.querySelector('#designStyle').textContent = designCSS({...config, customCSS:''});
  document.querySelector('#legacyStyle').textContent = config.legacy ? config.customCSS : '';
  const img = document.querySelector('.uploaded-art');
  img.hidden = !config.image;
  if (config.image && img.getAttribute('src') !== config.image) img.src = config.image;
  ['a','b','x','y'].forEach((name,i) => document.querySelector(`.${name} span`).textContent = model.labels[i]);
  for(const el of controls){const index=Number(el.dataset.button);if(index<4)el.setAttribute('aria-label',model.labels[index]+' button');}
}
function input(s) {
  photoMotion.input(s);
  for (const el of controls) {
    const value = s.buttons?.[Number(el.dataset.button)] || 0;
    el.classList.toggle('pressed', value > .1);
    el.style.setProperty('--value', value);
    const travel=controlTravel(value);
    el.style.setProperty('--trigger-y',travel.triggerY+'px');
    el.style.setProperty('--trigger-scale',travel.triggerScale);
    el.style.setProperty('--button-y',travel.buttonY+'px');
    el.style.setProperty('--button-scale',travel.buttonScale);
    if (config.legacy && el.classList.contains('trigger')) el.style.opacity = value;
    else if (el.classList.contains('trigger')) el.style.opacity = '';
  }
  for (const [i, el] of [document.querySelector('.stick.left'),document.querySelector('.stick.right')].entries()) {
    const travel=stickTravel(s.axes?.[i*2],s.axes?.[i*2+1],config.deadzone,hardware[config.model].previewCalibrated?Math.min(el.clientWidth,el.clientHeight)*.12:Math.max(9,el.clientWidth*.20));
    el.classList.toggle('moving',Math.abs(travel.x)+Math.abs(travel.y)>.01);
    if(!config.legacy&&!config.image&&(!hardware[config.model].sourceArtwork||hardware[config.model].previewCalibrated)){el.style.transform='';el.style.setProperty('--stick-x',travel.x+'px');el.style.setProperty('--stick-y',travel.y+'px');}
    else el.style.transform=`translate(${axis(s.axes?.[i*2],config.deadzone)*20}px,${axis(s.axes?.[i*2+1],config.deadzone)*20}px)`;
  }
}
let drag = null;
for (const el of controls) {
  el.addEventListener('pointerdown', e => {
    if (!editing || config.legacy) return;
    const style = getComputedStyle(el);
    drag = { el, x:e.clientX, y:e.clientY, left:parseFloat(style.left), top:parseFloat(style.top) };
    el.setPointerCapture(e.pointerId); e.preventDefault(); el.focus();
  });
  el.addEventListener('pointermove', e => {
    if (!drag || drag.el !== el) return;
    const left = Math.max(0, Math.min(700, drag.left + e.clientX-drag.x));
    const top = Math.max(0, Math.min(580, drag.top + e.clientY-drag.y));
    el.style.left = `${left}px`; el.style.top = `${top}px`;
    const adjusted={...config,positions:{...config.positions,[el.dataset.control]:[left,top]},customCSS:''};
    document.querySelector('#designStyle').textContent=designCSS(adjusted);
    photoMotion.configure(adjusted);
  });
  const finish = () => {
    if (!drag || drag.el !== el) return;
    const pos=[parseFloat(el.style.left || drag.left),parseFloat(el.style.top || drag.top)];
    el.style.left=''; el.style.top='';
    parent.postMessage({ type:'position', key:el.dataset.control, pos }, location.origin);
    drag = null;
  };
  el.addEventListener('pointerup', finish); el.addEventListener('pointercancel', finish);
  el.addEventListener('keydown', e => {
    if (!editing || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    e.preventDefault(); const step = e.shiftKey ? 10 : 1, style = getComputedStyle(el);
    const pos = [parseFloat(style.left)+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),parseFloat(style.top)+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)];
    parent.postMessage({type:'position',key:el.dataset.control,pos},location.origin);
  });
}
window.addEventListener('message', e => {
  if (e.origin !== location.origin || e.source !== parent) return;
  if (e.data.type === 'config') apply(e.data.value);
  if (e.data.type === 'input') input(e.data.value);
  if (e.data.type === 'editing') {
    editing = e.data.value; controller.classList.toggle('editing', editing);
    for (const el of controls) el.tabIndex = editing ? 0 : -1;
  }
});
apply(config);
if (window === parent) {
  const source = new EventSource('/events');
  source.addEventListener('config', e => { const c=JSON.parse(e.data); if(c) apply(c); });
  source.addEventListener('input', e => input(JSON.parse(e.data)));
  source.onerror = () => input({buttons:[],axes:[]});
} else parent.postMessage({type:'ready'}, location.origin);

