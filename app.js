import { defaults, palettes, normalizeCSS, sanitizeConfig } from './core.js';
import { obsCSS } from './design.js';
import { hardware,modelFromDevice,hardwareURL } from './hardware.js';
const $ = id => document.getElementById(id);
// Use specific hardware models rather than a generic left/right stick layout.
$('model').replaceChildren();
for(const brand of [...new Set(Object.values(hardware).map(m=>m.brand))]){
  const group=document.createElement('optgroup');group.label=brand;
  for(const [key,m] of Object.entries(hardware).filter(([,m])=>m.brand===brand)){
    const option=document.createElement('option');option.value=key;option.textContent=m.name+(m.requiresArtwork?' · artwork pending':m.generatedArtwork?' · generated preview':m.preparedArtwork?' · prepared preview':m.sourceArtwork?' · artwork preview':'');group.append(option);
  }
  $('model').append(group);
}
const hardwareOptions=document.createElement('div');
hardwareOptions.innerHTML='<label class="check"><input type="checkbox" id="originalColors" checked> Keep original hardware colors</label><p class="muted" id="hardwareNote"></p><details class="controller-library"><summary>Browse controller &amp; fight-pad library</summary><label class="field">Search controllers<input id="controllerSearch" type="search" placeholder="Brand, model, or generation"></label><label class="field">Show<select id="catalogFilter"><option value="all">All models</option><option value="ready">Artwork included</option><option value="fight">Fight pads</option><option value="upload">Artwork upload profiles</option></select></label><p class="muted" id="catalogCount"></p><div id="hardwareLibrary"></div></details>';
$('model').closest('label').after(hardwareOptions);
for(const [key,m] of Object.entries(hardware)){
  const button=document.createElement('button');button.type='button';button.dataset.hardware=key;
  const img=document.createElement('img');const file=hardwareURL(key);if(file)img.src=file;img.alt='';img.loading='lazy';img.hidden=!file;
  const name=document.createElement('span');name.textContent=m.name;
  if(key==='steamdeck'){const wrap=document.createElement('span');wrap.className='deckThumb';wrap.append(img);button.append(wrap,name);}else button.append(img,name);
  button.onclick=()=>{$('model').value=key;$('model').dispatchEvent(new Event('input',{bubbles:true}));};
  const status=document.createElement('small');status.textContent=m.requiresArtwork?'Artwork pending':m.generatedArtwork?'Generated · review':m.preparedArtwork?'Prepared · live inputs':m.sourceArtwork?'Preview · align inputs':'Artwork included';button.append(status);
  $('hardwareLibrary').append(button);
}
function filterCatalog(){let shown=0;const query=$('controllerSearch').value.toLowerCase(),filter=$('catalogFilter').value;for(const el of document.querySelectorAll('[data-hardware]')){const m=hardware[el.dataset.hardware];const visible=m.name.toLowerCase().includes(query)&&(filter==='all'||filter==='ready'&&!m.requiresArtwork||filter==='upload'&&m.requiresArtwork||filter==='fight'&&m.type?.startsWith('fightpad'));el.hidden=!visible;if(visible)shown++;}$('catalogCount').textContent=`${shown} shown · ${Object.values(hardware).filter(m=>!m.requiresArtwork).length} designs have artwork included`;}
$('controllerSearch').oninput=filterCatalog;$('catalogFilter').onchange=filterCatalog;filterCatalog();
const mapping=document.createElement('details');
mapping.innerHTML='<summary>Button mapping for your controller</summary><p class="muted">Select a control, click Learn, then press its physical button. Useful for fight pads and nonstandard devices.</p><label class="field">Input to map<select id="mappingControl"></select></label><button id="learnButton" class="wide">Learn button</button><p id="mappingStatus" class="muted" role="status"></p><button id="resetMapping" class="quiet wide">Reset button mapping</button>';
$('tab-motion').append(mapping);
let learning=null,lastRawButtons=[];
function refreshMapping(){const selected=$('mappingControl').value;$('mappingControl').replaceChildren();for(const key of Object.keys(hardware[config.model].controls)){const opt=document.createElement('option');opt.value=key;opt.textContent=key.toUpperCase()+(config.buttonMap[key]!==undefined?' → button '+config.buttonMap[key]:'');$('mappingControl').append(opt);}if(hardware[config.model].controls[selected])$('mappingControl').value=selected;}
$('learnButton').onclick=()=>{if(learning){learning=null;$('learnButton').textContent='Learn button';$('mappingStatus').textContent='Learning cancelled.';return;}learning=$('mappingControl').value;$('learnButton').textContent='Cancel learning';$('mappingStatus').textContent='Release other buttons, then press '+learning.toUpperCase()+'. Demo inputs are ignored.';};
$('resetMapping').onclick=()=>{config.buttonMap={};learning=null;$('learnButton').textContent='Learn button';$('mappingStatus').textContent='Button mapping reset.';changed();};
let config = {...defaults}, demo = false, editing = false, frameReady = false, saveTimer, toastTimer;
let saveVersion = 0, saveQueue = Promise.resolve();
const frame = document.createElement('iframe');
frame.id = 'controllerFrame'; frame.src = '/renderer.html'; frame.title = 'Live controller overlay preview';
$('controllerMount').append(frame);
function tell(type, value) { if(frameReady) frame.contentWindow.postMessage({type,value},location.origin); }
function toast(message) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').hidden=true,4000); }
function fit() {
  const rect=$('controllerMount').getBoundingClientRect();
  frame.style.transform=`scale(${Math.min((rect.width-35)/750,(rect.height-35)/630)})`;
}
new ResizeObserver(fit).observe($('controllerMount'));
window.addEventListener('message', e => {
  if(e.origin!==location.origin || e.source!==frame.contentWindow) return;
  if(e.data.type==='ready') { frameReady=true; tell('config',config); tell('editing',editing); fit(); }
  if(e.data.type==='position' && /^[a-z]+$/.test(e.data.key)) { config.positions={...config.positions,[e.data.key]:e.data.pos}; changed(); }
});
async function persist() {
  clearTimeout(saveTimer);
  const payload=JSON.stringify(config), version=++saveVersion;
  $('saveStatus').textContent='Saving…';
  saveQueue=saveQueue.catch(()=>{}).then(async()=>{
    const response=await fetch('/config',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
    if(!response.ok) throw new Error('save');
    if(version===saveVersion) $('saveStatus').textContent='Saved locally';
  });
  try { await saveQueue; return true; } catch { $('saveStatus').textContent='Save failed · server offline?'; return false; }
}
function changed() {
  config=sanitizeConfig(config); tell('config',config); refresh();
  $('saveStatus').textContent='Unsaved changes'; clearTimeout(saveTimer); saveTimer=setTimeout(persist,300);
}
function setEditing(value) {
  editing=value; tell('editing',value); $('align').setAttribute('aria-pressed',String(value));
  $('align').textContent=value?'✓ Finish aligning':'◎ Align input markers'; $('alignTip').hidden=!value;
}
function refresh() {
  for(const key of ['model','accent','shell','strength','artworkFit']) $(key).value=config[key];
  $('designName').value=config.name; $('customCSS').value=config.customCSS;
  $('deadzone').value=Math.round(config.deadzone*100); $('idleMotion').checked=config.idleMotion;
  $('strengthValue').textContent=config.strength+'%'; $('deadzoneValue').textContent=Math.round(config.deadzone*100)+'%';
  $('originalColors').checked=config.originalColors;
  $('shell').disabled=config.originalColors;
  const model=hardware[config.model];
  const shoulders=model.labels[0]==='×'?['L1','R1','L2','R2']:model.labels[0]==='B'?['L','R','ZL','ZR']:['LB','RB','LT','RT'];
  monitorNames.splice(0,8,...model.labels,...shoulders);
  if($('inputMonitor').children.length) [...$('inputMonitor').children].forEach((el,i)=>el.textContent=monitorNames[i]);
  $('hardwareNote').textContent=model.name+(model.requiresArtwork?' · exact artwork match pending. Upload your own image to begin.':model.previewCalibrated?' · image-derived moving controls with initial alignment. '+model.artworkNote:model.generatedArtwork?' · generated approximation. '+model.artworkNote:model.sourceArtwork?' · source artwork preview. Open Your artwork → Align input markers before streaming. Background cleanup and separate moving parts are still pending.':' · front-facing artwork with moving controls.');
  refreshMapping();
  document.querySelectorAll('[data-hardware]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.hardware===config.model));
  $('artControls').hidden=(!config.image&&!model.sourceArtwork) || config.legacy;
  $('removeArt').hidden=!config.image;
  document.querySelectorAll('[data-preset]').forEach(el=>{const active=el.dataset.preset===config.theme&&!config.legacy;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',active);});
  document.querySelectorAll('[data-effect]').forEach(el=>{const active=el.dataset.effect===config.effect;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',active);});
  const css=$('exportCSS'); if(css) css.value=obsCSS(config);
}
for(const [key,palette] of Object.entries(palettes)) {
  const b=document.createElement('button'); b.className='preset'; b.dataset.preset=key;
  const swatch=document.createElement('span');swatch.className='swatch';swatch.style.setProperty('--swatch',palette.accent);
  b.append(swatch,document.createTextNode(({mint:'Matcha',ice:'Ice blue',ember:'Afterburn',rose:'Rose',ghost:'Ghost'})[key]));
  b.onclick=()=>{Object.assign(config,palette,{theme:key,legacy:false});changed();}; $('presets').append(b);
}
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{
  for(const tab of document.querySelectorAll('[data-tab]')) { const active=tab===button;tab.classList.toggle('selected',active);tab.setAttribute('aria-pressed',active);$('tab-'+tab.dataset.tab).hidden=!active; }
  if(button.dataset.tab!=='artwork') setEditing(false);
  if(button.dataset.tab!=='motion'){learning=null;$('learnButton').textContent='Learn button';}
});
for(const key of ['accent','shell','model','strength','artworkFit']) $(key).addEventListener('input',()=>{
  config[key]=key==='strength'?Number($(key).value):$(key).value;
  if(key==='model') {config.positions={};config.buttonMap={};config.modelChosen=true;learning=null;$('learnButton').textContent='Learn button';$('mappingStatus').textContent='';setEditing(false);if(hardware[config.model].requiresArtwork){config.image='';document.querySelector('[data-tab="artwork"]').click();toast('Upload front-facing artwork for this model, then align its inputs.');}}
  if(key==='accent'||key==='shell')config.theme='custom';
  config.legacy=false; changed();
});
$('designName').addEventListener('input',()=>{config.name=$('designName').value;changed();});
$('deadzone').oninput=()=>{config.deadzone=Number($('deadzone').value)/100;changed();};
$('idleMotion').onchange=()=>{config.idleMotion=$('idleMotion').checked;changed();};
$('originalColors').onchange=()=>{config.originalColors=$('originalColors').checked;changed();};
document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{config.effect=b.dataset.effect;changed();});
$('backgroundToggle').onclick=()=>$('preview').classList.toggle('checker');
$('demo').onclick=()=>{demo=!demo;$('demo').setAttribute('aria-pressed',demo);$('demo').textContent=demo?'Ⅱ Stop demo':'▷ Try animation';};
$('align').onclick=()=>setEditing(!editing);
$('resetPositions').onclick=()=>{config.positions={};changed();};
$('removeArt').onclick=()=>{config.image='';$('artFile').value='';$('uploadStatus').textContent='';setEditing(false);changed();};
$('artFile').onchange=async()=>{
  const file=$('artFile').files[0];if(!file)return;
  if(file.size>16*1024*1024) {toast('Choose an image under 16 MB.');return;}
  $('uploadStatus').textContent='Uploading your artwork…';
  try {
    const response=await fetch('/upload',{method:'POST',body:file});
    if(!response.ok)throw new Error(await response.text());
    const data=await response.json(); config.image=data.url;config.legacy=false;
    $('uploadStatus').textContent=`${file.name} · ready. Align the markers to match your artwork.`;
    changed();setEditing(true);
  }catch(error){$('uploadStatus').textContent=error.message||'Upload failed. Is the local server running?';}
};
$('applyCSS').onclick=()=>{
  const css=normalizeCSS($('customCSS').value);
  if(!css.trim()){toast('Paste a CSS skin first.');return;}
  config.customCSS=css;config.legacy=true;setEditing(false);changed();toast('CSS skin applied. External images need internet access.');
};
$('clearCSS').onclick=()=>{config.legacy=false;changed();};
$('exampleSkin').onclick=async()=>{
  try {const r=await fetch('/original-skin.css');if(!r.ok)throw new Error();config.customCSS=await r.text();config.legacy=true;config.model='xbox';setEditing(false);changed();toast('Your original animated skin is loaded.');}
  catch{toast('Could not load the original skin.');}
};
let saved=[];
try{saved=JSON.parse(localStorage.getItem('cv-designs')||'[]');if(!Array.isArray(saved))saved=[];}catch{}
function savedList(){
  $('savedDesigns').replaceChildren();
  saved.forEach((c,i)=>{
    const row=document.createElement('div');row.className='saved-row';
    const load=document.createElement('button');load.textContent=c.name||'Untitled design';load.onclick=()=>{config=sanitizeConfig(structuredClone(c));setEditing(false);changed();toast('Design loaded.');};
    const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',`Delete preset ${c.name}`);remove.onclick=()=>{saved.splice(i,1);try{localStorage.setItem('cv-designs',JSON.stringify(saved));}catch{}savedList();};
    row.append(load,remove);$('savedDesigns').append(row);
  });
}
$('saveDesign').onclick=()=>{
  if(saved.length>=20){toast('You can save up to 20 designs. Remove one to make room.');return;}
  saved.push(structuredClone(config));
  try{localStorage.setItem('cv-designs',JSON.stringify(saved));savedList();toast('Saved to your presets on this computer.');}catch{saved.pop();toast('Browser storage is full.');}
};savedList();
// Exported CSS is applied directly to the top-level transparent renderer in OBS.
const exportBlock=document.createElement('section');
exportBlock.innerHTML='<label class="field">Custom CSS for OBS<textarea id="exportCSS" readonly rows="5" aria-label="Generated custom CSS"></textarea></label><div class="copy-row"><button id="copyCSS" class="primary">Copy custom CSS</button><button id="downloadCSS">Download .css</button></div><p class="muted">Paste into the Browser Source’s Custom CSS field, then click OK. This CSS works with the Controlverlay source URL above.</p>';
$('setupDialog').insertBefore(exportBlock,$('openOverlay'));
const copy=async(text,message)=>{try{await navigator.clipboard.writeText(text);toast(message);}catch{toast('Clipboard unavailable. Select the field and copy it manually.');}};
$('copyURL').onclick=()=>copy($('overlayURL').value,'Browser Source URL copied.');
$('copyCSS').onclick=async()=>{if(await persist())copy(obsCSS(config),'Custom CSS copied. Paste it into your OBS source properties.');else toast('Start the local server before exporting.');};
$('downloadCSS').onclick=()=>{
  const url=URL.createObjectURL(new Blob([obsCSS(config)],{type:'text/css'}));const a=document.createElement('a');a.href=url;a.download='controlverlay-overlay.css';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
async function setup(){
  if(!await persist()){toast('Could not save your overlay. Check that the server is running.');return;}
  $('overlayURL').value=location.origin+'/overlay';refresh();$('setupDialog').showModal();
}
for(const id of ['setupTop','help'])$(id).onclick=setup;
// Keep only one input request in flight, so slow networks never accumulate frames.
let busy=false,lastSend=0,lastStatus='',gamepadAutoSelected=false;
const monitorNames=['A','B','X','Y','LB','RB','LT','RT'];
for(const name of monitorNames){const el=document.createElement('span');el.className='input-pill';el.textContent=name;$('inputMonitor').append(el);}
function tick(time){
  requestAnimationFrame(tick);
  let pad;
  try{const pads=[...(navigator.getGamepads?.()||[])];pad=pads.find(p=>p&&p.mapping==='standard')||pads.find(Boolean);}catch{}
  if(pad&&!gamepadAutoSelected){
    gamepadAutoSelected=true;
    const detected=modelFromDevice(pad.id);
    if(detected&&!config.modelChosen&&!config.image&&!config.legacy){config.model=detected;config.positions={};changed();}
  }
  const buttons=Array.from({length:64},(_,i)=>pad?.buttons[i]?.value||0),axes=Array.from({length:4},(_,i)=>pad?.axes[i]||0);
  if(learning&&pad){const index=buttons.findIndex((v,i)=>v>.5&&(lastRawButtons[i]||0)<=.5);if(index>=0){config.buttonMap={...config.buttonMap,[learning]:index};$('mappingStatus').textContent=learning.toUpperCase()+' learned as button '+index+'.';learning=null;$('learnButton').textContent='Learn button';changed();}}
  lastRawButtons=buttons.slice();
  if(demo){const k=Math.floor(time/360)%16;buttons[k]=1;buttons[6]=(Math.sin(time/700)+1)/2;buttons[7]=(Math.cos(time/900)+1)/2;axes[0]=Math.sin(time/850)*.8;axes[1]=Math.cos(time/850)*.8;axes[2]=Math.sin(time/1200)*.65;axes[3]=Math.cos(time/1000)*.65;}
  const input={buttons,axes,connected:!!pad||demo};tell('input',input);
  const status=demo?'Demo animation running':pad?pad.id:'No controller yet';
  if(status!==lastStatus){lastStatus=status;$('connection').textContent=status.length>45?status.slice(0,45)+'…':status;$('connection').title=status;$('connectionDot').classList.toggle('connected',!!pad||demo);$('connectionHelp').textContent=demo?'Demo inputs are also sent to OBS. Stop before streaming.':pad?'Connected · keep this tab visible while streaming.':'Plug in a gamepad, then press a button.';}
  [...$('inputMonitor').children].forEach((el,i)=>el.classList.toggle('on',buttons[i]>.1));
  const pressed=buttons.map((v,i)=>v>.1?(monitorNames[i]||['Back','Start','L3','R3','↑','↓','←','→','Home'][i-8]):'').filter(Boolean);
  $('inputLabel').textContent=pressed.join(' + ')||'Waiting for input';
  if(time-lastSend>=33&&!busy){
    lastSend=time;busy=true;
    fetch('/input',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
      .then(r=>{$('bridgeStatus').textContent=r.ok?'Local bridge active':'Local bridge unavailable';})
      .catch(()=>{$('bridgeStatus').textContent='Bridge offline · restart local server';})
      .finally(()=>busy=false);
  }
}
try {const response=await fetch('/config');const c=await response.json();if(c)config=sanitizeConfig(c);}catch{toast('Could not reach the local server.');}
refresh();tell('config',config);requestAnimationFrame(tick);


