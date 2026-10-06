import React from 'react';
import { 
  Search, 
  Upload, 
  Bell, 
  FileSpreadsheet, 
  X,
  HelpCircle
} from 'lucide-react';
import { Dataset } from '../types/dashboard';

interface HeaderProps {
  dataset: Dataset | null;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  onOpenUpload: () => void;
  onSelectSheet?: (sheetName: string) => void;
  onOpenHelp?: () => void;
  isDashboardView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  globalSearch,
  setGlobalSearch,
  onOpenUpload,
  onSelectSheet,
  onOpenHelp,
  isDashboardView = false,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 shrink-0 z-10 select-none">
      {/* Center Search Bar matching reference image */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search tools, create anything..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 focus:border-red-500 rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-2xs"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions: Sheet Switcher (if on Dashboard), Help, Notifications, User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sheet Selector dropdown if available */}
        {isDashboardView && dataset && dataset.availableSheets && dataset.availableSheets.length > 1 && onSelectSheet && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-500" />
            <select
              value={dataset.sheetName}
              onChange={(e) => onSelectSheet(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-xs font-semibold text-slate-800 pr-1"
            >
              {dataset.availableSheets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Excel Button (on Dashboard view) */}
        {isDashboardView && (
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-98"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        )}

        {/* Help Icon */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notification Bell with Red Badge "3" matching reference image */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          title="3 Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono border-2 border-white">
            3
          </span>
        </button>

        {/* User Profile Avatar matching reference image (dark slate circle with letter B/R) */}
        <div className="flex items-center gap-2 pl-1">
          <div 
            className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs select-none shadow-xs border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
            title="Profile: Raju Das (Admin)"
          >
            B
          </div>
        </div>
      </div>
    </header>
  );
};
