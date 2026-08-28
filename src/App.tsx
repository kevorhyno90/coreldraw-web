import React from 'react';
import { CorelProvider } from './context/CorelContext';
import { MenuBar } from './components/layout/MenuBar';
import { StandardToolbar } from './components/layout/StandardToolbar';
import { DynamicPropertyBar } from './components/layout/DynamicPropertyBar';
import { Toolbox } from './components/tools/Toolbox';
import { Workspace } from './components/canvas/Workspace';
import { DockersContainer } from './components/dockers/DockersContainer';
import { BottomStatusBar } from './components/layout/BottomStatusBar';
import { NewDocDialog } from './components/dialogs/NewDocDialog';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { TemplatesDialog } from './components/dialogs/TemplatesDialog';
import { ShortcutsDialog } from './components/dialogs/ShortcutsDialog';
import { AboutDialog } from './components/dialogs/AboutDialog';
import { CommandPaletteDialog } from './components/dialogs/CommandPaletteDialog';

export function CorelDrawApp() {
  return (
    <CorelProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#181a20] text-gray-200 font-sans select-none">
        {/* Top Navigation & Toolbars */}
        <MenuBar />
        <StandardToolbar />
        <DynamicPropertyBar />

        {/* Central Workspace Area (Left Toolbox + Canvas + Right Dockers) */}
        <div className="flex-1 flex overflow-hidden relative">
          <Toolbox />
          <Workspace />
          <DockersContainer />
        </div>

        {/* Bottom Status & Color Palette Bar */}
        <BottomStatusBar />

        {/* Modals & Dialogs */}
        <NewDocDialog />
        <ExportDialog />
        <TemplatesDialog />
        <ShortcutsDialog />
        <AboutDialog />
        <CommandPaletteDialog />
      </div>
    </CorelProvider>
  );
}

export default CorelDrawApp;
