import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  Video, 
  Film, 
  Music, 
  Database, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  FileSpreadsheet,
  Layers,
  Cpu,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

export type ToolId = 
  | 'home' 
  | 'dashboard' 
  | 'image-create' 
  | 'image-edit' 
  | 'image-to-video' 
  | 'text-to-video' 
  | 'music-generation' 
  | 'database-auth' 
  | 'maps-data';

interface HomePageProps {
  onNavigateToTool: (toolId: ToolId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToTool }) => {
  const tools = [
    {
      id: 'dashboard' as ToolId,
      title: 'Live Dashboard',
      category: 'Analytics & BI',
      badge: 'Core Engine',
      badgeColor: 'bg-red-600 text-white',
      desc: 'Upload Excel, visualize your data, analyze insights and create interactive dashboards with dynamic cross-filtering.',
      icon: BarChart3,
      highlight: true,
      stats: 'Instant Excel Parsing • Power BI Style • Dynamic KPIs',
      buttonText: 'Open Live Dashboard',
    },
    {
      id: 'image-create' as ToolId,
      title: 'Image Creator',
      category: 'Visual AI',
      badge: 'Generative',
      badgeColor: 'bg-red-50 text-red-700 border border-red-200',
      desc: 'Generate ultra-high definition corporate assets, marketing graphics, and product visuals from natural language prompts.',
      icon: ImageIcon,
      highlight: false,
      stats: 'Multiple Aspect Ratios • Style Presets • 4K Upscale',
      buttonText: 'Launch Image Creator',
    },
    {
      id: 'image-edit' as ToolId,
      title: 'Image Editor',
      category: 'Visual AI',
      badge: 'Precision Edit',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200',
      desc: 'Instruction-based visual editing with background transformation, studio lighting, inpainting, and before/after previews.',
      icon: Wand2,
      highlight: false,
      stats: 'Before/After Slider • Semantic Instructions • Retouching',
      buttonText: 'Open Image Editor',
    },
    {
      id: 'image-to-video' as ToolId,
      title: 'Animate Image to Video',
      category: 'Motion AI',
      badge: 'Motion Synthesis',
      badgeColor: 'bg-red-50 text-red-700 border border-red-200',
      desc: 'Transform static images and corporate photos into fluid cinematic video clips with camera movement and zoom controls.',
      icon: Film,
      highlight: false,
      stats: 'Camera Pans & Orbits • Motion Strength • MP4 Output',
      buttonText: 'Animate Still Images',
    },
    {
      id: 'text-to-video' as ToolId,
      title: 'Text to Video',
      category: 'Motion AI',
      badge: 'Generative Video',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200',
      desc: 'Produce cinematic 1080p video scenes directly from textual descriptions with camera angle and motion presets.',
      icon: Video,
      highlight: false,
      stats: 'Cinematic Camera • 24/60 FPS • Multi-Scene Sequencing',
      buttonText: 'Create Text to Video',
    },
    {
      id: 'music-generation' as ToolId,
      title: 'Music Generator',
      category: 'Audio AI',
      badge: 'Harmonic Synthesis',
      badgeColor: 'bg-red-50 text-red-700 border border-red-200',
      desc: 'Compose background soundtracks, corporate jingles, and ambient lo-fi audio tracks customized by genre, BPM, and mood.',
      icon: Music,
      highlight: false,
      stats: 'Waveform Player • Genre Blending • Audio Download',
      buttonText: 'Compose Music',
    },
    {
      id: 'database-auth' as ToolId,
      title: 'Database & Auth',
      category: 'Infrastructure',
      badge: 'Enterprise Backend',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200',
      desc: 'Developer control center for PostgreSQL Cloud SQL, Firebase Auth, schema exploration, security rules, and user tables.',
      icon: Database,
      highlight: false,
      stats: 'User Management • Query Console • API Credentials',
      buttonText: 'Manage Database & Auth',
    },
    {
      id: 'maps-data' as ToolId,
      title: 'Maps & Location Data',
      category: 'Geospatial Intelligence',
      badge: 'Spatial Engine',
      badgeColor: 'bg-red-50 text-red-700 border border-red-200',
      desc: 'Geographic visualization, territory coverage, regional performance heatmaps, and spatial business intelligence.',
      icon: MapPin,
      highlight: false,
      stats: 'Cluster Pins • Territory Heatmaps • POI Directory',
      buttonText: 'Explore Maps & Locations',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-white border border-slate-200/90 p-8 shadow-xs overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold mb-4 border border-red-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Epoch AI Studio • Unified Enterprise Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            All-in-One <span className="text-red-600">Enterprise AI</span> Platform
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Switch seamlessly between live Excel interactive analytics, creative visual generation, 
            motion video synthesis, musical composition, and developer infrastructure.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTool('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateToTool('image-create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all"
            >
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span>Create AI Images</span>
            </button>

            <button
              onClick={() => onNavigateToTool('text-to-video')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all"
            >
              <Video className="w-4 h-4 text-slate-600" />
              <span>Generate Videos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Core Tool Banner: LIVE DASHBOARD */}
      <div className="rounded-2xl bg-white border-2 border-red-500/80 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Featured Core Module
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  Zero Data Modification
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Live Interactive Excel Dashboard
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl mt-1">
                Upload any Excel file, automatically detect column headers, cross-filter dynamically across Power BI-style charts, inspect statistical schemas, and export filtered datasets instantly.
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automatic Header Detection
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dynamic KPI Cards
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Trend Analysis Overlays
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Multi-Sheet Support
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={() => onNavigateToTool('dashboard')}
              className="w-full lg:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Open Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Explore AI Workspace Tools</h2>
            <p className="text-xs text-slate-500">Select any tool to start creating or analyzing</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            8 Specialized Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-red-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-red-50 text-slate-700 group-hover:text-red-600 flex items-center justify-center border border-slate-200 group-hover:border-red-200 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>
                      {t.badge}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    {t.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-red-600 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {t.desc}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-mono py-2 border-t border-slate-100 mb-3 truncate">
                    {t.stats}
                  </div>
                  <button
                    onClick={() => onNavigateToTool(t.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-red-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-red-600 shadow-2xs group-hover:bg-red-600 group-hover:text-white"
                  >
                    <span>{t.buttonText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
