import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Hash, Coins, Layers, Plus } from 'lucide-react';
import { ColumnMeta, DataRow, DynamicKPIWidget, AggregationType } from '../types/dashboard';
import { calculateKPIValue } from '../utils/dashboardBuilder';

interface KPIBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMeta[];
  rows: DataRow[];
  totalRowCount: number;
  onSaveKPI: (kpi: DynamicKPIWidget) => void;
  initialKPI?: DynamicKPIWidget | null;
  defaultColumnKey?: string;
}

export const KPIBuilderModal: React.FC<KPIBuilderModalProps> = ({
  isOpen,
  onClose,
  columns,
  rows,
  totalRowCount,
  onSaveKPI,
  initialKPI,
  defaultColumnKey,
}) => {
  const [title, setTitle] = useState('');
  const [columnKey, setColumnKey] = useState<string>(''); // empty string = total records
  const [aggregation, setAggregation] = useState<AggregationType>('count');
  const [format, setFormat] = useState<'currency' | 'number' | 'count'>('count');

  useEffect(() => {
    if (!isOpen) return;

    if (initialKPI) {
      setTitle(initialKPI.title);
      setColumnKey(initialKPI.columnKey || '');
      setAggregation(initialKPI.aggregation);
      setFormat(initialKPI.format || 'count');
    } else {
      const col = defaultColumnKey ? columns.find((c) => c.key === defaultColumnKey) : null;
      if (col) {
        setColumnKey(col.key);
        if (col.type === 'numeric') {
          setAggregation('sum');
          const isCurr = 
            col.name.toLowerCase().includes('premium') || 
            col.name.toLowerCase().includes('revenue') || 
            col.name.toLowerCase().includes('amount') ||
            col.name.toLowerCase().includes('sales');
          setFormat(isCurr ? 'currency' : 'number');
          setTitle(`Total ${col.name}`);
        } else {
          setAggregation('unique_count');
          setFormat('count');
          setTitle(`Unique ${col.name}`);
        }
      } else {
        setColumnKey('');
        setAggregation('count');
        setFormat('count');
        setTitle('Total Records');
      }
    }
  }, [isOpen, initialKPI, defaultColumnKey, columns]);

  const handleColumnChange = (key: string) => {
    setColumnKey(key);
    if (!key) {
      setAggregation('count');
      setFormat('count');
      setTitle('Total Records');
    } else {
      const col = columns.find((c) => c.key === key);
      if (col?.type === 'numeric') {
        setAggregation('sum');
        const isCurr = 
          col.name.toLowerCase().includes('premium') || 
          col.name.toLowerCase().includes('revenue') || 
          col.name.toLowerCase().includes('amount');
        setFormat(isCurr ? 'currency' : 'number');
        setTitle(`Total ${col.name}`);
      } else {
        setAggregation('unique_count');
        setFormat('count');
        setTitle(`Unique ${col?.name || key}`);
      }
    }
  };

  // Preview KPI value
  const previewKPI: DynamicKPIWidget = useMemo(
    () => ({
      id: initialKPI?.id || 'preview-kpi',
      title: title || 'KPI Metric',
      columnKey: columnKey || undefined,
      aggregation,
      format,
    }),
    [initialKPI, title, columnKey, aggregation, format]
  );

  const previewVal = useMemo(() => {
    return calculateKPIValue(previewKPI, rows, totalRowCount);
  }, [previewKPI, rows, totalRowCount]);

  const handleSave = () => {
    const finalKPI: DynamicKPIWidget = {
      id: initialKPI?.id || `kpi-${Date.now()}`,
      title: title.trim() || 'Custom KPI',
      columnKey: columnKey || undefined,
      aggregation,
      format,
    };
    onSaveKPI(finalKPI);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {initialKPI ? 'Edit KPI Metric' : 'Add Dynamic KPI Metric'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Configure metric aggregation and formatting
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              KPI Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Total Revenue, Active RMs"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-red-500 outline-none"
            />
          </div>

          {/* Column Target */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Header / Field
            </label>
            <select
              value={columnKey}
              onChange={(e) => handleColumnChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="">(All Records / Row Count)</option>
              {columns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} ({c.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aggregation
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as AggregationType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer"
              >
                <option value="count">Count (Rows)</option>
                <option value="unique_count">Unique (Distinct Count)</option>
                <option value="sum">Sum (Total)</option>
                <option value="avg">Average</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer"
              >
                <option value="count">Standard Count</option>
                <option value="currency">Currency (₹ / Lakhs / Cr)</option>
                <option value="number">Numeric (K / M / B)</option>
              </select>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Preview Card
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold truncate">{title || 'KPI Title'}</span>
                <span className="text-[9px] font-mono bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-bold uppercase">
                  {aggregation}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                {previewVal.formatted}
              </div>
              {previewVal.subLabel && (
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {previewVal.subLabel}
                </div>
              )}
            </div>
          </div>
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
            {initialKPI ? 'Update KPI' : 'Add KPI Card'}
          </button>
        </div>
      </div>
    </div>
  );
};
