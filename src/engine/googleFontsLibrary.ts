import { GoogleFontMeta } from '../types/coreldraw';

export const GOOGLE_FONTS_CATALOG: GoogleFontMeta[] = [
  // --- SANS-SERIF & GEOMETRIC MODERN ---
  { family: 'Inter', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'], isVariable: true, popularRank: 1, axes: { weight: [100, 900], slant: [-10, 0] } },
  { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'], isVariable: true, popularRank: 2, axes: { weight: [100, 900] } },
  { family: 'Montserrat', category: 'sans-serif', variants: ['200', '400', '600', '800'], isVariable: true, popularRank: 3, axes: { weight: [100, 900] } },
  { family: 'Poppins', category: 'sans-serif', variants: ['300', '400', '600', '700', '800'], isVariable: false, popularRank: 4 },
  { family: 'Outfit', category: 'sans-serif', variants: ['100', '300', '400', '600', '900'], isVariable: true, popularRank: 5, axes: { weight: [100, 900] } },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '600', '700', '800'], isVariable: true, popularRank: 6, axes: { weight: [300, 800] } },
  { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'], isVariable: false, popularRank: 7 },
  { family: 'Raleway', category: 'sans-serif', variants: ['100', '300', '400', '600', '900'], isVariable: true, popularRank: 8, axes: { weight: [100, 900] } },
  { family: 'Nunito', category: 'sans-serif', variants: ['200', '400', '600', '800', '900'], isVariable: true, popularRank: 9, axes: { weight: [200, 1000] } },
  { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'], isVariable: false, popularRank: 10 },
  { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '700', '900'], isVariable: true, popularRank: 11, axes: { weight: [300, 900] } },
  { family: 'Work Sans', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: true, popularRank: 12, axes: { weight: [100, 900] } },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '400', '600', '800'], isVariable: true, popularRank: 13, axes: { weight: [200, 800] } },
  { family: 'Space Grotesk', category: 'sans-serif', variants: ['300', '400', '600', '700'], isVariable: true, popularRank: 14, axes: { weight: [300, 700] } },
  { family: 'DM Sans', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: true, popularRank: 15, axes: { weight: [100, 1000] } },
  { family: 'Lexend', category: 'sans-serif', variants: ['100', '300', '500', '700', '900'], isVariable: true, popularRank: 16, axes: { weight: [100, 900] } },
  { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '600', '700'], isVariable: true, popularRank: 17, axes: { weight: [300, 700] } },
  { family: 'Barlow', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: false, popularRank: 18 },
  { family: 'Manrope', category: 'sans-serif', variants: ['200', '400', '600', '800'], isVariable: true, popularRank: 19, axes: { weight: [200, 800] } },
  { family: 'Sora', category: 'sans-serif', variants: ['100', '400', '600', '800'], isVariable: true, popularRank: 20, axes: { weight: [100, 800] } },
  { family: 'Cabin', category: 'sans-serif', variants: ['400', '600', '700'], isVariable: true, popularRank: 21 },
  { family: 'Comfortaa', category: 'sans-serif', variants: ['300', '500', '700'], isVariable: true, popularRank: 22 },
  { family: 'Josefin Sans', category: 'sans-serif', variants: ['100', '400', '700'], isVariable: true, popularRank: 23 },
  { family: 'Prompt', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: false, popularRank: 24 },
  { family: 'Kanit', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: false, popularRank: 25 },
  { family: 'Heebo', category: 'sans-serif', variants: ['100', '400', '700', '900'], isVariable: true, popularRank: 26 },

  // --- SERIF & EDITORIAL LUXURY ---
  { family: 'Playfair Display', category: 'serif', variants: ['400', '600', '700', '900'], isVariable: true, popularRank: 27, axes: { weight: [400, 900] } },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], isVariable: false, popularRank: 28 },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], isVariable: true, popularRank: 29, axes: { weight: [400, 700] } },
  { family: 'Cinzel', category: 'serif', variants: ['400', '600', '700', '900'], isVariable: true, popularRank: 30, axes: { weight: [400, 900] } },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '600', '700'], isVariable: false, popularRank: 31 },
  { family: 'Bodoni Moda', category: 'serif', variants: ['400', '600', '800', '900'], isVariable: true, popularRank: 32, axes: { weight: [400, 900] } },
  { family: 'Fraunces', category: 'serif', variants: ['100', '400', '700', '900'], isVariable: true, popularRank: 33, axes: { weight: [100, 900] } },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '600', '700', '800'], isVariable: true, popularRank: 34, axes: { weight: [400, 800] } },
  { family: 'Prata', category: 'serif', variants: ['400'], isVariable: false, popularRank: 35 },
  { family: 'Castoro', category: 'serif', variants: ['400'], isVariable: false, popularRank: 36 },
  { family: 'Zilla Slab', category: 'serif', variants: ['300', '400', '600', '700'], isVariable: false, popularRank: 37 },
  { family: 'Baskervville', category: 'serif', variants: ['400'], isVariable: false, popularRank: 38 },
  { family: 'Marcellus', category: 'serif', variants: ['400'], isVariable: false, popularRank: 39 },
  { family: 'Vollkorn', category: 'serif', variants: ['400', '700', '900'], isVariable: true, popularRank: 40 },
  { family: 'DM Serif Display', category: 'serif', variants: ['400'], isVariable: false, popularRank: 41 },
  { family: 'Cardo', category: 'serif', variants: ['400', '700'], isVariable: false, popularRank: 42 },
  { family: 'Spectral', category: 'serif', variants: ['200', '400', '700'], isVariable: false, popularRank: 43 },

  // --- DISPLAY, POSTER & BRANDING ---
  { family: 'Bebas Neue', category: 'display', variants: ['400'], isVariable: false, popularRank: 44 },
  { family: 'Oswald', category: 'display', variants: ['200', '400', '600', '700'], isVariable: true, popularRank: 45, axes: { weight: [200, 700] } },
  { family: 'Anton', category: 'display', variants: ['400'], isVariable: false, popularRank: 46 },
  { family: 'Righteous', category: 'display', variants: ['400'], isVariable: false, popularRank: 47 },
  { family: 'Syne', category: 'display', variants: ['400', '600', '700', '800'], isVariable: true, popularRank: 48, axes: { weight: [400, 800] } },
  { family: 'Unbounded', category: 'display', variants: ['300', '500', '700', '900'], isVariable: true, popularRank: 49, axes: { weight: [200, 900] } },
  { family: 'Abril Fatface', category: 'display', variants: ['400'], isVariable: false, popularRank: 50 },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'], isVariable: false, popularRank: 51 },
  { family: 'Monoton', category: 'display', variants: ['400'], isVariable: false, popularRank: 52 },
  { family: 'Russo One', category: 'display', variants: ['400'], isVariable: false, popularRank: 53 },
  { family: 'Bungee', category: 'display', variants: ['400'], isVariable: false, popularRank: 54 },
  { family: 'Bungee Shade', category: 'display', variants: ['400'], isVariable: false, popularRank: 55 },
  { family: 'Orbitron', category: 'display', variants: ['400', '700', '900'], isVariable: true, popularRank: 56, axes: { weight: [400, 900] } },
  { family: 'Chakra Petch', category: 'display', variants: ['300', '500', '700'], isVariable: false, popularRank: 57 },
  { family: 'Press Start 2P', category: 'display', variants: ['400'], isVariable: false, popularRank: 58 },
  { family: 'Audiowide', category: 'display', variants: ['400'], isVariable: false, popularRank: 59 },
  { family: 'Fredoka', category: 'display', variants: ['300', '500', '700'], isVariable: true, popularRank: 60 },
  { family: 'Lilita One', category: 'display', variants: ['400'], isVariable: false, popularRank: 61 },
  { family: 'Secular One', category: 'display', variants: ['400'], isVariable: false, popularRank: 62 },
  { family: 'Titan One', category: 'display', variants: ['400'], isVariable: false, popularRank: 63 },
  { family: 'Bangers', category: 'display', variants: ['400'], isVariable: false, popularRank: 64 },
  { family: 'Black Han Sans', category: 'display', variants: ['400'], isVariable: false, popularRank: 65 },
  { family: 'Shrikhand', category: 'display', variants: ['400'], isVariable: false, popularRank: 66 },
  { family: 'Cinzel Decorative', category: 'display', variants: ['400', '700', '900'], isVariable: false, popularRank: 67 },
  { family: 'Teko', category: 'display', variants: ['300', '500', '700'], isVariable: true, popularRank: 68 },
  { family: 'Archivo Black', category: 'display', variants: ['400'], isVariable: false, popularRank: 69 },

  // --- HANDWRITING, SIGNATURE & CALLIGRAPHY ---
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '600', '700'], isVariable: true, popularRank: 70, axes: { weight: [400, 700] } },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 71 },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '600', '700'], isVariable: true, popularRank: 72, axes: { weight: [400, 700] } },
  { family: 'Great Vibes', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 73 },
  { family: 'Satisfy', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 74 },
  { family: 'Sacramento', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 75 },
  { family: 'Alex Brush', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 76 },
  { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 77 },
  { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 78 },
  { family: 'Kaushan Script', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 79 },
  { family: 'Courgette', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 80 },
  { family: 'Marck Script', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 81 },
  { family: 'Kalam', category: 'handwriting', variants: ['300', '400', '700'], isVariable: false, popularRank: 82 },
  { family: 'Amatic SC', category: 'handwriting', variants: ['400', '700'], isVariable: false, popularRank: 83 },
  { family: 'Caveat Brush', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 84 },
  { family: 'Allura', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 85 },
  { family: 'Parisienne', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 86 },
  { family: 'Yellowtail', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 87 },
  { family: 'Cookie', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 88 },
  { family: 'Bad Script', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 89 },

  // --- MONOSPACE & CODE ---
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '600', '700'], isVariable: true, popularRank: 90, axes: { weight: [300, 700] } },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['300', '400', '600', '800'], isVariable: true, popularRank: 91, axes: { weight: [100, 800] } },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], isVariable: false, popularRank: 92 },
  { family: 'Roboto Mono', category: 'monospace', variants: ['200', '400', '600', '700'], isVariable: true, popularRank: 93, axes: { weight: [100, 700] } },
  { family: 'Source Code Pro', category: 'monospace', variants: ['300', '400', '600', '900'], isVariable: true, popularRank: 94, axes: { weight: [200, 900] } },
  { family: 'Courier Prime', category: 'monospace', variants: ['400', '700'], isVariable: false, popularRank: 95 },
  { family: 'Inconsolata', category: 'monospace', variants: ['300', '500', '700'], isVariable: true, popularRank: 96 },
  { family: 'VT323', category: 'monospace', variants: ['400'], isVariable: false, popularRank: 97 },
  { family: 'Share Tech Mono', category: 'monospace', variants: ['400'], isVariable: false, popularRank: 98 },
  { family: 'Cutive Mono', category: 'monospace', variants: ['400'], isVariable: false, popularRank: 99 },

  // --- SYSTEM & OPERATING SYSTEM STACKS ---
  { family: 'Arial', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 100 },
  { family: 'Helvetica', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 101 },
  { family: 'Segoe UI', category: 'system', variants: ['300', '400', '600', '700'], isVariable: false, popularRank: 102 },
  { family: 'Calibri', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 103 },
  { family: 'Impact', category: 'system', variants: ['400'], isVariable: false, popularRank: 104 },
  { family: 'Georgia', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 105 },
  { family: 'Times New Roman', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 106 },
  { family: 'Garamond', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 107 },
  { family: 'Trebuchet MS', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 108 },
  { family: 'Verdana', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 109 },
  { family: 'Comic Sans MS', category: 'system', variants: ['400'], isVariable: false, popularRank: 110 },
  { family: 'Futura', category: 'system', variants: ['400', '700'], isVariable: false, popularRank: 111 },
];

