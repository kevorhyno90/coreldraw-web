import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

// Render 192x192
const resvg192 = new Resvg(svg, { fitTo: { mode: 'width', value: 192 } });
const pngData192 = resvg192.render();
const pngBuffer192 = pngData192.asPng();
fs.writeFileSync(path.resolve(__dirname, '../public/icon-192.png'), pngBuffer192);
console.log('Created public/icon-192.png (' + pngBuffer192.length + ' bytes)');

// Render 512x512
const resvg512 = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
const pngData512 = resvg512.render();
const pngBuffer512 = pngData512.asPng();
fs.writeFileSync(path.resolve(__dirname, '../public/icon-512.png'), pngBuffer512);
console.log('Created public/icon-512.png (' + pngBuffer512.length + ' bytes)');

// Render 180x180 for Apple touch icon
const resvg180 = new Resvg(svg, { fitTo: { mode: 'width', value: 180 } });
const pngData180 = resvg180.render();
const pngBuffer180 = pngData180.asPng();
fs.writeFileSync(path.resolve(__dirname, '../public/apple-touch-icon.png'), pngBuffer180);
console.log('Created public/apple-touch-icon.png (' + pngBuffer180.length + ' bytes)');

console.log('All PWA Desktop icons generated successfully!');
