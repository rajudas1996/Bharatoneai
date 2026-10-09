import React, { useState } from 'react';
import { Video, Film, Sparkles, Sliders } from 'lucide-react';
import { AnimateImageTool } from './AnimateImageTool';
import { TextToVideoTool } from './TextToVideoTool';
import { InstagramVideoEditor } from './InstagramVideoEditor';

interface UnifiedVideoEditorProps {
  initialImage?: string | null;
  onNavigateTab?: (tab: string) => void;
}

export const UnifiedVideoEditor: React.FC<UnifiedVideoEditorProps> = ({
  initialImage,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'insta_edit' | 'text_to_video' | 'animate_image'>(
    initialImage ? 'animate_image' : 'insta_edit'
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('insta_edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'insta_edit'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instagram Edits Studio</span>
          </button>

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
          <span>BharatOne Pro Suite: Timeline editor, AI scene generation & still animation</span>
        </div>
      </div>

      {/* Render Active Sub-Tool */}
      {activeSubTab === 'insta_edit' ? (
        <InstagramVideoEditor />
      ) : activeSubTab === 'text_to_video' ? (
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
