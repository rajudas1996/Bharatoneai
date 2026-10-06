import React from 'react';
import { 
  Home,
  BarChart3, 
  Image as ImageIcon, 
  Wand2, 
  Film, 
  Video, 
  Music, 
  Database, 
  MapPin, 
  FolderGit2, 
  Settings, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { BharatLogo } from './BharatLogo';
import { ToolId } from '../types/tools';
import { Dataset } from '../types/dashboard';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  dataset?: Dataset | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  dataset,
}) => {
  const navItems: { id: ToolId; label: string; icon: any; badge?: string; isCore?: boolean }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Live Dashboard', icon: BarChart3, badge: dataset ? `${dataset.totalRows} rows` : 'Active', isCore: true },
    { id: 'image-create', label: 'Image Create', icon: ImageIcon },
    { id: 'image-edit', label: 'Image Edit', icon: Wand2 },
    { id: 'image-to-video', label: 'Animate Image to Video', icon: Film },
    { id: 'text-to-video', label: 'Text to Video', icon: Video },
    { id: 'music-generation', label: 'Music Generation', icon: Music },
    { id: 'database-auth', label: 'Database & Auth', icon: Database },
    { id: 'maps-data', label: 'Maps Data', icon: MapPin },
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 border-r border-slate-200 z-20 select-none shadow-2xs">
      {/* Brand Header with BharatAI Logo matching reference image */}
      <div className="p-4 border-b border-slate-100">
        <BharatLogo className="h-10 w-full" showTagline={true} />
      </div>

      {/* Primary Navigation */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
          Navigation & Tools
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTool(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-red-50 text-red-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
              <span className="flex-1 text-left truncate">{item.label}</span>

              {item.isCore && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  Core
                </span>
              )}

              {item.badge && !item.isCore && (
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Secondary Links from Screenshot */}
      <div className="p-3 border-t border-slate-100 space-y-0.5 text-slate-500 text-xs">
        <button
          onClick={() => alert('Projects workspace: 4 active AI projects')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => alert('Platform Settings & Preferences')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => alert('BharatAI Documentation & Support')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Support</span>
        </button>
      </div>

      {/* Database Quick Status Badge */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Platform Online
          </span>
          <span className="font-mono text-[10px] text-slate-400">v3.4.2</span>
        </div>
        <div className="text-[10px] text-slate-400 truncate">
          BharatAI Enterprise Suite
        </div>
      </div>
    </aside>
  );
};
