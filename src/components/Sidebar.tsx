import React from 'react';
import { 
  Home, 
  BarChart3, 
  Image as ImageIcon, 
  SlidersHorizontal, 
  Film, 
  Video, 
  Music, 
  Database, 
  MapPin, 
  Sparkles, 
  Folder, 
  Settings, 
  HelpCircle,
  FileSpreadsheet,
  RotateCcw,
  Table2,
  Layers,
  X,
  Briefcase,
  Lock
} from 'lucide-react';
import { BharatLogo } from './BharatLogo';
import { Dataset } from '../types/dashboard';

export type MainNavTab = 
  | 'home' 
  | 'dashboard' 
  | 'sales_crm'
  | 'image_editor' 
  | 'video_editor' 
  | 'music_gen' 
  | 'maps_data' 
  | 'projects'
  | 'all_tools'
  | 'settings'
  | 'help'
  // Compatibility:
  | 'image_create' 
  | 'image_edit' 
  | 'animate_image' 
  | 'text_to_video' 
  | 'database_auth' 
  | 'table' 
  | 'schema';

interface SidebarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  dataset: Dataset | null;
  filteredCount: number;
  onOpenUpload: () => void;
  onTriggerReset: () => void;
  onSelectSheet: (sheetName: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  dataset,
  filteredCount,
  onOpenUpload,
  onTriggerReset,
  onSelectSheet,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const isDashboardActive = currentTab === 'dashboard';

  const handleTabClick = (tab: MainNavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (Desktop Static + Mobile Slide-out Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white text-slate-800 flex flex-col shrink-0 border-r border-slate-200 z-50 select-none shadow-xl transition-transform duration-300 md:static md:w-64 md:translate-x-0 md:shadow-2xs md:z-20 h-full ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with Bold Red "Bharat 1 AI" Logo & Mobile Close Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <BharatLogo size="md" showSubtitle={false} />
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation List matching reference image */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1 no-scrollbar">
          {/* 1. Home (Red active pill) */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'home'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${currentTab === 'home' ? 'text-white' : 'text-slate-500'}`} />
            <span>Home</span>
          </button>

          {/* 2. Live Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              isDashboardActive
                ? 'bg-red-50 text-red-600 font-bold border border-red-200/60'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <BarChart3 className={`w-4 h-4 shrink-0 ${isDashboardActive ? 'text-red-600' : 'text-slate-500'}`} />
            <span className="flex-1 text-left">Live Dashboard</span>
            {dataset && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Active Excel Loaded" />
            )}
          </button>

          {/* 3. Sales CRM (New Option per User Request) */}
          <button
            type="button"
            onClick={() => handleTabClick('sales_crm')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'sales_crm'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Briefcase className={`w-4 h-4 shrink-0 ${currentTab === 'sales_crm' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className="flex-1 text-left">Sales CRM</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">New</span>
          </button>

          {/* 4. Image Editor (Merged Image Creator & Image Edit per User Request) */}
          <button
            type="button"
            onClick={() => handleTabClick('image_editor')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'image_editor' || currentTab === 'image_create' || currentTab === 'image_edit'
                ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/60'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Image Editor</span>
          </button>

          {/* 5. Video Editor (Merged Animate Image & Text to Video per User Request) */}
          <button
            type="button"
            onClick={() => handleTabClick('video_editor')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'video_editor' || currentTab === 'animate_image' || currentTab === 'text_to_video'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/60'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Video className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Video Editor</span>
          </button>

          {/* 6. Music Generation */}
          <button
            type="button"
            onClick={() => handleTabClick('music_gen')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'music_gen'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Music className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Music Generation</span>
          </button>

          {/* 7. Maps Data */}
          <button
            type="button"
            onClick={() => handleTabClick('maps_data')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'maps_data'
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Maps Data</span>
          </button>

          {/* 8. Projects (Under Maps Data tool) */}
          <button
            type="button"
            onClick={() => handleTabClick('projects')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'projects'
                ? 'bg-amber-50 text-amber-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Folder className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Projects</span>
          </button>

          {/* 9. All Tools */}
          <button
            type="button"
            onClick={() => handleTabClick('all_tools')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'all_tools'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-slate-500" />
            <span>All Tools</span>
          </button>
      </div>

      {/* Bottom Navigation Section: Settings, Help & Support */}
      <div className="p-3 border-t border-slate-100 space-y-0.5 bg-white">
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-slate-100 text-slate-900 font-bold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('help')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'help'
              ? 'bg-slate-100 text-slate-900 font-bold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
    </>
  );
};
