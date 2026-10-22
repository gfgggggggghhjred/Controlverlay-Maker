import {hardware,controlRect,hardwareURL} from './hardware.js';
import {axis} from './core.js';

// The view is fixed on the controller face: the shell never tilts in response to input.
// All travel is local to the moving control inside a stationary socket.
export function stickTravel(x,y,deadzone=0.12,radius=20){
  let ax=axis(x,deadzone),ay=axis(y,deadzone);
  const length=Math.hypot(ax,ay);
  if(length>1){ax/=length;ay/=length;}
  return {x:ax*radius,y:ay*radius};
}
export function controlTravel(value){
  const pull=Math.max(0,Math.min(1,Number(value)||0));
  return {pull,triggerY:pull*9,triggerScale:1-pull*.18,buttonY:pull*2.5,buttonScale:1-pull*.07};
}
export function mechanicsCSS(model,positions={}){
  const m=hardware[model]||hardware.xbox;
  if(m.requiresArtwork||(m.sourceArtwork&&!m.previewCalibrated))return '';
  const scale=Math.min(750/m.width,630/m.height),w=m.width*scale,h=m.height*scale,ox=(750-w)/2,oy=(630-h)/2;
  const file=hardwareURL(model,true);
  let css=`.mechanical .hardware-art {content:url("${file}");}\n.mechanical .hardware-tint {mask-image:url("${file}");-webkit-mask-image:url("${file}");}\n`;
  for(const key of Object.keys(m.controls)){
    const rect=controlRect(model,key);
    const pos=positions[key];
    if(Array.isArray(pos)){rect.left=Math.max(0,Math.min(700,Number(pos[0])||0));rect.top=Math.max(0,Math.min(580,Number(pos[1])||0));}
    if(!m.previewCalibrated&&['ls','rs','lt','rt'].includes(key))continue;
    css+=`.mechanical [data-control="${key}"] .moving-piece {background-image:url("${file}");background-size:${w}px ${h}px;background-position:${ox-rect.left}px ${oy-rect.top}px;}\n`;
  }
  return css;
}