const loadedFonts = new Set<string>();

/**
 * Universal dynamic font loader: loads any Google font on demand
 */
export function loadGoogleFont(fontFamily: string): void {
  if (!fontFamily || loadedFonts.has(fontFamily)) return;

  const systemFonts = ['Arial', 'Helvetica', 'Segoe UI', 'Calibri', 'Impact', 'Georgia', 'Times New Roman', 'Garamond', 'Trebuchet MS', 'Verdana', 'Comic Sans MS', 'Futura', 'sans-serif', 'serif', 'monospace'];
  if (systemFonts.includes(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

  const linkId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) {
    loadedFonts.add(fontFamily);
    return;
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  const encodedFamily = encodeURIComponent(fontFamily);
  link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@100..900&display=swap`;

  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
}

/**
 * Load Custom Font File (.ttf, .otf, .woff, .woff2) into browser FontFace registry
 */
export async function loadCustomFontFile(file: File): Promise<string> {
  const fontName = file.name.replace(/\.[^/.]+$/, '');
  const buffer = await file.arrayBuffer();

  const fontFace = new FontFace(fontName, buffer);
  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);
  loadedFonts.add(fontName);

  return fontName;
}

/**
 * Query Local Operating System Installed Fonts (Chrome/Edge Local Font Access API)
 */
export async function querySystemFonts(): Promise<string[]> {
  try {
    if ('queryLocalFonts' in window) {
      const fonts = await (window as any).queryLocalFonts();
      const uniqueFamilies = Array.from(new Set(fonts.map((f: any) => f.family))) as string[];
      return uniqueFamilies;
    }
  } catch (err) {
    console.warn('Local font access permission declined or not supported:', err);
  }
  return [];
}
