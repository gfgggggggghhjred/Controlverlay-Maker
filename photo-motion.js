import {hardware, controlRect} from './hardware.js';
import {stickTravel} from './mechanics.js';

export const inputButtons={a:0,b:1,x:2,y:3,lb:4,rb:5,lt:6,rt:7,back:8,start:9,ls:10,rs:11,up:12,down:13,left:14,right:15,home:16,touch:17,capture:18,punch:5,kick:7};

// One continuous image, rather than a translated disc over a stationary copy
// of the same stick. Displacement falls smoothly to zero at the socket edge.
export function photoControls(config,state,time=0){
  const model=hardware[config.model];
  if(!(model?.previewCalibrated||model?.photo)||config.image||config.legacy)return [];
  const result=[];
  for(const key of Object.keys(model.controls)){
    const rect=controlRect(config.model,key),pos=config.positions?.[key];
    if(Array.isArray(pos)){rect.left=Math.max(0,Math.min(700,Number(pos[0])||0));rect.top=Math.max(0,Math.min(580,Number(pos[1])||0));}
    const value=Math.max(0,Math.min(1,Number(state.buttons?.[config.buttonMap?.[key]??inputButtons[key]])||0));
    const stick=key==='ls'||key==='rs',trigger=key==='lt'||key==='rt';
    const axis=key==='rs'?2:0;
    const travel=stick?stickTravel(state.axes?.[axis],state.axes?.[axis+1],config.deadzone,Math.min(rect.width,rect.height)*.12):{x:0,y:0};
    if(!value&&!travel.x&&!travel.y)continue;
    const extent=stick?.72:.68,strength=config.strength/100;
    const pulse=config.effect==='ripple'?.55+.45*Math.cos(time*9):1;
    const accent=/^#[0-9a-f]{6}$/i.test(config.accent||'')?config.accent:'#ffffff';
    result.push({key,cx:rect.left+rect.width/2,cy:rect.top+rect.height/2,
      rx:rect.width*extent,ry:rect.height*extent,
      dx:travel.x,dy:travel.y+value*Math.min(trigger?3:1.5,rect.height*.08),
      shrink:value*(trigger?.10:config.effect==='pop'?-.05*strength:.035),brightness:value*strength*.15*pulse,
      tint:value*strength*.16*pulse,color:[1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)),
      power:['up','down','left','right','touch','lt','rt','lb','rb'].includes(key)?4:2});
  }
  return result;
}

export function influence(x,y,c){
  const u=Math.abs((x-c.cx)/c.rx),v=Math.abs((y-c.cy)/c.ry);
  const r=c.power===4?Math.pow(u**4+v**4,.25):Math.hypot(u,v);
  if(r>=1)return 0;
  if(r<=.64)return 1;
  const t=(r-.64)/.36;
  return 1-t*t*(3-2*t);
}

// Pure pixel routine shared by the browser and the offline motion audit.
// Combine overlapping inputs before sampling, so one button cannot erase
// another input's animation. Unaffected pixels remain byte-for-byte intact.
export function deformPhoto(source,width,height,controls,output=new Uint8ClampedArray(source.length)){
  output.set(source);
  if(!controls.length)return output;
  const rows=new Map();
  for(const c of controls){
    const x0=Math.max(0,Math.floor(c.cx-c.rx)),x1=Math.min(width-1,Math.ceil(c.cx+c.rx));
    for(let y=Math.max(0,Math.floor(c.cy-c.ry));y<=Math.min(height-1,Math.ceil(c.cy+c.ry));y++){
      if(!rows.has(y))rows.set(y,[]);
      rows.get(y).push([x0,x1,c]);
    }
  }
  for(const [y,spans]of rows){
    const lo=Math.min(...spans.map(s=>s[0])),hi=Math.max(...spans.map(s=>s[1]));
    for(let x=lo;x<=hi;x++){
      let dx=0,dy=0,bright=0,weight=0,tint=0,red=0,green=0,blue=0;
      for(const [a,b,c]of spans){
        if(x<a||x>b)continue;
        const f=influence(x,y,c);if(!f)continue;
        const scale=1/(1-c.shrink)-1;
        dx+=f*((x-c.cx)*scale-c.dx);dy+=f*((y-c.cy)*scale-c.dy);
        bright+=f*c.brightness;weight+=f;
        const mix=f*(c.tint||0);tint+=mix;
        if(mix){red+=mix*c.color[0];green+=mix*c.color[1];blue+=mix*c.color[2];}
      }
      if(!weight)continue;
      const sx=Math.max(0,Math.min(width-1,x+dx)),sy=Math.max(0,Math.min(height-1,y+dy));
      const ix=Math.floor(sx),iy=Math.floor(sy),tx=sx-ix,ty=sy-iy;
      const indices=[(iy*width+ix)*4,(iy*width+Math.min(width-1,ix+1))*4,(Math.min(height-1,iy+1)*width+ix)*4,(Math.min(height-1,iy+1)*width+Math.min(width-1,ix+1))*4];
      const weights=[(1-tx)*(1-ty),tx*(1-ty),(1-tx)*ty,tx*ty];
      let alpha=0;for(let j=0;j<4;j++)alpha+=source[indices[j]+3]*weights[j];
      const dest=(y*width+x)*4;output[dest+3]=alpha;
      // Premultiplied interpolation prevents dark fringes on transparent edges.
      for(let channel=0;channel<3;channel++){
        let sum=0;for(let j=0;j<4;j++)sum+=source[indices[j]+channel]*source[indices[j]+3]*weights[j];
        const light=alpha?sum/alpha*(1+Math.min(.35,bright)):0;
        output[dest+channel]=light*(1-Math.min(.35,tint))+(tint?([red,green,blue][channel]/tint)*Math.min(.35,tint):0);
      }
    }
  }
  return output;
}

export function createPhotoMotion(controller,image){
  const canvas=document.createElement('canvas');canvas.width=750;canvas.height=630;
  canvas.className='photo-motion';canvas.setAttribute('aria-hidden','true');image.after(canvas);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  let config={},state={},source=null,frame=null,request=0,loadedURL='';
  const enabled=()=>(hardware[config.model]?.previewCalibrated||hardware[config.model]?.photo)&&!config.image&&!config.legacy;
  function prepare(){
    if(!ctx||!enabled()||!image.complete||!image.naturalWidth)return false;
    if(loadedURL===image.src&&source)return true;
    const scale=Math.min(750/image.naturalWidth,630/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    try{
      ctx.clearRect(0,0,750,630);ctx.drawImage(image,(750-w)/2,(630-h)/2,w,h);
      source=ctx.getImageData(0,0,750,630);frame=ctx.createImageData(750,630);loadedURL=image.src;
      return true;
    }catch{source=null;return false;}
  }
  function draw(){
    request=0;const ready=prepare();controller.classList.toggle('continuous-photo',ready);
    if(!ready)return;
    deformPhoto(source.data,750,630,photoControls(config,state,performance.now()/1000),frame.data);ctx.putImageData(frame,0,0);
  }
  function schedule(){if(!request)request=requestAnimationFrame(draw);}
  image.addEventListener('load',schedule);
  image.addEventListener('error',()=>{source=null;loadedURL='';controller.classList.remove('continuous-photo');});
  return {configure(value){config=value;schedule();},input(value){state=value;schedule();}};
}
