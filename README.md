# Devin's CorelDRAW — Offline & Desktop Vector Graphics Suite

A powerful, 100% offline-capable, in-browser vector illustration, page layout, and precision graphic design studio built with React 19, TypeScript, Vite, and Tailwind CSS.

---

## 🚀 Key Features

### 📐 Vector Graphics & Precision Geometry
- **Bézier Curves & Node Editing (F10)**: Cubic & quadratic Bézier evaluation, cusp/smooth/symmetric node editing, and curve smoothing.
- **Parametric Vector Shapes**: Rectangles with individual corner radii, Ellipses/Pies/Arcs, Polygons with $N$ sides, Stars with point count and sharpness control, and Spirals.
- **Boolean Shaping Operations**: **Weld (Union)**, **Trim (Difference)**, **Intersect**, and **Front Minus Back**.
- **Convert to Curves (Ctrl+Q)**: Turn any parametric shape or typography into fully editable Bézier paths.

### 🎨 Effects & 3D Extrusion
- **3D Extrusion**: Computes projected side facets with directional Lambertian lighting, angle orientation, lighting intensity, and custom side colors.
- **Drop Shadow & Glow**: Soft Gaussian blurred shadows with configurable blur radius, offset, opacity, and color.
- **Contour (Offset Paths)**: Stepped concentric inward/outward offset contour paths with color transitions.
- **Interactive Fountain Fill (G)**: Dynamic on-canvas drag gizmos for linear and radial gradients.

### ⚡ PowerTRACE (Bitmap Auto-Trace)
- Convert raster bitmaps (`PNG`, `JPG`, `WebP`) into editable Bézier vector curves directly in your browser.

### 💾 100% Offline PWA & Autosave
- **Full Offline Support**: Powered by a Service Worker (`sw.js`) and Web App Manifest (`manifest.json`), working seamlessly without internet connection.
- **Instant Autosave**: Saves work continuously to local storage and restores upon reopening.
- **Installable Desktop App**: Can be installed to desktop or mobile home screens as a standalone PWA.

### 📤 Multi-Format Export
- **SVG**: Clean W3C standard vector markup.
- **PNG / JPEG**: High-resolution raster rendering with 1x, 2x Retina, and 4x Ultra HD 300 DPI print quality.
- **PDF**: Print-ready document generation.
- **CDRW Project**: Native JSON project serialization (`.cdrw`).
- **Direct Print**: Print vector artwork directly via browser print dialog.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/kevorhyno90/coreldraw-web.git
cd coreldraw-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
