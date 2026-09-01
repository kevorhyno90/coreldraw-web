import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Cloud, UploadCloud, DownloadCloud, Share2, CheckCircle, RefreshCw, Smartphone, Laptop, Globe } from 'lucide-react';
import { exportToCorelJson, exportToSvgFile, exportToPdfDocument } from '../../engine/exportEngine';

export const CloudHubDocker: React.FC = () => {
  const {
    projectTitle,
    getProjectDocument,
    loadProjectDocument,
    isOnline,
    activePage,
    activeObjects,
  } = useCorel();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Synced to Cloud (Version 2025.1)');
  const [cloudRevisions, setCloudRevisions] = useState([
    { id: 'rev-3', name: 'Final Signage Cut-Paths & Pantone 2025', time: 'Just now', author: 'Devin Web' },
    { id: 'rev-2', name: 'Added Painterly Watercolor Layers', time: '10 mins ago', author: 'Desktop App' },
    { id: 'rev-1', name: 'Initial Vector Artwork & Branding Layout', time: '1 hour ago', author: 'Devin Cloud' },
  ]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(`Synced to Cloud (${new Date().toLocaleTimeString()})`);
      setCloudRevisions(prev => [
        {
          id: `rev-${Date.now()}`,
          name: `${projectTitle} Snapshot`,
          time: 'Just now',
          author: 'CorelDRAW Web 2025',
        },
        ...prev,
      ]);
    }, 600);
  };

  const handleExportFormat = (format: 'cdrw' | 'svg' | 'pdf' | 'cdr') => {
    if (format === 'cdrw') {
      exportToCorelJson(getProjectDocument(), `${projectTitle}.cdrw`);
    } else if (format === 'svg') {
      exportToSvgFile(activePage, activeObjects, `${projectTitle}.svg`);
    } else if (format === 'pdf') {
      exportToPdfDocument(activePage, activeObjects, `${projectTitle}.pdf`);
    } else if (format === 'cdr') {
      // Export as structured CDR JSON container
      exportToCorelJson(getProjectDocument(), `${projectTitle}.cdr`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-y-auto divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-indigo-950/40 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
              <Cloud size={16} />
            </div>
            <div>
              <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
                CorelDRAW Web Cloud Hub
              </div>
              <div className="text-[10px] text-gray-400">
                Cross-Platform Cloud Sync & Desktop Bridge
              </div>
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
        </div>
      </div>

      {/* Sync Status Card */}
      <div className="p-3 flex flex-col gap-2 bg-[#14171f]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle size={14} />
            <span>{syncStatus}</span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            title="Sync Now"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-sky-400' : ''} />
          </button>
        </div>

        {/* Device Sync Matrix */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="flex flex-col items-center gap-1 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <Laptop size={15} className="text-sky-400" />
            <span className="text-[10px] text-gray-300">Desktop 2025</span>
            <span className="text-[9px] text-emerald-400 font-mono">Linked</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <Globe size={15} className="text-sky-400" />
            <span className="text-[10px] text-gray-300">Web Studio</span>
            <span className="text-[9px] text-emerald-400 font-mono">Active</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <Smartphone size={15} className="text-sky-400" />
            <span className="text-[10px] text-gray-300">Mobile PWA</span>
            <span className="text-[9px] text-emerald-400 font-mono">Ready</span>
          </div>
        </div>
      </div>

      {/* Cloud Export & Universal Compatibility */}
      <div className="p-3 flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Cross-Platform File Exchange
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleExportFormat('cdrw')}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition-all text-left"
          >
            <div>
              <div className="font-semibold text-gray-200">.CDRW Project</div>
              <div className="text-[9px] text-gray-400">Native Corel Web</div>
            </div>
            <DownloadCloud size={14} className="text-sky-400" />
          </button>

          <button
            onClick={() => handleExportFormat('cdr')}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition-all text-left"
          >
            <div>
              <div className="font-semibold text-gray-200">.CDR Package</div>
              <div className="text-[9px] text-gray-400">Desktop Suite 2025</div>
            </div>
            <DownloadCloud size={14} className="text-emerald-400" />
          </button>

          <button
            onClick={() => handleExportFormat('svg')}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition-all text-left"
          >
            <div>
              <div className="font-semibold text-gray-200">.SVG Vector</div>
              <div className="text-[9px] text-gray-400">W3C Standard</div>
            </div>
            <DownloadCloud size={14} className="text-orange-400" />
          </button>

          <button
            onClick={() => handleExportFormat('pdf')}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition-all text-left"
          >
            <div>
              <div className="font-semibold text-gray-200">.PDF Document</div>
              <div className="text-[9px] text-gray-400">Print Prepress</div>
            </div>
            <DownloadCloud size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Revision History */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Cloud Version History
        </label>
        <div className="flex flex-col gap-1.5">
          {cloudRevisions.map(rev => (
            <div
              key={rev.id}
              className="p-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-200 text-[11px]">{rev.name}</div>
                <div className="text-[9px] text-gray-500">{rev.author} • {rev.time}</div>
              </div>
              <button
                onClick={handleManualSync}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded bg-sky-950/40 border border-sky-800/40"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
