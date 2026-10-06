import React from 'react';
import { X, Building2, Copy, Check } from 'lucide-react';
import { ColumnMeta, DataRow } from '../types/dashboard';
import { formatSmartNumber, parseNumericValue } from '../utils/numberFormat';

interface RecordDetailModalProps {
  row: DataRow | null;
  columns: ColumnMeta[];
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  row,
  columns,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!row) return null;

  const entityCol = columns.find((c) => c.role === 'entity_name');
  const title = entityCol ? String(row[entityCol.key] || 'Record Details') : 'Record Details';

  const handleCopy = (key: string, val: any) => {
    navigator.clipboard.writeText(String(val ?? ''));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate" title={title}>
                {title}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {row.__id} · Detailed Attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {columns.map((col) => {
              const val = row[col.key];
              const isNum = col.type === 'numeric';
              const isRevenue = col.role === 'revenue';

              let display = '—';
              if (val !== null && val !== undefined && val !== '') {
                if (isNum) {
                  const n = parseNumericValue(val);
                  display = n !== null ? formatSmartNumber(n, isRevenue) : String(val);
                } else {
                  display = String(val);
                }
              }

              return (
                <div
                  key={col.key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 relative group"
                >
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="truncate">{col.name}</span>
                    <button
                      onClick={() => handleCopy(col.key, val)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                      title="Copy value"
                    >
                      {copiedKey === col.key ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div
                    className={`text-xs font-semibold text-slate-800 break-words ${
                      isNum ? 'font-mono' : ''
                    }`}
                  >
                    {display}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
