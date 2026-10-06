import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Table2, 
  Columns3, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { Dataset } from '../types/dashboard';

interface DatasetStatusCardProps {
  dataset: Dataset;
  onViewDetails: () => void;
}

export const DatasetStatusCard: React.FC<DatasetStatusCardProps> = ({
  dataset,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Icon and Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
            <FileSpreadsheet className="w-6 h-6 text-red-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white fill-emerald-500" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {dataset.fileName.replace(/\.[^/.]+$/, '')} Uploaded Successfully
            </h2>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            Active Sheet: <span className="font-semibold text-slate-700">{dataset.sheetName}</span> • {dataset.totalColumns} detected headers ready for dynamic visualization
          </p>
        </div>
      </div>

      {/* Middle: Stats */}
      <div className="flex items-center gap-6 sm:gap-8 text-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Total Rows
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {dataset.totalRows.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Columns3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Total Columns
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {dataset.totalColumns}
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Last Updated
            </div>
            <div className="text-xs font-semibold text-slate-800">
              {dataset.uploadedAt || 'Active Session'}
            </div>
          </div>
        </div>
      </div>

      {/* Right: View File Details Button */}
      <button
        onClick={onViewDetails}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg shadow-2xs transition-colors shrink-0"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>View File Details</span>
      </button>
    </div>
  );
};
