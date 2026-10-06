import React from 'react';
import { Folder, FileSpreadsheet, Image as ImageIcon, Video, Music, Calendar, Clock, ArrowRight } from 'lucide-react';
import { MainNavTab } from '../Sidebar';

interface ProjectsViewProps {
  onSelectTab: (tab: MainNavTab) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectTab }) => {
  const projects = [
    { title: 'Corporate Insurance Lead Analysis 2026', type: 'Excel Dashboard', date: 'Today, 2:45 PM', size: '2.4 MB', tab: 'dashboard' as MainNavTab, icon: FileSpreadsheet, color: 'text-red-600 bg-red-50' },
    { title: 'Mumbai Futuristic Skyline Render 4K', type: 'AI Image', date: 'Yesterday', size: '4.8 MB', tab: 'image_create' as MainNavTab, icon: ImageIcon, color: 'text-purple-600 bg-purple-50' },
    { title: 'Kerala Tea Plantation Drone Reel', type: 'Text to Video', date: '2 days ago', size: '18.2 MB', tab: 'text_to_video' as MainNavTab, icon: Video, color: 'text-blue-600 bg-blue-50' },
    { title: 'Indian Raga & Classical Sitar Master', type: 'Audio Composition', date: '3 days ago', size: '8.1 MB', tab: 'music_gen' as MainNavTab, icon: Music, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Workspace Projects</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
            Active Library
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Access your recent dashboards, generated media assets, and exports
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(p.tab)}
              className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 flex items-center justify-between cursor-pointer group transition-all hover:shadow-xs hover:border-slate-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{p.type}</span>
                    <span>•</span>
                    <span>{p.date}</span>
                    <span>•</span>
                    <span>{p.size}</span>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
