import React from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Image as ImageIcon, 
  Sparkles, 
  Video, 
  Film, 
  Music, 
  Database, 
  MapPin, 
  Upload, 
  Play, 
  FileSpreadsheet, 
  Bot, 
  SlidersHorizontal 
} from 'lucide-react';
import { Dataset } from '../types/dashboard';

interface HomePageProps {
  onOpenUpload: () => void;
  onNavigateToDashboard: () => void;
  onOpenTool: (toolId: string) => void;
  dataset: Dataset | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenUpload,
  onNavigateToDashboard,
  onOpenTool,
  dataset,
}) => {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Feature Workflow Card: Turn Your Excel Data into Insights */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 lg:p-6">
        {/* Card Header */}
        <div className="mb-5">
          <h2 className="text-lg lg:text-xl font-extrabold text-red-600 tracking-tight">
            Turn Your Excel Data into Insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your Excel file, view a live dashboard and get AI-powered analysis instantly.
          </p>
        </div>

        {/* 3 Process Steps with Connecting Red Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 md:gap-2 items-center">
          {/* STEP 1: Upload Excel (Clickable Upload File Action) */}
          <div className="md:col-span-3 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 p-4.5 flex flex-col items-center text-center transition-all hover:shadow-xs hover:border-red-200 group">
            {/* Green Excel Document Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="28" height="26" rx="5" fill="#107C41" />
                <path d="M 6 16 L 26 16 M 16 6 L 16 26" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" />
                <path d="M 12 11 L 20 21 M 20 11 L 12 21" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>

            <h3 className="text-xs font-bold text-slate-900 mb-0.5">
              Upload Excel
            </h3>
            <p className="text-[11px] text-slate-400 mb-3.5 max-w-[190px]">
              Upload your data file (.xlsx, .xls, .csv)
            </p>

            <button
              onClick={onOpenUpload}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Red Connecting Arrow 1 */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center text-red-500">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* STEP 2: Live Dashboard (Clean informational step, non-clickable, no button per Attachment 3) */}
          <div className="md:col-span-3 bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4.5 flex flex-col items-center text-center">
            {/* Miniature Charts Graphic */}
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mb-3 shadow-2xs">
              <svg width="32" height="26" viewBox="0 0 34 28" fill="none">
                <rect x="2" y="14" width="4" height="12" rx="1" fill="#a855f7" />
                <rect x="8" y="8" width="4" height="18" rx="1" fill="#8b5cf6" />
                <rect x="14" y="4" width="4" height="22" rx="1" fill="#6366f1" />
                <circle cx="25" cy="14" r="8" stroke="#2563eb" strokeWidth="3.5" strokeDasharray="38 12" fill="none" />
              </svg>
            </div>

            <h3 className="text-xs font-bold text-slate-900 mb-0.5">
              Live Dashboard
            </h3>
            <p className="text-[11px] text-slate-400 max-w-[190px]">
              View interactive charts and insights
            </p>
          </div>

          {/* Red Connecting Arrow 2 */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center text-red-500">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* STEP 3: Data Analysis (Clean informational step, non-clickable, no button per Attachment 3) */}
          <div className="md:col-span-3 bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4.5 flex flex-col items-center text-center">
            {/* AI Analyzer Badge Icon */}
            <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-center mb-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-900 mb-0.5">
              Data Analysis
            </h3>
            <p className="text-[11px] text-slate-400 max-w-[190px]">
              Get AI-powered summaries & insights
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section: Explore AI Tools (8 Cards in 4x2 Grid) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Explore AI Tools
            </h2>
          </div>

          <button
            onClick={() => onOpenTool('all_tools')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 AI Tool Cards matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Live Dashboard */}
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-red-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Live Dashboard
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Upload Excel & visualize data
              </p>
            </div>
          </button>

          {/* 2. Image Create */}
          <button
            type="button"
            onClick={() => onOpenTool('image_create')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-purple-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Image Create
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Create stunning images from text
              </p>
            </div>
          </button>

          {/* 3. Image Edit */}
          <button
            type="button"
            onClick={() => onOpenTool('image_edit')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-emerald-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Image Edit
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Edit, transform and enhance images
              </p>
            </div>
          </button>

          {/* 4. Animate Image to Video */}
          <button
            type="button"
            onClick={() => onOpenTool('animate_image')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-orange-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Animate Image to Video
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Turn images into engaging videos
              </p>
            </div>
          </button>

          {/* 5. Text to Video */}
          <button
            type="button"
            onClick={() => onOpenTool('text_to_video')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-blue-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Text to Video
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Generate videos from simple text
              </p>
            </div>
          </button>

          {/* 6. Music Generation */}
          <button
            type="button"
            onClick={() => onOpenTool('music_gen')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-purple-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Music Generation
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Create original audio with AI
              </p>
            </div>
          </button>

          {/* 7. Database & Auth */}
          <button
            type="button"
            onClick={() => onOpenTool('database_auth')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-red-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Database & Auth
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Build real apps with secure backend
              </p>
            </div>
          </button>

          {/* 8. Maps Data */}
          <button
            type="button"
            onClick={() => onOpenTool('maps_data')}
            className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 flex items-center gap-3.5 text-left transition-all hover:shadow-xs hover:border-emerald-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Maps Data
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Use Google Maps and location data
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
