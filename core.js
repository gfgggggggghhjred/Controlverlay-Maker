import {hardware} from './hardware.js';
export const defaults = {
  name: 'My animated overlay', model: 'xbox', theme: 'mint', accent: '#a5f36c', shell: '#202c29',
  effect: 'glow', strength: 65, deadzone: 0.12, image: '', artworkFit: 'contain',
  positions: {}, buttonMap:{}, customCSS: '', legacy: false, idleMotion: true, originalColors: true, modelChosen: false
};
export const palettes = {
  mint: { accent: '#a5f36c', shell: '#202c29' },
  ice: { accent: '#79d9ff', shell: '#192e3f' },
  ember: { accent: '#ff9b60', shell: '#3e2520' },
  rose: { accent: '#ff8fa9', shell: '#38232e' },
  ghost: { accent: '#e5e9e3', shell: '#333838' }
};
export function normalizeCSS(css) {
  return css.replace(/&#x20;|&nbsp;/gi, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/(?:www\.)?imgur\.com\/([A-Za-z0-9]+\.(?:gif|png|webp))/gi, 'https://i.imgur.com/$1');
}
export function axis(value, deadzone) {
  const n = Number(value) || 0;
  return Math.abs(n) < deadzone ? 0 : Math.sign(n) * Math.min(1, (Math.abs(n) - deadzone) / (1 - deadzone));
}
export function sanitizeConfig(value) {
  const c = { ...defaults, ...value };
  if(c.model==='playstation')c.model='dualsense';
  c.model = Object.hasOwn(hardware,c.model) ? c.model : 'xbox';
  c.effect = ['glow', 'pop', 'ripple'].includes(c.effect) ? c.effect : 'glow';
  for (const key of ['accent','shell']) if (!/^#[a-f0-9]{6}$/i.test(c[key])) c[key] = defaults[key];
  c.deadzone = Math.max(0, Math.min(.5, Number.isFinite(Number(c.deadzone)) ? Number(c.deadzone) : .12));
  c.strength = Math.max(0, Math.min(100, Number(c.strength) || 0));
  c.image = typeof c.image === 'string' && /^\/assets\/[a-f0-9-]+\.(gif|png|webp)$/.test(c.image) ? c.image : '';
  c.artworkFit = c.artworkFit === 'fill' ? 'fill' : 'contain';
  c.customCSS = typeof c.customCSS === 'string' ? c.customCSS.slice(0,100000) : '';
  c.positions = c.positions && typeof c.positions === 'object' ? c.positions : {};
  c.buttonMap=Object.fromEntries(Object.entries(c.buttonMap&&typeof c.buttonMap==='object'?c.buttonMap:{}).filter(([key,index])=>/^[a-z]+$/.test(key)&&Number.isInteger(index)&&index>=0&&index<64));
  return c;
}
