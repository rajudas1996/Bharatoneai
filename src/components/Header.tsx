import React from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  X,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { ToolId } from '../types/tools';

interface HeaderProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  searchQuery: string;
  setSearchQuery: (term: string) => void;
}

const TOOL_NAMES: Record<ToolId, string> = {
  'home': 'Home',
  'dashboard': 'Live Dashboard',
  'image-create': 'Image Creator',
  'image-edit': 'Image Editor',
  'image-to-video': 'Animate Image to Video',
  'text-to-video': 'Text to Video',
  'music-generation': 'Music Generation',
  'database-auth': 'Database & Auth',
  'maps-data': 'Maps & Location Data',
};

export const Header: React.FC<HeaderProps> = ({
  activeTool,
  onSelectTool,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0 z-10 select-none">
      {/* Zone 1: Breadcrumb + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
          <button 
            onClick={() => onSelectTool('home')}
            className="hover:text-red-600 transition-colors font-bold text-slate-800"
          >
            BharatAI
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-red-600 font-bold">{TOOL_NAMES[activeTool]}</span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, create anything..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 focus:border-red-500 rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 2: Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Launch Live Dashboard Button when on other pages */}
        {activeTool !== 'dashboard' && (
          <button
            onClick={() => onSelectTool('dashboard')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-[0.98]"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Open Dashboard</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
        </button>

        {/* User Profile - Raju Das */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold text-xs select-none shadow-2xs">
            RD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Raju Das</div>
            <div className="text-[10px] text-red-600 font-semibold">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
