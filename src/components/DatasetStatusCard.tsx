import React from 'react';
import { FileSpreadsheet, RotateCcw, ChevronDown, Upload, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Dataset } from '../types/dashboard';

interface DatasetStatusCardProps {
  dataset: Dataset;
  onSelectSheet?: (sheetName: string) => void;
  onTriggerReset?: () => void;
  onOpenUpload?: () => void;
  onDownloadUpdatedWorkbook?: () => void;
  hasWorkbook?: boolean;
}

export const DatasetStatusCard: React.FC<DatasetStatusCardProps> = ({
  dataset,
  onSelectSheet,
  onTriggerReset,
  onOpenUpload,
  onDownloadUpdatedWorkbook,
  hasWorkbook = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 mb-4 select-none">
      {/* Line 1: Active Excel Heading in bold + Workbook Sync Status */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-red-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">Active Excel</h2>
        </div>
        
        {/* Real-time Workbook Sync Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Workbook Synced with Visualizations</span>
        </div>
      </div>

      {/* Line 2: file name, select sheet drop down, reupload the excel, download updated workbook, reset in one line */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* File Name */}
        <div 
          className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200/70 max-w-xs truncate"
          title={dataset.fileName}
        >
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{dataset.fileName}</span>
        </div>

        {/* Select Sheet Drop Down */}
        {dataset.availableSheets && dataset.availableSheets.length > 0 && onSelectSheet ? (
          <div className="relative">
            <select
              value={dataset.sheetName}
              onChange={(e) => onSelectSheet(e.target.value)}
              className="bg-white hover:bg-slate-50 border border-slate-200 focus:border-red-500 text-slate-800 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 outline-none appearance-none cursor-pointer transition-colors shadow-2xs"
            >
              {dataset.availableSheets.map((s) => (
                <option key={s} value={s}>
                  Sheet: {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : null}

        {/* Download / Export Updated Workbook with Modifications Reflected */}
        {onDownloadUpdatedWorkbook && hasWorkbook && (
          <button
            onClick={onDownloadUpdatedWorkbook}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
            title="Download workbook (.xlsx) containing all original data plus synchronized visualization modifications"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Updated Workbook (.xlsx)</span>
          </button>
        )}

        {/* Re-upload the Excel */}
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
            title="Re-upload or change Excel file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Re-upload Excel</span>
          </button>
        )}

        {/* Reset */}
        {onTriggerReset && (
          <button
            onClick={onTriggerReset}
            className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
            title="Reset dataset and clear workspace"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            <span>Reset</span>
          </button>
        )}

        {/* Summary info badge (rows & cols) on the right */}
        <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">{dataset.totalRows.toLocaleString()} rows</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">{dataset.totalColumns} cols</span>
        </div>
      </div>
    </div>
  );
};
