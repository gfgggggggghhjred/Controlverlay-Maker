// Hardware artwork: Gamepad Asset Pack by Al. Lopez (AL2009man).
// Source paths and upstream MIT license are retained in hardware/.
// Centers/sizes are fractions of the artwork's original dimensions.
import {extraCatalog} from './catalog.js';
import {collectedArtwork} from './collected-artwork.js';
import {generatedArtwork} from './generated-artwork.js';
import {reviewedArtwork} from './reviewed-artwork.js';
import {preparedArtwork} from './prepared-artwork.js';
const psLabels=['×','○','□','△'];
const xboxLabels=['A','B','X','Y'];
const nintendoLabels=['B','A','Y','X'];
const standard=(ls,rs,face,dpad,system,triggers)=>{
  const [fx,fy,spacing=.07]=face, [dx,dy,ds=.045]=dpad;
  return {
    ls:[...ls,.15,.20],rs:[...rs,.15,.20],
    a:[fx,fy+spacing,.069,.095],b:[fx+spacing*.8,fy,.069,.095],x:[fx-spacing*.8,fy,.069,.095],y:[fx,fy-spacing,.069,.095],
    up:[dx,dy-ds,.055,.075],down:[dx,dy+ds,.055,.075],left:[dx-ds*.7,dy,.055,.075],right:[dx+ds*.7,dy,.055,.075],
    back:[system[0],system[2],.04,.055],start:[system[1],system[2],.04,.055],home:[.5,system[3]??system[2],.052,.07],
    lt:[triggers[0],triggers[2],.12,.09],rt:[triggers[1],triggers[2],.12,.09],
    lb:[triggers[0],triggers[3],.14,.075],rb:[triggers[1],triggers[3],.14,.075]
  };
};
export const hardware = {
  xbox:{name:'Xbox Series X|S',brand:'Xbox',asset:'xbox-series',width:1534,height:954,labels:xboxLabels,
    controls:standard([.229,.454],[.635,.713],[.772,.449,.11],[.371,.714,.055],[.43,.586,.448,.285],[.214,.786,.06,.17])},
  'xbox-one':{name:'Xbox One / One S',brand:'Xbox',asset:'xbox-one',width:1543,height:956,labels:xboxLabels,
    controls:standard([.225,.53],[.634,.79],[.779,.526,.11],[.354,.79,.052],[.422,.578,.525,.355],[.205,.795,.07,.19])},
  xbox360:{name:'Xbox 360',brand:'Xbox',asset:'xbox-360',width:1545,height:955,labels:xboxLabels,
    controls:standard([.191,.565],[.638,.804],[.808,.50,.105],[.346,.767,.055],[.39,.611,.507,.493],[.217,.783,.08,.19])},
  dualsense:{name:'PlayStation 5 · DualSense',brand:'PlayStation',asset:'dualsense',width:1467,height:816,labels:psLabels,
    controls:{...standard([.337,.786],[.666,.786],[.821,.526,.114],[.178,.53,.083],[.257,.747,.345,.705],[.18,.82,.06,.155]),
      a:[.821,.636,.067,.10],b:[.899,.524,.067,.10],x:[.746,.527,.067,.10],y:[.825,.411,.067,.10],
      touch:[.5,.37,.39,.35],home:[.502,.705,.065,.07]}},
  dualshock4:{name:'PlayStation 4 · DualShock 4',brand:'PlayStation',asset:'dualshock4',width:1466,height:783,labels:psLabels,
    controls:{...standard([.343,.755],[.655,.755],[.8,.507,.111],[.198,.507,.085],[.302,.695,.352,.72],[.2,.8,.055,.15]),
      touch:[.5,.38,.30,.30]}},
  'switch-pro':{name:'Nintendo Switch Pro',brand:'Nintendo',asset:'switch-pro',width:1485,height:1079,labels:nintendoLabels,
    controls:{...standard([.226,.316],[.628,.514],[.77,.321,.095],[.346,.509,.05],[.379,.621,.216,.32],[.24,.76,.035,.105]),
      home:[.567,.32,.045,.06],capture:[.433,.32,.045,.06]}},
  joycon:{name:'Nintendo Switch · Joy-Con grip',brand:'Nintendo',asset:'joycon-grip',width:1284,height:929,labels:nintendoLabels,
    controls:{...standard([.247,.276],[.754,.548],[.755,.277,.071],[.247,.545,.071],[.318,.684,.126,.73],[.247,.754,.025,.065]),
      a:[.755,.347,.05,.069],b:[.81,.275,.05,.069],x:[.70,.275,.05,.069],y:[.755,.205,.05,.069],
      ls:[.247,.276,.12,.16],rs:[.754,.548,.12,.16],home:[.718,.731,.05,.069],capture:[.285,.731,.05,.069]}},
  steam:{name:'Valve Steam Controller',brand:'Valve',asset:'steam-controller',width:1466,height:1049,labels:xboxLabels,
    controls:{...standard([.39,.5],[.777,.30],[.614,.501,.075],[.223,.30,.06],[.415,.58,.29,.276],[.232,.768,.025,.07]),
      rs:[.777,.30,.24,.33]}},
  steamdeck:{name:'Valve Steam Deck',brand:'Valve',asset:'steam-deck',width:1860,height:758,labels:xboxLabels,
    controls:{...standard([.155,.225],[.843,.225],[.94,.184,.08],[.065,.175,.06],[.118,.88,.073,.71],[.12,.88,.025,.06]),
      a:[.94,.254,.024,.06],b:[.973,.174,.024,.06],x:[.907,.174,.024,.06],y:[.94,.094,.024,.06],
      ls:[.155,.225,.08,.20],rs:[.843,.225,.08,.20],
      up:[.064,.115,.03,.07],down:[.064,.235,.03,.07],left:[.04,.175,.03,.07],right:[.088,.175,.03,.07],
      home:[.13,.70,.045,.055],capture:[.868,.70,.045,.055]}}
};
const sixButton=(controls)=>({...controls,punch:[.85,.35,.065,.09],kick:[.90,.48,.065,.09]});
hardware['8bitdo-pro2']={name:'8BitDo Pro 2',brand:'8BitDo',asset:'8bitdo-pro2',file:'8bitdo-pro2-front.svg',shellFile:'8bitdo-pro2-front.svg',width:267,height:175,labels:nintendoLabels,photo:true,
  controls:standard([.356,.48],[.64,.48],[.775,.257,.108],[.225,.251,.065],[.45,.55,.245,.49],[.2,.8,.025,.05])};
