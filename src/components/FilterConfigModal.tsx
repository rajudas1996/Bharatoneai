import React, { useState, useEffect } from 'react';
import { X, Filter, Check, Layers, Hash, Calendar } from 'lucide-react';
import { ColumnMeta } from '../types/dashboard';

interface FilterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMeta[];
  activeFilterColumns: string[];
  onSaveFilterColumns: (selectedKeys: string[]) => void;
}

export const FilterConfigModal: React.FC<FilterConfigModalProps> = ({
  isOpen,
  onClose,
  columns,
  activeFilterColumns,
  onSaveFilterColumns,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedKeys([...activeFilterColumns]);
    }
  }, [isOpen, activeFilterColumns]);

  const toggleColumn = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectBest = () => {
    // Select categorical and date columns with reasonable cardinality
    const best = columns
      .filter((c) => c.uniqueValues.length >= 2 && c.uniqueValues.length <= 100)
      .slice(0, 8)
      .map((c) => c.key);
    setSelectedKeys(best);
  };

  const handleSelectAll = () => {
    setSelectedKeys(columns.map((c) => c.key));
  };

  const handleClear = () => {
    setSelectedKeys([]);
  };

  const handleSave = () => {
    onSaveFilterColumns(selectedKeys);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Top Filter Bar Configuration
              </h2>
              <p className="text-[11px] text-slate-500">
                Choose which detected headers appear as dropdown filters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Active Filters: <span className="text-red-600 font-mono">{selectedKeys.length}</span> / {columns.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectBest}
              className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[11px] font-semibold hover:border-red-400 transition-colors"
            >
              Recommended
            </button>
            <button
              onClick={handleSelectAll}
              className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[11px] font-semibold hover:border-red-400 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClear}
              className="px-2 py-0.5 bg-white text-slate-500 border border-slate-200 rounded text-[11px] font-semibold hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Column List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          {columns.map((col) => {
            const isChecked = selectedKeys.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => toggleColumn(col.key)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'bg-red-50/70 border-red-400 text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-red-600 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{col.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {col.type.toUpperCase()} • {col.uniqueValues.length} unique values
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {col.type === 'categorical' && <Layers className="w-3.5 h-3.5 text-purple-500" />}
                  {col.type === 'date' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                  {col.type === 'numeric' && <Hash className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all"
          >
            Apply Filters ({selectedKeys.length})
          </button>
        </div>
      </div>
    </div>
  );
};
