import React, { useState } from 'react';
import { 
  Sparkles, 
  BarChart3, 
  Image as ImageIcon, 
  Wand2, 
  Film, 
  Video, 
  Music, 
  Database, 
  MapPin, 
  ArrowRight, 
  Play, 
  Pause, 
  CheckCircle2, 
  FileSpreadsheet, 
  TrendingUp, 
  Search, 
  Bell, 
  HelpCircle, 
  Home, 
  FolderGit2, 
  Settings, 
  Layers, 
  Code2, 
  FileText, 
  Boxes, 
  Network, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { BharatLogo } from '../BharatLogo';
import { ToolId } from '../../types/tools';
export type { ToolId };

interface HomePageProps {
  onNavigateToTool: (toolId: ToolId) => void;
  onOpenUploadExcel?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigateToTool,
  onOpenUploadExcel,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activeMusicTag, setActiveMusicTag] = useState('Lo-fi');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExcelAction = () => {
    onNavigateToTool('dashboard');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 select-none text-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ========================================================= */}
        {/* SECTION 1: TOP HERO BANNER (As in uploaded image)         */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-b from-red-50/40 via-white to-slate-50 border border-slate-200/80 p-8 sm:p-12 shadow-xs overflow-hidden">
          {/* Subtle monument silhouette & Indian flag/red wave watermark */}
          <div className="absolute right-0 top-0 w-full sm:w-2/3 h-full pointer-events-none opacity-20 overflow-hidden flex justify-end">
            <svg viewBox="0 0 800 400" className="h-full w-auto text-red-600/30" fill="currentColor">
              {/* Silhouette representation of India Gate, domes, and modern architecture */}
              <path d="M500 380 L520 280 L540 280 L540 240 L520 240 L530 180 L570 180 L580 240 L560 240 L560 280 L580 280 L600 380 Z" opacity="0.4" />
              <path d="M600 380 L620 260 L640 200 L680 200 L700 260 L720 380 Z" opacity="0.3" />
              <path d="M380 380 L400 310 L440 310 L460 380 Z" opacity="0.5" />
              <path d="M410 310 Q420 250 430 310 Z" opacity="0.6" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Hero Copy */}
            <div className="max-w-2xl space-y-5">
              <div className="flex items-center gap-3">
                <BharatLogo className="h-10" showTagline={true} />
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                  All-in-One <br />
                  <span className="text-red-600">AI Studio</span>
                </h1>
                <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
                  Create, Analyze, Automate.
                </div>
                <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl leading-relaxed">
                  From images to videos, music to maps, AI tools to real apps — everything in one powerful platform.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigateToTool('dashboard')}
                  className="flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <span>Start Creating</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('explore-tools-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-full border border-slate-300 shadow-2xs hover:border-slate-400 transition-all"
                >
                  Explore Tools
                </button>
              </div>

              {/* Trust Badges matching image */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span className="text-red-600 font-bold">⚡ Powered by Advanced AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Secure & Reliable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Built for Bharat</span>
                </div>
              </div>
            </div>

            {/* Right Top Header Badge matching image */}
            <div className="text-left lg:text-right space-y-1.5 self-start">
              <div className="inline-block bg-white/90 backdrop-blur-xs px-4 py-2 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="text-sm font-bold text-slate-900">India&apos;s All-in-One</div>
                <div className="text-sm font-extrabold text-red-600">AI Studio Platform</div>
                <div className="text-[11px] text-slate-500 mt-1 max-w-xs leading-tight">
                  Powered by AI. Built for Bharat. Create without limits.
                </div>
              </div>

              {/* Hand-written style script badge: Ideas into Impact */}
              <div className="hidden lg:block pt-4 pr-3">
                <span className="text-2xl font-serif italic text-slate-700 tracking-wide rotate-[-6deg] block">
                  Ideas into <span className="text-red-600 font-bold">Impact</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: THE INTERACTIVE COMPUTER WORKSTATION DISPLAY   */}
        {/* ========================================================= */}
        <div className="relative">
          {/* Main Desktop Monitor Frame */}
          <div className="relative rounded-2xl bg-slate-900 p-2 sm:p-3 shadow-2xl border-4 border-slate-800">
            {/* Monitor Camera & Gloss */}
            <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-1.5" />

            {/* Monitor Screen Glass (The BharatAI Web Application inside) */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col min-h-[700px]">
              {/* Inner App Header */}
              <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
                <BharatLogo className="h-8" showTagline={false} />

                {/* Inner Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tools, create anything..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button className="relative text-slate-400 hover:text-slate-600 p-1">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
                  </button>
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    B
                  </div>
                </div>
              </div>

              {/* Inner App Body: Sidebar + Main Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Inner Mini Sidebar */}
                <div className="w-52 border-r border-slate-200 bg-white p-3 flex flex-col justify-between shrink-0 hidden md:flex">
                  <div className="space-y-1">
                    <button
                      onClick={() => onNavigateToTool('home')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white shadow-2xs"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('dashboard')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-red-600" />
                      <span>Live Dashboard</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('image-create')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>Image Create</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('image-edit')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Image Edit</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('image-to-video')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 text-orange-600" />
                      <span>Animate Image to Video</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('text-to-video')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Text to Video</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('music-generation')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Music className="w-3.5 h-3.5 text-pink-600" />
                      <span>Music Generation</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('database-auth')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-red-600" />
                      <span>Database & Auth</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTool('maps-data')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Maps Data</span>
                    </button>
                  </div>

                  {/* Bottom secondary links */}
                  <div className="pt-3 border-t border-slate-100 space-y-1 text-slate-500 text-xs">
                    <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:text-slate-800">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Projects</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:text-slate-800">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>

                {/* Inner App Workspace Content */}
                <div className="flex-1 bg-slate-50/60 p-5 overflow-y-auto space-y-5">
                  {/* Inner Hero Card with India Map Silhouette */}
                  <div className="bg-gradient-to-r from-red-50/70 via-white to-red-50/40 border border-red-200/70 rounded-xl p-5 flex items-center justify-between relative overflow-hidden shadow-2xs">
                    <div className="max-w-md relative z-10 space-y-1">
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Create. Analyze. Automate.
                      </h2>
                      <div className="text-xs font-bold text-red-700">
                        Your all-in-one AI platform for a smarter India.
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Upload your data, generate content, visualize insights and build powerful solutions — all in one place.
                      </p>
                    </div>

                    {/* India Map graphic on right matching image */}
                    <div className="w-28 h-28 opacity-90 shrink-0 hidden sm:flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-red-600 drop-shadow-sm" fill="currentColor">
                        <path d="M50 5 Q55 12 52 20 Q58 25 54 32 Q62 38 60 48 Q68 54 62 62 Q60 72 50 92 Q42 78 38 64 Q32 58 35 48 Q28 40 38 32 Q35 22 45 15 Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Middle Section: "Turn Your Excel Data into Insights" */}
                  <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-extrabold text-red-600 uppercase tracking-wide">
                        Turn Your Excel Data into Insights
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload your Excel file, view a live dashboard and get AI-powered analysis instantly.
                      </p>
                    </div>

                    {/* 3 Steps Connected with Arrows */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Step 1: Upload Excel */}
                      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 text-center flex flex-col items-center justify-between min-h-[170px] hover:border-red-300 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Upload Excel</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Upload your data file (.xlsx, .xls, csv)
                          </div>
                        </div>
                        <button
                          onClick={handleExcelAction}
                          className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors"
                        >
                          Upload File
                        </button>
                      </div>

                      {/* Step 2: Live Dashboard */}
                      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 text-center flex flex-col items-center justify-between min-h-[170px] hover:border-red-300 transition-all relative">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Live Dashboard</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            View interactive charts and insights
                          </div>
                        </div>
                        <button
                          onClick={handleExcelAction}
                          className="mt-3 px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Open Dashboard
                        </button>
                      </div>

                      {/* Step 3: Data Analysis */}
                      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 text-center flex flex-col items-center justify-between min-h-[170px] hover:border-red-300 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-2">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Data Analysis</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Get AI-powered summaries & insights
                          </div>
                        </div>
                        <button
                          onClick={handleExcelAction}
                          className="mt-3 px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Analyze Data
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lower Section: Explore AI Tools Grid */}
                  <div id="explore-tools-grid" className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-red-600" />
                        <span>Explore AI Tools</span>
                      </div>
                      <button
                        onClick={() => {
                          const el = document.getElementById('explore-tools-grid');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 8 Tool Cards in 4x2 grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* 1. Live Dashboard */}
                      <button
                        onClick={() => onNavigateToTool('dashboard')}
                        className="p-3 bg-slate-50/80 hover:bg-red-50/60 rounded-xl border border-slate-200/80 hover:border-red-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-red-700">Live Dashboard</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Upload Excel & visualize data</div>
                      </button>

                      {/* 2. Image Create */}
                      <button
                        onClick={() => onNavigateToTool('image-create')}
                        className="p-3 bg-slate-50/80 hover:bg-purple-50/60 rounded-xl border border-slate-200/80 hover:border-purple-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Image Create</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Create stunning images from text</div>
                      </button>

                      {/* 3. Image Edit */}
                      <button
                        onClick={() => onNavigateToTool('image-edit')}
                        className="p-3 bg-slate-50/80 hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Wand2 className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Image Edit</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Edit, transform and enhance images</div>
                      </button>

                      {/* 4. Animate Image to Video */}
                      <button
                        onClick={() => onNavigateToTool('image-to-video')}
                        className="p-3 bg-slate-50/80 hover:bg-orange-50/60 rounded-xl border border-slate-200/80 hover:border-orange-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">Animate Image to Video</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Turn images into engaging videos</div>
                      </button>

                      {/* 5. Text to Video */}
                      <button
                        onClick={() => onNavigateToTool('text-to-video')}
                        className="p-3 bg-slate-50/80 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Text to Video</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Generate videos from simple text</div>
                      </button>

                      {/* 6. Music Generation */}
                      <button
                        onClick={() => onNavigateToTool('music-generation')}
                        className="p-3 bg-slate-50/80 hover:bg-pink-50/60 rounded-xl border border-slate-200/80 hover:border-pink-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-2 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-pink-700">Music Generation</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Create original audio with AI</div>
                      </button>

                      {/* 7. Database & Auth */}
                      <button
                        onClick={() => onNavigateToTool('database-auth')}
                        className="p-3 bg-slate-50/80 hover:bg-red-50/60 rounded-xl border border-slate-200/80 hover:border-red-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-red-700">Database & Auth</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Build real apps with secure backend</div>
                      </button>

                      {/* 8. Maps Data */}
                      <button
                        onClick={() => onNavigateToTool('maps-data')}
                        className="p-3 bg-slate-50/80 hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-300 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Maps Data</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Use Google Maps and location data</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Stand / Monitor Base */}
          <div className="w-48 h-8 bg-gradient-to-b from-slate-400 to-slate-300 mx-auto rounded-b-xl shadow-md" />
          <div className="w-72 h-3 bg-slate-300 mx-auto rounded-full shadow-lg" />
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: FLOATING FEATURE CARDS FLANKING THE SCREEN     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* Card A: Image Create (Himalayan landscape) */}
          <div 
            onClick={() => onNavigateToTool('image-create')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Image Create</span>
              </div>
              <Sparkles className="w-3 h-3 text-red-500" />
            </div>
            <p className="text-[11px] text-slate-500 mb-2 italic">
              &ldquo;A serene Himalayan landscape, sunrise, ultra realistic&rdquo;
            </p>
            <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 relative">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
                alt="Himalayan sunrise"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card B: Text to Video (Indian Temple) */}
          <div 
            onClick={() => onNavigateToTool('text-to-video')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                <span>Text to Video</span>
              </div>
              <span className="text-[10px] text-red-600 font-bold font-mono">0:12 / 0:06</span>
            </div>
            <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 relative mb-2">
              <img
                src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
                alt="Indian temple at sunrise"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-red-600 text-red-600" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 truncate italic">
                &ldquo;A beautiful Indian temple by the river at sunrise...&rdquo;
              </p>
              <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold shrink-0">
                Generate
              </button>
            </div>
          </div>

          {/* Card C: Music Generation with Waveform */}
          <div 
            onClick={() => onNavigateToTool('music-generation')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Music className="w-3.5 h-3.5 text-pink-600" />
                <span>Music Generation</span>
              </div>
              <Sparkles className="w-3 h-3 text-red-500" />
            </div>

            {/* Waveform Player */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlayingMusic(!isPlayingMusic);
                  }}
                  className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 flex items-end gap-0.5 h-7">
                  {[40, 60, 80, 45, 90, 75, 30, 85, 95, 60, 40, 80, 100, 70, 50, 90, 85, 60, 45, 95, 70, 50, 30].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        i < 12 ? 'bg-red-500' : 'bg-slate-300'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0:00</span>
                <span>2:48</span>
              </div>
            </div>

            {/* Tags matching image */}
            <div className="flex flex-wrap gap-1">
              {['Lo-fi', 'Cinematic', 'Indian', 'Ambient'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMusicTag(tag);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                    activeMusicTag === tag
                      ? 'bg-red-100 text-red-700 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Card D: Maps Data (India Cities Map) */}
          <div 
            onClick={() => onNavigateToTool('maps-data')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Maps Data</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">Real-Time</span>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video bg-emerald-50/70 border border-emerald-100 relative p-3">
              {/* Map Canvas Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
              
              {/* City Pin Points matching image */}
              <div className="relative w-full h-full flex flex-col justify-between text-[10px] font-bold text-slate-700">
                <div className="flex justify-end pr-4">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" /> New Delhi
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs text-red-600">
                    <MapPin className="w-3 h-3 fill-red-600 text-red-600" /> Mumbai
                  </span>
                </div>
                <div className="flex justify-between px-6 pt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" /> Bengaluru
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" /> Chennai
                  </span>
                </div>
              </div>

              {/* Zoom control button */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center text-xs font-bold shadow-2xs">
                +
              </div>
            </div>
          </div>

          {/* Card E: Database & Auth Checklist */}
          <div 
            onClick={() => onNavigateToTool('database-auth')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Database className="w-3.5 h-3.5 text-red-600" />
                <span>Database & Auth</span>
              </div>
              <Sparkles className="w-3 h-3 text-red-500" />
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Secure backend for your ideas.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>User Authentication</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Real-time Database</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Secure APIs</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Scalable Infrastructure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card F: AI Tools Grid */}
          <div 
            onClick={() => onNavigateToTool('home')}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-red-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>AI Tools</span>
                </div>
                <span className="text-[10px] font-mono bg-red-100 text-red-700 px-1.5 rounded font-bold">ALL</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                More AI tools, integrations and productivity features.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                &lt;/&gt;
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Desk Accents Banner */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold">
              Build with AI
            </span>
            <span className="font-bold text-slate-800">For a Smarter India</span>
            <span className="text-slate-400">•</span>
            <span className="text-red-600 font-bold">Ideas into Impact</span>
          </div>

          <div className="text-slate-500 font-medium text-[11px]">
            &ldquo;Good Ideas Build a Brighter Bharat&rdquo;
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: EVERYTHING YOU NEED TO BUILD WITH AI (Bottom)   */}
        {/* ========================================================= */}
        <div className="pt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Build with <span className="text-red-600">AI</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              From content creation to real-world applications — a complete AI platform for modern creators and businesses.
            </p>
          </div>

          {/* 8 Horizontal Cards matching bottom of image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Live Dashboard */}
            <div 
              onClick={() => onNavigateToTool('dashboard')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Live Dashboard</div>
                <div className="text-[10px] text-slate-500 truncate">Upload Excel & visualize</div>
              </div>
            </div>

            {/* 2. Image Creation */}
            <div 
              onClick={() => onNavigateToTool('image-create')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Image Creation</div>
                <div className="text-[10px] text-slate-500 truncate">From text to stunning visuals</div>
              </div>
            </div>

            {/* 3. Image Editing */}
            <div 
              onClick={() => onNavigateToTool('image-edit')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Image Editing</div>
                <div className="text-[10px] text-slate-500 truncate">Transform & enhance</div>
              </div>
            </div>

            {/* 4. Animate to Video */}
            <div 
              onClick={() => onNavigateToTool('image-to-video')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Animate to Video</div>
                <div className="text-[10px] text-slate-500 truncate">Bring images to life</div>
              </div>
            </div>

            {/* 5. Text to Video */}
            <div 
              onClick={() => onNavigateToTool('text-to-video')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Text to Video</div>
                <div className="text-[10px] text-slate-500 truncate">Turn ideas into videos</div>
              </div>
            </div>

            {/* 6. Music Generation */}
            <div 
              onClick={() => onNavigateToTool('music-generation')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Music Generation</div>
                <div className="text-[10px] text-slate-500 truncate">Create original audio</div>
              </div>
            </div>

            {/* 7. Database & Auth */}
            <div 
              onClick={() => onNavigateToTool('database-auth')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Database & Auth</div>
                <div className="text-[10px] text-slate-500 truncate">Build real apps</div>
              </div>
            </div>

            {/* 8. Maps Data */}
            <div 
              onClick={() => onNavigateToTool('maps-data')}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Maps Data</div>
                <div className="text-[10px] text-slate-500 truncate">Integrate real-world data</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: DEEP RED BOTTOM BANNER (As in uploaded image)   */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BharatLogo className="h-8" showTagline={false} inverted={true} />
            <div className="h-5 w-[1px] bg-red-400/40 hidden sm:block" />
            <div className="text-xs text-red-100 leading-tight">
              Create • Analyze • Automate
              <div className="text-[10px] text-red-300 font-normal">
                For a Smarter, More Creative India
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white">One Platform.</div>
              <div className="text-[10px] text-red-200">Limitless Possibilities.</div>
            </div>

            <button
              onClick={() => onNavigateToTool('dashboard')}
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
              title="Launch Live Dashboard"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
