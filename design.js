import { normalizeCSS } from './core.js';
import { hardwareCSS } from './hardware.js';
import { mechanicsCSS } from './mechanics.js';
export function designCSS(c, absolute = false) {
  let css = `:root { --accent: ${c.accent}; --shell: ${c.shell}; --strength: ${c.strength / 100}; }\n`;
  css += `/* ${c.model} layout · ${c.effect} animation */\n`;
  if(!c.legacy) {css += hardwareCSS(c.model);if(!c.image)css+=mechanicsCSS(c.model,c.positions);}
  for (const [key, pos] of Object.entries(c.positions)) {
    if (!/^[a-z]+$/.test(key) || !Array.isArray(pos)) continue;
    css += `.controller [data-control="${key}"] { left: ${Math.max(0, Math.min(700, Number(pos[0]) || 0))}px; top: ${Math.max(0, Math.min(580, Number(pos[1]) || 0))}px; }\n`;
  }
  if (c.image) {
    const src = absolute ? new URL(c.image, location.origin).href : c.image;
    css += `.controller .uploaded-art { content: url("${src}"); object-fit: ${c.artworkFit}; }\n`;
  }
  if (c.legacy) css += normalizeCSS(c.customCSS);
  if(absolute) css=css.replaceAll('url("/hardware/',`url("${location.origin}/hardware/`);
  return css;
}
export function obsCSS(c) {
  // OBS custom CSS styles its top-level document, not an iframe.
  return `/* Controlverlay Maker — paste in your OBS Browser Source Custom CSS.\nUse with ${location.origin}/overlay. Keep the local app running.\nYour current design is saved locally and also loaded automatically. */\nhtml, body { background: rgba(0,0,0,0) !important; margin: 0; overflow: hidden; }\n` + designCSS(c, true);
}
