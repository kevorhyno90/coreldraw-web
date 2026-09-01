import { GoogleFontMeta } from '../types/coreldraw';

export const GOOGLE_FONTS_CATALOG: GoogleFontMeta[] = [
  // Sans-serif & Geometric
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
  { family: 'Cabinet Grotesk', category: 'sans-serif', variants: ['400', '700', '800'], isVariable: true, popularRank: 17 },
  { family: 'Sora', category: 'sans-serif', variants: ['100', '400', '600', '800'], isVariable: true, popularRank: 18, axes: { weight: [100, 800] } },

  // Serif & Editorial Elegance
  { family: 'Playfair Display', category: 'serif', variants: ['400', '600', '700', '900'], isVariable: true, popularRank: 19, axes: { weight: [400, 900] } },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], isVariable: false, popularRank: 20 },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], isVariable: true, popularRank: 21, axes: { weight: [400, 700] } },
  { family: 'Cinzel', category: 'serif', variants: ['400', '600', '700', '900'], isVariable: true, popularRank: 22, axes: { weight: [400, 900] } },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '600', '700'], isVariable: false, popularRank: 23 },
  { family: 'Bodoni Moda', category: 'serif', variants: ['400', '600', '800', '900'], isVariable: true, popularRank: 24, axes: { weight: [400, 900] } },
  { family: 'Fraunces', category: 'serif', variants: ['100', '400', '700', '900'], isVariable: true, popularRank: 25, axes: { weight: [100, 900] } },
  { family: 'Prata', category: 'serif', variants: ['400'], isVariable: false, popularRank: 26 },
  { family: 'Castoro', category: 'serif', variants: ['400'], isVariable: false, popularRank: 27 },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '600', '700', '800'], isVariable: true, popularRank: 28, axes: { weight: [400, 800] } },

  // Display, Poster & Branding
  { family: 'Bebas Neue', category: 'display', variants: ['400'], isVariable: false, popularRank: 29 },
  { family: 'Oswald', category: 'display', variants: ['200', '400', '600', '700'], isVariable: true, popularRank: 30, axes: { weight: [200, 700] } },
  { family: 'Anton', category: 'display', variants: ['400'], isVariable: false, popularRank: 31 },
  { family: 'Righteous', category: 'display', variants: ['400'], isVariable: false, popularRank: 32 },
  { family: 'Syne', category: 'display', variants: ['400', '600', '700', '800'], isVariable: true, popularRank: 33, axes: { weight: [400, 800] } },
  { family: 'Clash Display', category: 'display', variants: ['400', '600', '700'], isVariable: true, popularRank: 34 },
  { family: 'Unbounded', category: 'display', variants: ['300', '500', '700', '900'], isVariable: true, popularRank: 35, axes: { weight: [200, 900] } },
  { family: 'Bungee', category: 'display', variants: ['400'], isVariable: false, popularRank: 36 },
  { family: 'Monoton', category: 'display', variants: ['400'], isVariable: false, popularRank: 37 },
  { family: 'Russo One', category: 'display', variants: ['400'], isVariable: false, popularRank: 38 },
  { family: 'Abril Fatface', category: 'display', variants: ['400'], isVariable: false, popularRank: 39 },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'], isVariable: false, popularRank: 40 },

  // Handwriting & Calligraphy
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '600', '700'], isVariable: true, popularRank: 41, axes: { weight: [400, 700] } },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 42 },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '600', '700'], isVariable: true, popularRank: 43, axes: { weight: [400, 700] } },
  { family: 'Great Vibes', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 44 },
  { family: 'Satisfy', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 45 },
  { family: 'Sacramento', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 46 },
  { family: 'Alex Brush', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 47 },
  { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 48 },
  { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], isVariable: false, popularRank: 49 },

  // Monospace & Technical
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '600', '700'], isVariable: true, popularRank: 50, axes: { weight: [300, 700] } },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['300', '400', '600', '800'], isVariable: true, popularRank: 51, axes: { weight: [100, 800] } },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], isVariable: false, popularRank: 52 },
  { family: 'Roboto Mono', category: 'monospace', variants: ['200', '400', '600', '700'], isVariable: true, popularRank: 53, axes: { weight: [100, 700] } },
  { family: 'Source Code Pro', category: 'monospace', variants: ['300', '400', '600', '900'], isVariable: true, popularRank: 54, axes: { weight: [200, 900] } },
  { family: 'Courier Prime', category: 'monospace', variants: ['400', '700'], isVariable: false, popularRank: 55 },
];

const loadedFonts = new Set<string>();

/**
 * Dynamically loads Google Font into document head if not already loaded
 */
export function loadGoogleFont(fontFamily: string): void {
  if (loadedFonts.has(fontFamily)) return;
  
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
