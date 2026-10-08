import React, { useState } from 'react';
import { Video, Film } from 'lucide-react';
import { AnimateImageTool } from './AnimateImageTool';
import { TextToVideoTool } from './TextToVideoTool';

interface UnifiedVideoEditorProps {
  initialImage?: string | null;
  onNavigateTab?: (tab: string) => void;
}

export const UnifiedVideoEditor: React.FC<UnifiedVideoEditorProps> = ({
  initialImage,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'text_to_video' | 'animate_image'>(
    initialImage ? 'animate_image' : 'text_to_video'
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Sub-Tab Navigation Header: Merge Text to Video & Animate Image to Video into Video Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('text_to_video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'text_to_video'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Text to Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('animate_image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'animate_image'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Animate Image to Video</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
          <span>Unified Video Suite: Generate AI cinematic scenes or animate stills</span>
        </div>
      </div>

      {/* Render Active Sub-Tool */}
      {activeSubTab === 'text_to_video' ? (
        <TextToVideoTool />
      ) : (
        <AnimateImageTool
          initialImage={initialImage}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
