import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { generateVectorQrMatrix, generateBarcodeBars } from '../../engine/proToolsEngine';
import { QrCode, Barcode, Plus, Sparkles, Link, User, Wifi, Type } from 'lucide-react';

export const BarcodeDocker: React.FC = () => {
  const { addObject, activePage } = useCorel();

  const [codeType, setCodeType] = useState<'qr' | 'barcode1d'>('qr');
  const [qrContentType, setQrContentType] = useState<'url' | 'text' | 'wifi'>('url');
  const [contentValue, setContentValue] = useState('https://coreldraw.com');
  const [barcodeValue, setBarcodeValue] = useState('789012345678');
  const [codeSize, setCodeSize] = useState(160);

  const handleInsertQrCode = () => {
    const matrix = generateVectorQrMatrix(contentValue);
    const cellSize = codeSize / matrix.length;
    const subpaths: any[] = [];

    // Convert matrix into vector rect subpaths
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const x = c * cellSize;
          const y = r * cellSize;
          const s = cellSize;
          subpaths.push({
            isClosed: true,
            nodes: [
              { id: `n_${r}_${c}_0`, x, y, type: 'cusp' },
              { id: `n_${r}_${c}_1`, x: x + s, y, type: 'cusp' },
              { id: `n_${r}_${c}_2`, x: x + s, y: y + s, type: 'cusp' },
              { id: `n_${r}_${c}_3`, x, y: y + s, type: 'cusp' },
            ],
          });
        }
      }
    }

    addObject({
      name: `QR Code (${contentValue.slice(0, 15)})`,
      type: 'path',
      transform: {
        x: activePage.width / 2 - codeSize / 2,
        y: activePage.height / 2 - codeSize / 2,
        width: codeSize,
        height: codeSize,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      subpaths,
      fill: { type: 'solid', color: '#000000' },
      outline: { color: 'none', width: 0, style: 'solid', cap: 'square', join: 'miter', startArrow: 'none', endArrow: 'none' },
    });
  };

  const handleInsertBarcode = () => {
    const bars = generateBarcodeBars(barcodeValue);
    const subpaths: any[] = [];
    let currentX = 0;
    const barHeight = 80;

    for (let i = 0; i < bars.length; i++) {
      const w = bars[i] * 3;
      if (i % 2 === 0) {
        subpaths.push({
          isClosed: true,
          nodes: [
            { id: `b_${i}_0`, x: currentX, y: 0, type: 'cusp' },
            { id: `b_${i}_1`, x: currentX + w, y: 0, type: 'cusp' },
            { id: `b_${i}_2`, x: currentX + w, y: barHeight, type: 'cusp' },
            { id: `b_${i}_3`, x: currentX, y: barHeight, type: 'cusp' },
          ],
        });
      }
      currentX += w;
    }

    addObject({
      name: `Barcode 1D (${barcodeValue})`,
      type: 'path',
      transform: {
        x: activePage.width / 2 - currentX / 2,
        y: activePage.height / 2 - barHeight / 2,
        width: currentX,
        height: barHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      subpaths,
      fill: { type: 'solid', color: '#000000' },
      outline: { color: 'none', width: 0, style: 'solid', cap: 'square', join: 'miter', startArrow: 'none', endArrow: 'none' },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-y-auto divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-orange-950/40 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <QrCode size={16} />
          </div>
          <div>
            <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
              Barcode & QR Code Wizard
            </div>
            <div className="text-[10px] text-gray-400">
              Vector QR Codes, UPC, EAN & Code 128
            </div>
          </div>
        </div>
      </div>

      {/* Code Type Switcher */}
      <div className="p-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setCodeType('qr')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              codeType === 'qr' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <QrCode size={13} />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setCodeType('barcode1d')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              codeType === 'barcode1d' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Barcode size={13} />
            <span>1D Barcode</span>
          </button>
        </div>
      </div>

      {/* QR Code Settings */}
      {codeType === 'qr' ? (
        <div className="p-3 flex flex-col gap-3">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            QR Payload Content
          </label>

          <div className="flex gap-1">
            {[
              { id: 'url', label: 'URL / Link', icon: Link },
              { id: 'text', label: 'Plain Text', icon: Type },
              { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
            ].map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setQrContentType(type.id as any)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all ${
                    qrContentType === type.id
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <Icon size={11} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          <textarea
            value={contentValue}
            onChange={e => setContentValue(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700/80 rounded-xl text-gray-200 text-xs outline-none focus:border-amber-500 font-mono"
            placeholder="Enter URL, text or WiFi string..."
          />

          <div className="flex items-center justify-between bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <span className="text-gray-400">Dimensions:</span>
            <span className="text-amber-400 font-mono">{codeSize} × {codeSize} px</span>
          </div>

          <button
            onClick={handleInsertQrCode}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus size={14} />
            <span>Insert Vector QR Code</span>
          </button>
        </div>
      ) : (
        /* 1D Barcode Settings */
        <div className="p-3 flex flex-col gap-3">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Barcode 1D Value (UPC / EAN / Code 128)
          </label>

          <input
            type="text"
            value={barcodeValue}
            onChange={e => setBarcodeValue(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700/80 rounded-xl text-gray-200 text-xs outline-none focus:border-amber-500 font-mono tracking-widest text-center"
            placeholder="e.g. 789012345678"
          />

          <button
            onClick={handleInsertBarcode}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus size={14} />
            <span>Insert Vector Barcode</span>
          </button>
        </div>
      )}
    </div>
  );
};