hardware['8bitdo-ultimate']={name:'8BitDo Ultimate Bluetooth',brand:'8BitDo',asset:'8bitdo-ultimate',file:'8bitdo-ultimate-front.svg',shellFile:'8bitdo-ultimate-front.svg',width:235,height:175,labels:nintendoLabels,photo:true,
  controls:standard([.221,.217],[.655,.457],[.804,.246,.103],[.37,.463,.055],[.43,.58,.24,.13],[.2,.8,.025,.05])};
hardware['8bitdo-m30']={name:'8BitDo M30 Wired for Xbox',brand:'8BitDo',asset:'8bitdo-m30',file:'8bitdo-m30-front.svg',shellFile:'8bitdo-m30-front.svg',width:329,height:164,labels:xboxLabels,photo:true,type:'fightpad',
  controls:{...standard([.25,.45],[.65,.5],[.73,.42,.1],[.243,.439,.085],[.412,.573,.15,.277],[.20,.80,.025,.05]),
    ls:undefined,rs:undefined,a:[.672,.622,.078,.156],b:[.766,.506,.078,.156],x:[.638,.402,.061,.122],y:[.727,.311,.061,.122],punch:[.815,.262,.061,.122],kick:[.869,.451,.078,.156]}};
hardware['hori-octa']={name:'HORI Fighting Commander OCTA (PlayStation)',brand:'HORI',asset:'hori-octa',file:'hori-octa-front.svg',shellFile:'hori-octa-front.svg',width:460,height:300,labels:psLabels,photo:true,type:'fightpad-stick',
  controls:{...sixButton(standard([.326,.577],[.66,.7],[.77,.46,.1],[.187,.387,.08],[.302,.70,.197,.473],[.20,.80,.025,.07])),rs:undefined,
    ls:[.326,.577,.145,.222],a:[.735,.583,.073,.112],b:[.813,.48,.073,.112],x:[.674,.47,.073,.112],y:[.752,.363,.073,.112],punch:[.843,.293,.073,.112],kick:[.907,.413,.073,.112],touch:[.5,.237,.34,.28]}};
