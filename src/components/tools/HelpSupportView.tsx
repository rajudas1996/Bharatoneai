import React from 'react';
import { HelpCircle, FileSpreadsheet, BookOpen, MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const faqs = [
    { q: 'What Excel formats are supported in Live Dashboard?', a: 'Bharat 1 AI supports .xlsx, .xls, and .csv files. Both single-sheet and multi-sheet workbooks are automatically detected with sheet tabs.' },
    { q: 'How does header detection work?', a: 'When you upload a file, the engine automatically categorizes column headers into Numeric, Categorical, Date, and Text, and configures appropriate KPI aggregations and chart types.' },
    { q: 'How do I download or export my generated artwork or video?', a: 'Every studio tool features a dedicated Export / Download button in the top right to download full-resolution PNG images, MP4 videos, or WAV audio files.' },
    { q: 'Can I re-upload or reset my data?', a: 'Yes! Inside the Live Dashboard, the Active Excel card provides one-click "Re-upload Excel" and "Reset" buttons.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <span>Help & Support Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about Bharat 1 AI tools, dashboard features, and formatting
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900">Excel Formatting Guidelines</h2>
          <p className="text-[11px] text-slate-500 leading-normal">
            Ensure your spreadsheet contains column headers on Row 1 with clean numeric data for best automated chart generation.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900">Studio Tool Tutorials</h2>
          <p className="text-[11px] text-slate-500 leading-normal">
            Explore guides on creating high-fidelity prompts for Image Creator, motion parameters for Animate Image, and multi-scene scripts for Text to Video.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <h3 className="text-xs font-bold text-slate-900">{f.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
