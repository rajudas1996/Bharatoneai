import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { ColumnMeta, FilterState, DataRow } from '../types/dashboard';
import { formatSmartNumber } from '../utils/numberFormat';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMeta[];
  allRows: DataRow[];
  filterState: FilterState;
  onUpdateCategorical: (colKey: string, selectedValues: string[]) => void;
  onUpdateRange: (colKey: string, range: { min: number; max: number } | null) => void;
  onClearAll: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  columns,
  allRows,
  filterState,
  onUpdateCategorical,
  onUpdateRange,
  onClearAll,
}) => {
  // Local search query per categorical filter
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  // Collapsed sections state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Categorical columns eligible for multi-select
  const categoricalCols = useMemo(() => {
    return columns.filter(
      (c) => c.type === 'categorical' || (c.type === 'text' && c.uniqueValues.length <= 80 && c.uniqueValues.length > 1)
    );
  }, [columns]);

  // Numeric columns eligible for range slider
  const numericCols = useMemo(() => {
    return columns.filter(
      (c) => c.type === 'numeric' && c.min !== undefined && c.max !== undefined && c.min < c.max
    );
  }, [columns]);

  // Compute distribution / count of each value in current dataset
  const valueCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    categoricalCols.forEach((col) => {
      counts[col.key] = {};
      allRows.forEach((row) => {
        const val = String(row[col.key] ?? '').trim();
        if (val) {
          counts[col.key][val] = (counts[col.key][val] || 0) + 1;
        }
      });
    });
    return counts;
  }, [categoricalCols, allRows]);

  if (!isOpen) return null;

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxToggle = (colKey: string, value: string) => {
    const current = filterState.categorical[colKey] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onUpdateCategorical(colKey, updated);
  };

  const handleSelectAll = (colKey: string, values: string[]) => {
    onUpdateCategorical(colKey, values);
  };

  const handleClearColumn = (colKey: string) => {
    onUpdateCategorical(colKey, []);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-84 sm:w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Interactive Filters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Numeric Range Sliders */}
        {numericCols.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Numeric Ranges
            </h3>
            {numericCols.map((col) => {
              const min = col.min ?? 0;
              const max = col.max ?? 100;
              const currentRange = filterState.ranges[col.key] || { min, max };
              const isRevenue = col.role === 'revenue';

              return (
                <div key={col.key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
                    <span className="truncate">{col.name}</span>
                    {filterState.ranges[col.key] && (
                      <button
                        onClick={() => onUpdateRange(col.key, null)}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono tabular-nums mb-2">
                    <span>{formatSmartNumber(currentRange.min, isRevenue)}</span>
                    <span className="text-slate-400">to</span>
                    <span>{formatSmartNumber(currentRange.max, isRevenue)}</span>
                  </div>

                  {/* Dual Range input emulation */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Min Threshold</span>
                        <span className="font-mono">{formatSmartNumber(currentRange.min, isRevenue)}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={(max - min) / 100 || 1}
                        value={currentRange.min}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= currentRange.max) {
                            onUpdateRange(col.key, { min: val, max: currentRange.max });
                          }
                        }}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Max Threshold</span>
                        <span className="font-mono">{formatSmartNumber(currentRange.max, isRevenue)}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={(max - min) / 100 || 1}
                        value={currentRange.max}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= currentRange.min) {
                            onUpdateRange(col.key, { min: currentRange.min, max: val });
                          }
                        }}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Categorical Multi-Select Columns */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Categorical Attributes
          </h3>
          {categoricalCols.map((col) => {
            const isColCollapsed = !!collapsed[col.key];
            const search = filterSearch[col.key] || '';
            const selected = filterState.categorical[col.key] || [];

            const colCounts = valueCounts[col.key] || {};
            const allVals = Object.keys(colCounts).sort((a, b) => (colCounts[b] || 0) - (colCounts[a] || 0));

            const visibleVals = search
              ? allVals.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
              : allVals;

            return (
              <div key={col.key} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Accordion Header */}
                <div
                  onClick={() => toggleCollapse(col.key)}
                  className="p-3 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{col.name}</span>
                    {selected.length > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full tabular-nums">
                        {selected.length}
                      </span>
                    )}
                  </div>
                  {isColCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {!isColCollapsed && (
                  <div className="p-3 border-t border-slate-100 space-y-2">
                    {/* Quick Search inside column options */}
                    {allVals.length > 5 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setFilterSearch((prev) => ({ ...prev, [col.key]: e.target.value }))
                          }
                          placeholder={`Search ${col.name}...`}
                          className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Quick Actions (Select All / Clear) */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-b border-slate-100 pb-1">
                      <button
                        onClick={() => handleSelectAll(col.key, visibleVals)}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Select all ({visibleVals.length})
                      </button>
                      {selected.length > 0 && (
                        <button
                          onClick={() => handleClearColumn(col.key)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Checkbox Options List */}
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {visibleVals.length === 0 ? (
                        <div className="text-[11px] text-slate-400 py-2 text-center">
                          No matching values
                        </div>
                      ) : (
                        visibleVals.map((val) => {
                          const isChecked = selected.includes(val);
                          const count = colCounts[val] || 0;
                          return (
                            <label
                              key={val}
                              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                isChecked
                                  ? 'bg-indigo-50/70 text-indigo-900 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(col.key, val)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                />
                                <span className="truncate" title={val}>
                                  {val}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                                {count}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <button
          onClick={onClearAll}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          Reset All Filters
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
        >
          Apply & Close
        </button>
      </div>
    </div>
  );
};