for(const m of Object.values(hardware))for(const key of Object.keys(m.controls))if(!m.controls[key])delete m.controls[key];
for(const [id,brand,title,type]of extraCatalog){
  const symmetric=type==='symmetric';
  let controls=structuredClone(hardware[symmetric?'dualsense':'xbox'].controls);
  if(type.startsWith('fightpad')){
    controls=sixButton(controls);delete controls.rs;
    if(type==='fightpad')delete controls.ls;
    Object.assign(controls,{a:[.61,.54,.08,.105],b:[.73,.54,.08,.105],x:[.61,.39,.08,.105],y:[.73,.39,.08,.105],punch:[.85,.39,.08,.105],kick:[.85,.54,.08,.105]});
  }
  hardware[id]={name:brand+' '+title,brand,width:750,height:630,labels:(id==='razer-raion'||id.startsWith('scuf-reflex'))?psLabels:xboxLabels,controls,requiresArtwork:true,type};
}
for(const [id,art] of Object.entries(collectedArtwork)){
  Object.assign(hardware[id],{file:art.file,shellFile:art.file,requiresArtwork:false,sourceArtwork:true,artworkNote:art.reviewNote});
}
for(const [id,art] of Object.entries(generatedArtwork)){
  Object.assign(hardware[id],{file:art.file,shellFile:art.file,width:art.width,height:art.height,requiresArtwork:false,sourceArtwork:true,generatedArtwork:true,variantPending:art.variantPending,artworkNote:art.reviewNote});
}
// The wireless PlayStation OCTA Pro has two analog sticks, unlike the wired OCTA.
hardware['hori-octa-pro'].dualSticks=true;
hardware['hori-octa-pro'].labels=psLabels;
hardware['hori-octa-pro'].controls.rs=[.59,.59,.12,.18];
hardware['hori-octa-pro'].controls.touch=[.50,.20,.32,.25];
hardware['8bitdo-sf30pro'].labels=nintendoLabels;
const generatedCenters={
 'razer-onza':{ls:[.25,.25],rs:[.64,.44],a:[.76,.32],b:[.825,.27],x:[.70,.27],y:[.76,.20],up:[.36,.40],down:[.36,.54],left:[.31,.47],right:[.41,.47],back:[.45,.65],start:[.55,.65],home:[.5,.28]},
 'gulikit-kingkong2-base':{ls:[.27,.39],rs:[.63,.52],a:[.735,.45],b:[.795,.39],x:[.67,.39],y:[.73,.33],up:[.405,.49],down:[.405,.585],left:[.36,.54],right:[.45,.54],back:[.40,.30],start:[.57,.30],home:[.565,.39]},
 'scuf-instinct-base':{ls:[.26,.28],rs:[.615,.475],a:[.745,.37],b:[.805,.28],x:[.68,.28],y:[.744,.19],up:[.375,.44],down:[.375,.57],left:[.33,.50],right:[.42,.50],back:[.43,.27],start:[.565,.27],home:[.5,.14]},
 'scuf-reflex-base':{ls:[.35,.45],rs:[.65,.45],a:[.79,.37],b:[.86,.285],x:[.72,.285],y:[.79,.20],up:[.22,.21],down:[.22,.34],left:[.17,.28],right:[.28,.28],back:[.295,.15],start:[.705,.15],home:[.50,.45],touch:[.50,.20]},
 '8bitdo-sf30pro':{ls:[.371,.696],rs:[.626,.696],a:[.785,.57],b:[.878,.43],x:[.696,.43],y:[.786,.30],up:[.216,.32],down:[.216,.52],left:[.166,.42],right:[.266,.42],back:[.415,.43],start:[.515,.43],home:[.785,.76]},
 'hori-octa-pro':{ls:[.32,.49],rs:[.59,.59],a:[.72,.53],b:[.80,.40],x:[.665,.405],y:[.74,.30],punch:[.83,.23],kick:[.89,.365],up:[.20,.25],down:[.20,.40],left:[.15,.32],right:[.25,.32],back:[.315,.14],start:[.685,.14],home:[.50,.40],touch:[.50,.20]}
};
for(const [id,centers]of Object.entries(generatedCenters))for(const [key,center]of Object.entries(centers)){
 const r=hardware[id].controls[key];if(r)hardware[id].controls[key]=[...center,...r.slice(2)];
}
for(const [id,art]of Object.entries(reviewedArtwork)){
 Object.assign(hardware[id],{file:art.file,shellFile:art.file,width:art.width,height:art.height,requiresArtwork:false,sourceArtwork:true,generatedArtwork:art.generated,previewCalibrated:true,artworkNote:art.reviewNote});
}
for(const id of ['razer-raiju','scuf-infinity4ps','hori-fc4'])hardware[id].labels=psLabels;
for(const id of ['8bitdo-ultimate2','8bitdo-pro3','gulikit-kk3-base'])hardware[id].labels=nintendoLabels;
hardware['razer-raiju'].type='symmetric';
const auditedCenters={
 'razer-raiju':{ls:[.355,.538],rs:[.653,.538],up:[.232,.348],down:[.232,.438],left:[.188,.394],right:[.276,.394],a:[.77,.458],b:[.833,.394],x:[.705,.394],y:[.77,.332],back:[.315,.30],start:[.685,.30],home:[.5,.542],touch:[.5,.335],lt:[.20,.215],rt:[.8,.215],lb:[.20,.245],rb:[.8,.245]},
 'hori-fc4':{up:[.217,.30],down:[.217,.47],left:[.167,.383],right:[.267,.383],a:[.72,.57],b:[.79,.46],x:[.657,.415],y:[.736,.32],punch:[.84,.26],kick:[.886,.41],back:[.445,.25],start:[.58,.25],home:[.511,.32],lt:[.22,.05],rt:[.75,.05],lb:[.25,.07],rb:[.73,.07]},
 '8bitdo-ultimate2':{ls:[.236,.304],rs:[.645,.52],up:[.361,.445],down:[.361,.56],left:[.315,.503],right:[.407,.503],a:[.78,.396],b:[.845,.313],x:[.708,.313],y:[.78,.216],back:[.37,.21],start:[.62,.21],home:[.50,.21],lt:[.22,.10],rt:[.78,.10],lb:[.22,.12],rb:[.78,.12]},
 '8bitdo-pro3':{ls:[.355,.49],rs:[.64,.49],up:[.23,.19],down:[.23,.34],left:[.18,.265],right:[.28,.265],a:[.78,.37],b:[.85,.26],x:[.70,.26],y:[.78,.15],back:[.45,.25],start:[.55,.25],home:[.78,.50],lt:[.23,.025],rt:[.77,.025],lb:[.23,.04],rb:[.77,.04]},
 'gamesir-g7pro':{ls:[.255,.335],rs:[.62,.48],up:[.375,.45],down:[.375,.55],left:[.33,.50],right:[.42,.50],a:[.74,.41],b:[.805,.35],x:[.675,.35],y:[.74,.29],back:[.39,.27],start:[.61,.27],home:[.50,.30],lt:[.24,.19],rt:[.76,.19],lb:[.24,.21],rb:[.76,.21]},
 'scuf-infinity4ps':{ls:[.336,.50],rs:[.648,.50],up:[.18,.20],down:[.18,.34],left:[.125,.27],right:[.235,.27],a:[.805,.354],b:[.89,.27],x:[.72,.27],y:[.805,.146],back:[.18,.12],start:[.70,.12],home:[.492,.50],touch:[.492,.20],lt:[.20,.04],rt:[.80,.04],lb:[.20,.06],rb:[.80,.06]},
 'gulikit-kk3-base':{ls:[.248,.28],rs:[.628,.52],up:[.371,.45],down:[.371,.59],left:[.32,.52],right:[.422,.52],a:[.752,.373],b:[.82,.293],x:[.686,.293],y:[.752,.20],back:[.381,.173],start:[.59,.173],home:[.571,.293],lt:[.22,.08],rt:[.78,.08],lb:[.22,.10],rb:[.78,.10]}
};
for(const [id,points]of Object.entries(auditedCenters)){
 const m=hardware[id];
 if(id==='razer-raiju'||id==='scuf-infinity4ps')m.controls.touch=[.5,.3,.30,.17];
 for(const [key,center]of Object.entries(points)){const r=m.controls[key];if(r)m.controls[key]=[...center,...r.slice(2)];}
 for(const key of ['ls','rs'])if(m.controls[key])m.controls[key][2]=.11;
}
// Prepared frames own their dimensions and control maps together. Never retain
// coordinates from the old 750x630 photo wrapper after trimming its canvas.
for(const [id,art]of Object.entries(preparedArtwork)){
 Object.assign(hardware[id],{file:art.file,shellFile:art.file,width:art.width,height:art.height,controls:structuredClone(art.controls),requiresArtwork:false,sourceArtwork:true,generatedArtwork:art.generated,previewCalibrated:true,preparedArtwork:true,artworkNote:art.reviewNote});
}
for(const id of ['razer-wolverine-v2pro','razer-raiju','razer-raiju-ultimate','razer-raiju-te','scuf-reflex','scuf-reflex-base','scuf-reflex-pro','scuf-impact','scuf-infinity4ps','nacon-r5','nacon-revolutionpro','nacon-revolutionpro1','nacon-revolutionunlimited','hori-fc4','hori-fc','razer-raion','hori-octa-pro','victrix-bfg','victrix-bfg-reloaded','victrix-bfg-fight','astro-c40','thrustmaster-eswappro','retrofighters-defender','hori-onyx','dualsense-edge','dualshock3'])hardware[id].labels=psLabels;
for(const id of ['8bitdo-ultimate2','8bitdo-ultimate2c','8bitdo-pro3','8bitdo-sn30pro','8bitdo-sf30pro','8bitdo-sn30proplus','gamesir-nova-base','gulikit-kingkong2','gulikit-kingkong2-base','gulikit-kk3','gulikit-kk3-base','gulikit-kk3-pro','hori-horipad'])hardware[id].labels=nintendoLabels;
hardware['logitech-rumblepad2'].labels=['2','3','1','4'];
export function hardwareURL(model,shell=false){
  const m=hardware[model]||hardware.xbox;
  return m.requiresArtwork?null:'/hardware/'+(shell?(m.shellFile||model+'-shell.png'):(m.file||m.asset+'.png'));
}
export function modelFromDevice(id='') {
  if(/dualsense|054c.*0ce6|054c.*0df2/i.test(id))return 'dualsense';
  if(/dualshock|wireless controller.*054c|054c.*05c4|054c.*09cc/i.test(id))return 'dualshock4';
  if(/joy.con/i.test(id))return 'joycon';
  if(/pro controller|057e.*2009/i.test(id))return 'switch-pro';
  if(/steam deck/i.test(id))return 'steamdeck';
  if(/steam controller|28de.*1102/i.test(id))return 'steam';
  if(/xbox.*360|045e.*028e/i.test(id))return 'xbox360';
  if(/xbox.*one/i.test(id))return 'xbox-one';
  if(/xbox|xinput|045e/i.test(id))return 'xbox';
  return null;
}
export function controlRect(model,key){
  const m=hardware[model]||hardware.xbox, r=m.controls[key];if(!r)return null;
  const scale=Math.min(750/m.width,630/m.height),w=m.width*scale,h=m.height*scale;
  let cx=r[0],cy=r[1],cw=r[2]*w,ch=r[3]*h;
  // Place circular, face-on caps over the shell's stick sockets, rather than
  // using the lower center of the former angled, baked-in thumbstick artwork.
  if(!m.previewCalibrated&&!m.photo&&(key==='ls'||key==='rs')){
    const mountY={xbox:[.427,.692],'xbox-one':[.504,.757],xbox360:[.531,.752],dualsense:[.735,.735],dualshock4:[.718,.718]};
    if(mountY[model])cy=mountY[model][key==='ls'?0:1];
    ch=cw;
  }
  // From the face, the triggers sit behind the shoulders instead of rising
  // above the controller as large angled rear-view illustrations.
  if(!m.previewCalibrated&&!m.photo&&(key==='lt'||key==='rt')){
    cy=({xbox:.085,'xbox-one':.14,xbox360:.145,dualsense:.12,dualshock4:.105,'switch-pro':.06,joycon:.025,steam:.04,steamdeck:.05})[model]??cy;
    ch=Math.min(24,h*.055);cw=Math.min(78,w*.12);
  }
  return {left:(750-w)/2+cx*w-cw/2,top:(630-h)/2+cy*h-ch/2,width:cw,height:ch};
}
export function hardwareCSS(model){
  const m=hardware[model]||hardware.xbox;
  let css=m.requiresArtwork?'':`.hardware .hardware-art { content:url("${hardwareURL(model)}"); }\n.hardware .hardware-tint { mask-image:url("${hardwareURL(model)}"); -webkit-mask-image:url("${hardwareURL(model)}"); }\n`;
  for(const key of Object.keys(m.controls)){
    const r=controlRect(model,key);
    css+=`.hardware [data-control="${key}"] {left:${r.left.toFixed(2)}px;top:${r.top.toFixed(2)}px;width:${r.width.toFixed(2)}px;height:${r.height.toFixed(2)}px;}\n`;
  }
  return css;
}
