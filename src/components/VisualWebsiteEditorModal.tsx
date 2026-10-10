import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Check, 
  Undo, 
  Redo, 
  Save, 
  Sliders, 
  Type, 
  Layout, 
  Layers, 
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { VisualElementConfig } from '../types/multiCompany.types';
import { getVisualEditorConfig, saveVisualEditorConfig, DEFAULT_VISUAL_ELEMENTS } from '../utils/multiCompanyStore';

interface VisualWebsiteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onElementsUpdated: () => void;
}

export const VisualWebsiteEditorModal: React.FC<VisualWebsiteEditorModalProps> = ({
  isOpen,
  onClose,
  onElementsUpdated,
}) => {
  const [elements, setElements] = useState<VisualElementConfig[]>(() => getVisualEditorConfig());
  const [selectedSection, setSelectedSection] = useState<'all' | 'homepage' | 'navigation'>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const filtered = elements.filter(el => selectedSection === 'all' || el.section === selectedSection);

  const handleUpdateText = (id: string, text: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, customText: text } : el));
  };

  const handleToggleVisible = (id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, isVisible: !el.isVisible } : el));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...elements];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setElements(newArr);
  };

  const handleMoveDown = (index: number) => {
    if (index === elements.length - 1) return;
    const newArr = [...elements];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setElements(newArr);
  };

  const handleResetToDefault = () => {
    if (confirm('Reset all website visual texts and layout to defaults?')) {
      setElements(DEFAULT_VISUAL_ELEMENTS);
      saveVisualEditorConfig(DEFAULT_VISUAL_ELEMENTS);
      onElementsUpdated();
    }
  };

  const handlePublish = () => {
    saveVisualEditorConfig(elements);
    onElementsUpdated();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Bharat 1 AI Admin — Visual Website Editor
              </h3>
              <p className="text-[11px] text-red-100">
                Visual Edit Mode: Live customize headings, navigation menus, labels and section visibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs & Tools */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSection === 'all' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setSelectedSection('homepage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSection === 'homepage' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Home Page
            </button>
            <button
              onClick={() => setSelectedSection('navigation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSection === 'navigation' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sidebar Navigation
            </button>
          </div>

          <button
            onClick={handleResetToDefault}
            className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Visual edits published successfully! Updated across application.</span>
            </div>
          )}

          {filtered.map((el, idx) => (
            <div
              key={el.id}
              className={`p-4 rounded-2xl border transition-all ${
                el.isVisible ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/80 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">
                    {el.section}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {el.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(el.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      el.isVisible ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={el.isVisible ? 'Visible on page' : 'Hidden from page'}
                  >
                    {el.isVisible ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === filtered.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Text / Heading Content:
                </label>
                <input
                  type="text"
                  value={el.customText || ''}
                  onChange={(e) => handleUpdateText(el.id, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
