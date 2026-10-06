import React from 'react';
import { FileSpreadsheet, RotateCcw, ChevronDown } from 'lucide-react';
import { Dataset } from '../types/dashboard';

interface DatasetStatusCardProps {
  dataset: Dataset;
  onSelectSheet?: (sheetName: string) => void;
  onTriggerReset?: () => void;
}

export const DatasetStatusCard: React.FC<DatasetStatusCardProps> = ({
  dataset,
  onSelectSheet,
  onTriggerReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 mb-4 max-w-sm select-none">
      {/* Top Header: Icon + ACTIVE EXCEL + Reset (Matches Attachment 4) */}
      <div className="flex items-center justify-between text-slate-500 mb-1.5">
        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-red-500" />
          ACTIVE EXCEL
        </span>
        {onTriggerReset && (
          <button
            onClick={onTriggerReset}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
            title="Reset dataset"
          >
            <RotateCcw className="w-3 h-3 text-red-600" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* File Name */}
      <div className="font-bold text-slate-900 text-xs sm:text-sm truncate mb-2" title={dataset.fileName}>
        {dataset.fileName}
      </div>

      {/* Sheet Dropdown Selector */}
      {dataset.availableSheets && dataset.availableSheets.length > 0 && onSelectSheet ? (
        <div className="relative mb-2">
          <select
            value={dataset.sheetName}
            onChange={(e) => onSelectSheet(e.target.value)}
            className="w-full bg-slate-50 hover:bg-white border border-slate-200 focus:border-red-500 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none appearance-none cursor-pointer transition-colors pr-7"
          >
            {dataset.availableSheets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      ) : null}

      {/* Footer: Rows & Columns Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1 border-t border-slate-100">
        <span className="font-semibold text-slate-700">{dataset.totalRows.toLocaleString()} rows</span>
        <span className="font-semibold text-slate-700">{dataset.totalColumns} cols</span>
      </div>
    </div>
  );
};
