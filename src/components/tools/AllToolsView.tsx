import React from 'react';
import { 
  Sparkles, 
  BarChart3, 
  Image as ImageIcon, 
  Video, 
  Music, 
  MapPin, 
  ArrowRight,
  Briefcase,
  Folder,
  Settings,
  Lock
} from 'lucide-react';
import { MainNavTab } from '../Sidebar';

interface AllToolsViewProps {
  onSelectTab: (tab: MainNavTab) => void;
}

export const AllToolsView: React.FC<AllToolsViewProps> = ({ onSelectTab }) => {
  const tools = [
    { id: 'dashboard' as MainNavTab, title: 'Live Dashboard', desc: 'Convert Excel files into interactive dashboards with charts and filters', icon: BarChart3, color: 'bg-red-600' },
    { id: 'sales_crm' as MainNavTab, title: 'Sales CRM', desc: 'Track deals, sales pipeline, client contacts, and revenue forecasts', icon: Briefcase, color: 'bg-blue-600' },
    { id: 'image_editor' as MainNavTab, title: 'Image Editor', desc: 'AI image generation and studio canvas editing with filters and effects', icon: ImageIcon, color: 'bg-purple-600' },
    { id: 'video_editor' as MainNavTab, title: 'Video Editor', desc: 'Generate cinematic video scenes or animate still images with motion', icon: Video, color: 'bg-amber-500' },
    { id: 'music_gen' as MainNavTab, title: 'Music Generation', desc: 'Synthesize original beats, classical Indian ragas, and soundtracks', icon: Music, color: 'bg-purple-500' },
    { id: 'maps_data' as MainNavTab, title: 'Maps Data', desc: 'Spatial intelligence, regional hubs, and revenue analytics across India', icon: MapPin, color: 'bg-emerald-500' },
    { id: 'projects' as MainNavTab, title: 'Projects', desc: 'Manage saved exports, uploaded workbooks, and generated assets', icon: Folder, color: 'bg-amber-600' },
    { id: 'settings' as MainNavTab, title: 'Settings', desc: 'Database & Auth manager (Admin protected: raju1234) and system settings', icon: Settings, color: 'bg-slate-800' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Bharat 1 AI Suite</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">
            All Tools
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select any studio application to launch the dedicated workspace
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-start text-left transition-all hover:shadow-xs hover:border-red-200 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${t.color} text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                {t.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {t.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-red-600">
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
