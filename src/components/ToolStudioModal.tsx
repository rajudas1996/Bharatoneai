import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Film, 
  Music, 
  Database, 
  MapPin, 
  SlidersHorizontal, 
  Download, 
  Play, 
  Settings, 
  Folder, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface ToolStudioModalProps {
  toolId: string | null;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  onOpenUpload: () => void;
}

export const ToolStudioModal: React.FC<ToolStudioModalProps> = ({
  toolId,
  onClose,
  onNavigateToDashboard,
  onOpenUpload,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!toolId) return null;

  const handleAction = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1200);
  };

  const toolDetails: Record<string, { title: string; desc: string; icon: any; color: string }> = {
    image_create: {
      title: 'Image Creator',
      desc: 'Generate photorealistic, high-resolution AI imagery from natural language prompts.',
      icon: ImageIcon,
      color: 'bg-purple-600',
    },
    image_edit: {
      title: 'Image Edit & Enhance',
      desc: 'Inpaint, remove backgrounds, adjust lighting, and transform uploaded photos.',
      icon: SlidersHorizontal,
      color: 'bg-emerald-600',
    },
    animate_image: {
      title: 'Animate Image to Video',
      desc: 'Breathe cinematic motion into any still graphic or photograph with neural dynamics.',
      icon: Film,
      color: 'bg-amber-500',
    },
    text_to_video: {
      title: 'Text to Video Studio',
      desc: 'Generate seamless 1080p video sequences from descriptive scripts and prompts.',
      icon: Video,
      color: 'bg-blue-500',
    },
    music_gen: {
      title: 'AI Music & Audio Generation',
      desc: 'Compose original ambient tracks, background scores, and classical Indian ragas.',
      icon: Music,
      color: 'bg-purple-500',
    },
    database_auth: {
      title: 'Database & Auth Manager',
      desc: 'Provision live schemas, manage user profiles, and test authenticated API calls.',
      icon: Database,
      color: 'bg-red-500',
    },
    maps_data: {
      title: 'Maps & Spatial Intelligence',
      desc: 'Overlay location coordinates, territory heatmaps, and route optimization across India.',
      icon: MapPin,
      color: 'bg-emerald-500',
    },
    all_tools: {
      title: 'Bharat 1 AI Tool Suite',
      desc: 'Explore the full spectrum of generative tools, data workflows, and agent pipelines.',
      icon: Sparkles,
      color: 'bg-red-600',
    },
    projects: {
      title: 'Workspace Projects',
      desc: 'Manage your active workspaces, exported dashboards, and generated media assets.',
      icon: Folder,
      color: 'bg-slate-700',
    },
    settings: {
      title: 'Platform Settings',
      desc: 'Configure API keys, user privileges, default color themes, and export preferences.',
      icon: Settings,
      color: 'bg-slate-700',
    },
    help: {
      title: 'Help & Support Center',
      desc: 'Browse user documentation, Excel formatting guides, and technical tutorials.',
      icon: HelpCircle,
      color: 'bg-slate-700',
    },
  };

  const current = toolDetails[toolId] || {
    title: 'Bharat 1 AI Tool',
    desc: 'Interactive generative feature',
    icon: Sparkles,
    color: 'bg-red-600',
  };

  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${current.color} text-white flex items-center justify-center shadow-xs`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{current.title}</h2>
              <p className="text-[11px] text-slate-500">{current.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Enter Prompt / Description
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want ${current.title} to do...`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-red-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Powered by Bharat 1 AI Multimodal Engine
            </span>
            <button
              onClick={handleAction}
              disabled={isGenerating}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Generation</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Result Simulation */}
          {hasGenerated && (
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-700 text-[11px] uppercase tracking-wider">
                  Generated Output Preview
                </span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-mono font-semibold">
                  Complete
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Asset created successfully using parameters from prompt &ldquo;{prompt || 'Default showcase'}&rdquo;.
              </p>
            </div>
          )}

          {/* Quick link back to Excel Live Dashboard */}
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Need to visualize Excel data?</div>
              <div className="text-[11px] text-slate-500">Jump directly to the interactive Power BI dashboard</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToDashboard();
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
