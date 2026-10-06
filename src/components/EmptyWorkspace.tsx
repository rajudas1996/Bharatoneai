import React, { useRef, useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  ShieldCheck, 
  Layers, 
  SlidersHorizontal, 
  TrendingUp,
  Download,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Dataset } from '../types/dashboard';
import { parseExcelFile, exportFilteredToExcel } from '../utils/excelParser';
import { getDemoDataset } from '../data/demoData';
import * as XLSX from 'xlsx';

interface EmptyWorkspaceProps {
  onDatasetLoaded: (dataset: Dataset, workbook?: XLSX.WorkBook) => void;
}

export const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({ onDatasetLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    try {
      setLoadingStep('Analyzing Excel data & detecting master lead columns...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      setLoadingStep('Mapping LOB, Policy Types, RMs, and Renewal trends...');
      const { dataset, workbook } = await parseExcelFile(file);

      await new Promise((resolve) => setTimeout(resolve, 250));
      setLoadingStep('Building Power BI interactive lead dashboard...');
      await new Promise((resolve) => setTimeout(resolve, 200));

      onDatasetLoaded(dataset, workbook);
      setLoadingStep(null);
    } catch (err: any) {
      console.error('Excel parse failure:', err);
      setErrorMsg(err.message || 'Failed to parse Excel file. Please ensure it contains data.');
      setLoadingStep(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleLoadSampleData = () => {
    const demo = getDemoDataset();
    onDatasetLoaded(demo);
  };

  const handleDownloadSampleTemplate = () => {
    const demo = getDemoDataset();
    exportFilteredToExcel(demo.rows, demo.columns, 'Epoch_Master_Lead_Sheet_Template');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header Banner */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span>Client-Side Processing · 100% Data Confidentiality</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Upload Excel File to Launch Live Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1 font-normal">
          Automatically detect columns, compute KPIs, and interact with Power BI-style charts in real time.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Upload error: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Primary Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
        {loadingStep ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <div className="text-sm font-bold text-slate-900">{loadingStep}</div>
            <p className="text-xs text-slate-500">
              Processing in memory. No data is stored externally.
            </p>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-10 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-xl ${
              isDragging
                ? 'border-red-600 bg-red-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-red-500 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-100 shadow-2xs mb-4">
              <FileSpreadsheet className="w-7 h-7 text-red-600" />
            </div>

            <h2 className="text-base font-bold text-slate-900 mb-1">
              Upload Master Lead Sheet (.xlsx or .xls)
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Automatically indexes State-wise Leads, RM Assignment, Policy Type Mix, Renewal Months, and LOB Distribution.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all pointer-events-none"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Excel File</span>
            </button>
          </div>
        )}

        {/* Footer info inside card */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Master Lead Sheet (2,843 leads)</span>
          </button>

          <button
            onClick={handleDownloadSampleTemplate}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel Template</span>
          </button>
        </div>
      </div>

      {/* Feature highlights grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2.5 font-semibold">
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 mb-1">Interactive Cross-Filtering</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Click any bar or slice to immediately cross-filter all KPIs, charts, and the bottom raw lead table.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2.5 font-semibold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 mb-1">9-Field Top Filter Bar</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Filter by Import Date, Lead Source, RM, Current Status, LOB, Policy Type, Renewal Month, State, and City.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2.5 font-semibold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 mb-1">Raw Lead Table at Bottom</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Live preview table automatically shortens as filters are applied, showing only matching filtered rows.
          </p>
        </div>
      </div>
    </div>
  );
};
