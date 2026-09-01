import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { CorelObject, CorelPage, ProjectDocument } from '../types/coreldraw';
import { exportPageToSvg } from './svgEngine';

export interface ExportSettings {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'cdrw';
  scale: number; // 1x, 2x, 4x
  quality: number; // 0.1 to 1.0 (for jpg)
  selectedOnly: boolean;
  filename: string;
}

// Convert SVG to Canvas image and download as PNG or JPG
export async function exportToRaster(
  svgString: string,
  width: number,
  height: number,
  scale: number = 2,
  format: 'png' | 'jpg' = 'png',
  quality: number = 0.95,
  filename: string = 'drawing'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context creation failed'));
          return;
        }

        if (format === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          blob => {
            if (blob) {
              saveAs(blob, `${filename}.${format}`);
              resolve();
            } else {
              reject(new Error('Failed to generate image blob'));
            }
          },
          format === 'jpg' ? 'image/jpeg' : 'image/png',
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = e => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

// Export page to PDF
export async function exportToPdf(
  page: CorelPage,
  objects: CorelObject[],
  filename: string = 'drawing'
): Promise<void> {
  const svgString = exportPageToSvg(page, objects);
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = page.width * scale;
        canvas.height = page.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const orientation = page.width >= page.height ? 'landscape' : 'portrait';
        const doc = new jsPDF({
          orientation,
          unit: 'px',
          format: [page.width, page.height],
        });

        doc.addImage(imgData, 'JPEG', 0, 0, page.width, page.height);
        doc.save(`${filename}.pdf`);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render PDF page'));
    };
    img.src = url;
  });
}

// Alias for PDF document export
export const exportToPdfDocument = exportToPdf;


// Export CDRW JSON project file
export function exportToCorelJson(project: ProjectDocument, filename: string = 'drawing'): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${filename}.cdrw`);
}

// Export raw SVG
export function exportToSvgFile(page: CorelPage, objects: CorelObject[], filename: string = 'drawing'): void {
  const svgStr = exportPageToSvg(page, objects);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, `${filename}.svg`);
}

// Print document
export function printDocument(page: CorelPage, objects: CorelObject[]): void {
  const svgStr = exportPageToSvg(page, objects);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <style>
          @page { size: auto; margin: 0mm; }
          body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          svg { width: 100%; height: 100%; max-width: ${page.width}px; max-height: ${page.height}px; }
        </style>
      </head>
      <body>
        ${svgStr}
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
