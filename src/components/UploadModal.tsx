import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Download,
  FileType
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dataset } from '../types/dashboard';
import { parseExcelFile, exportFilteredToExcel } from '../utils/excelParser';
import { getDemoDataset } from '../data/demoData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset, workbook?: XLSX.WorkBook) => void;
  currentDataset: Dataset | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
  currentDataset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);

    // Validate file extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    try {
      setLoadingStep('Analyzing Excel data & detecting column headers...');
      await new Promise((resolve) => setTimeout(resolve, 350));

      setLoadingStep('Inferring schema types, metrics, and relationships...');
      const { dataset, workbook } = await parseExcelFile(file);

      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoadingStep('Building interactive Power BI dashboard...');
      await new Promise((resolve) => setTimeout(resolve, 250));

      onDatasetLoaded(dataset, workbook);
      setLoadingStep(null);
      onClose();
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

  const handleDownloadSampleExcel = () => {
    const demo = getDemoDataset();
    exportFilteredToExcel(demo.rows, demo.columns, 'Epoch_Enterprise_Sample_Data');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upload Excel Spreadsheet</h2>
              <p className="text-[11px] text-slate-500">
                Transforms any .xlsx or .xls file into a live interactive dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Upload failed: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loadingStep ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-9 h-9 text-red-600 animate-spin" />
              <div className="text-sm font-bold text-slate-800">{loadingStep}</div>
              <p className="text-xs text-slate-500">
                Processing client-side in your browser for 100% data privacy.
              </p>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-600 bg-red-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-red-500 hover:bg-slate-50/70'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>

                <div className="text-sm font-semibold text-slate-900 mb-1">
                  Click to browse or drag & drop Excel file
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV files
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-xs pointer-events-none"
                >
                  Choose Excel File
                </button>
              </div>

              {/* Current Active File info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Active Workbook
                  </div>
                  {currentDataset ? (
                    <>
                      <div className="font-semibold text-slate-800 truncate" title={currentDataset.fileName}>
                        {currentDataset.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {currentDataset.totalRows.toLocaleString()} rows · {currentDataset.totalColumns} columns
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 italic">No workbook loaded yet</div>
                  )}
                </div>

                <button
                  onClick={handleDownloadSampleExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium text-xs shrink-0 shadow-2xs"
                  title="Download sample Excel template to test"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sample Template</span>
                </button>
              </div>

              {/* Privacy badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-side Processing — Your private Excel data never leaves your browser.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
