/**
 * Epoch Data Intelligence - All-in-One Enterprise AI Platform
 * Red & White Corporate Theme
 * Protected Live Dashboard module + Generative & Developer AI Tools
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/tools/HomePage';
import { ToolId } from './types/tools';
import { LiveDashboardView } from './components/LiveDashboardView';
import { ImageCreatorTool } from './components/tools/ImageCreatorTool';
import { ImageEditorTool } from './components/tools/ImageEditorTool';
import { ImageToVideoTool } from './components/tools/ImageToVideoTool';
import { TextToVideoTool } from './components/tools/TextToVideoTool';
import { MusicGeneratorTool } from './components/tools/MusicGeneratorTool';
import { DatabaseAuthTool } from './components/tools/DatabaseAuthTool';
import { MapsDataTool } from './components/tools/MapsDataTool';
import { Dataset } from './types/dashboard';

export default function App() {
  // Navigation tool state
  const [activeTool, setActiveTool] = useState<ToolId>('home');
  const [globalSearch, setGlobalSearch] = useState('');
  const [dataset, setDataset] = useState<Dataset | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/70 text-slate-900 font-sans antialiased">
      {/* Left Sidebar (All-in-One Navigation with Red & White Theme) */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        dataset={dataset}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
        />

        {/* Dynamic Tool Router */}
        <main className="flex-1 overflow-hidden flex flex-col bg-slate-50/60">
          {activeTool === 'home' && (
            <HomePage onNavigateToTool={setActiveTool} />
          )}

          {activeTool === 'dashboard' && (
            <LiveDashboardView onDatasetChange={setDataset} />
          )}

          {activeTool === 'image-create' && (
            <ImageCreatorTool onNavigateToTool={setActiveTool} />
          )}

          {activeTool === 'image-edit' && (
            <ImageEditorTool />
          )}

          {activeTool === 'image-to-video' && (
            <ImageToVideoTool />
          )}

          {activeTool === 'text-to-video' && (
            <TextToVideoTool />
          )}

          {activeTool === 'music-generation' && (
            <MusicGeneratorTool />
          )}

          {activeTool === 'database-auth' && (
            <DatabaseAuthTool />
          )}

          {activeTool === 'maps-data' && (
            <MapsDataTool />
          )}
        </main>
      </div>
    </div>
  );
}
