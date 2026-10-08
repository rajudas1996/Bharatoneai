import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { ImageCreatorTool } from './ImageCreatorTool';
import { ImageEditorTool } from './ImageEditorTool';

interface UnifiedImageEditorProps {
  initialImage?: string | null;
  onNavigateTab?: (tab: string) => void;
}

export const UnifiedImageEditor: React.FC<UnifiedImageEditorProps> = ({
  initialImage,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'edit'>(
    initialImage ? 'edit' : 'create'
  );
  const [editorImage, setEditorImage] = useState<string | null>(initialImage || null);

  const handleSendToEditor = (imageUrl: string) => {
    setEditorImage(imageUrl);
    setActiveSubTab('edit');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Sub-Tab Navigation Header: Merge Image Creator & Image Edit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Image Creator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'edit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Image Editor & Studio</span>
            {editorImage && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-600" />
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
          <span>Unified Image Suite: Create AI visuals or edit existing photos</span>
        </div>
      </div>

      {/* Render Active Sub-Tool */}
      {activeSubTab === 'create' ? (
        <ImageCreatorTool
          onSendToEditor={handleSendToEditor}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <ImageEditorTool
          initialImage={editorImage}
          onNavigateToCreator={() => setActiveSubTab('create')}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
