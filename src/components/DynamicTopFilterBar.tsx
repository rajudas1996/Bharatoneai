import React, { useState } from 'react';
import { X, Trash2, Filter, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { ColumnMeta, FilterState, DataRow } from '../types/dashboard';
import { formatDisplayDate } from '../utils/numberFormat';

interface DynamicTopFilterBarProps {
  columns: ColumnMeta[];
  filterColumns: string[];
  allRows: DataRow[];
  filterState: FilterState;
  onUpdateCategorical: (colKey: string, selectedValues: string[]) => void;
  onClearCrossFilter: () => void;
  onClearGlobalSearch: () => void;
  onClearAll: () => void;
  onRemoveCategorical: (colKey: string, val: string) => void;
  onOpenFilterConfig: () => void;
}

export const DynamicTopFilterBar: React.FC<DynamicTopFilterBarProps> = ({
  columns,
  filterColumns,
  allRows,
  filterState,
  onUpdateCategorical,
  onClearCrossFilter,
  onClearGlobalSearch,
  onClearAll,
  onRemoveCategorical,
  onOpenFilterConfig,
}) => {
  // Open dropdown state for individual filter column
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Resolve ColumnMeta for each active filter column key
  const activeColumns = filterColumns
    .map((key) => columns.find((c) => c.key === key))
    .filter((c): c is ColumnMeta => !!c);

  // Get unique sorted values for column
  const getOptions = (colKey: string) => {
    const colMeta = columns.find((c) => c.key === colKey);
    const isDate = colMeta?.type === 'date' || colMeta?.role === 'date' || colKey.toLowerCase().includes('date');
    const set = new Set<string>();
    allRows.forEach((r) => {
      let v = String(r[colKey] ?? '').trim();
      if (v) {
        if (isDate) {
          const formatted = formatDisplayDate(v);
          if (formatted) v = formatted;
        }
        set.add(v);
      }
    });
    return Array.from(set).sort();
  };

  const hasAnyFilter =
    Object.values(filterState.categorical).some((v) => v.length > 0) ||
    !!filterState.crossFilter ||
    !!filterState.globalSearch;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 mb-4 select-none">
      {/* Dynamic Dropdowns Grid */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-600" />
            Interactive Filters ({activeColumns.length})
          </span>
          {hasAnyFilter && (
            <span className="w-2 h-2 rounded-full bg-red-600 ring-2 ring-red-100 animate-pulse" />
          )}
        </div>

        <button
          onClick={onOpenFilterConfig}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-50 transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Configure Filter Columns</span>
        </button>
      </div>

      {activeColumns.length === 0 ? (
        <div className="py-2 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 flex items-center justify-between">
          <span>No filter columns selected. Click to choose headers for the filter bar.</span>
          <button
            onClick={onOpenFilterConfig}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Select Headers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {activeColumns.map((col) => {
            const options = getOptions(col.key);
            const currentSelected = filterState.categorical[col.key] || [];
            const isOpen = openDropdownKey === col.key;
            const filterSearch = searchTerms[col.key] || '';

            const filteredOptions = filterSearch
              ? options.filter((opt) => opt.toLowerCase().includes(filterSearch.toLowerCase()))
              : options;

            return (
              <div key={col.key} className="relative">
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setOpenDropdownKey(isOpen ? null : col.key)}
                  className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                    currentSelected.length > 0
                      ? 'border-red-500 bg-red-50/50 text-red-950 font-bold ring-1 ring-red-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700 hover:border-slate-300 font-medium'
                  }`}
                >
                  <div className="truncate flex-1">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-0.5 truncate">
                      {col.name}
                    </span>
                    <span className="truncate block font-semibold text-slate-800 text-[11px]">
                      {currentSelected.length === 0
                        ? 'All'
                        : currentSelected.length === 1
                        ? currentSelected[0]
                        : `${currentSelected.length} selected`}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-red-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOpenDropdownKey(null)}
                    />
                    <div className="absolute left-0 mt-1 w-64 max-h-72 bg-white rounded-xl shadow-xl border border-slate-200 z-40 p-2 text-xs flex flex-col">
                      <div className="p-1 mb-1 border-b border-slate-100">
                        <input
                          type="text"
                          value={filterSearch}
                          onChange={(e) =>
                            setSearchTerms((prev) => ({ ...prev, [col.key]: e.target.value }))
                          }
                          placeholder={`Search ${col.name}...`}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:border-red-500 placeholder:text-slate-400"
                          autoFocus
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-0.5 py-1 max-h-48">
                        {filteredOptions.length === 0 ? (
                          <div className="p-2 text-slate-400 text-center italic text-[11px]">
                            No matches found
                          </div>
                        ) : (
                          filteredOptions.map((opt) => {
                            const isChecked = currentSelected.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const next = isChecked
                                    ? currentSelected.filter((v) => v !== opt)
                                    : [...currentSelected, opt];
                                  onUpdateCategorical(col.key, next);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                                  isChecked
                                    ? 'bg-red-50 text-red-900 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50 font-normal'
                                }`}
                              >
                                <span className="truncate text-xs">{opt}</span>
                                {isChecked && (
                                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {currentSelected.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center px-1">
                          <span className="text-[10px] text-slate-400">
                            {currentSelected.length} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCategorical(col.key, [])}
                            className="text-[10px] font-bold text-red-600 hover:text-red-700"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Filter Chips Row with Red Accents & Clear All */}
      {hasAnyFilter && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            Active:
          </span>

          {/* Global search chip */}
          {filterState.globalSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100/70 text-red-800 border border-red-200">
              <span className="text-red-500 font-normal">Search:</span> &ldquo;{filterState.globalSearch}&rdquo;
              <button
                onClick={onClearGlobalSearch}
                className="hover:bg-red-200/80 rounded-full p-0.5 ml-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-red-700" />
              </button>
            </span>
          )}

          {/* Cross-filter chip */}
          {filterState.crossFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-2xs">
              <span className="opacity-80 font-normal">{filterState.crossFilter.columnKey}:</span> {filterState.crossFilter.value}
              <button
                onClick={onClearCrossFilter}
                className="hover:bg-red-700 rounded-full p-0.5 ml-0.5 transition-colors"
                title="Remove cross filter"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </span>
          )}

          {/* Categorical filter chips */}
          {Object.entries(filterState.categorical).map(([colKey, vals]) => {
            const col = columns.find((c) => c.key === colKey);
            const colLabel = col?.name || colKey;
            return vals.map((v) => (
              <span
                key={`${colKey}-${v}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
              >
                <span className="text-red-500 font-normal">{colLabel}:</span> {v}
                <button
                  onClick={() => onRemoveCategorical(colKey, v)}
                  className="hover:bg-red-100 rounded-full p-0.5 ml-0.5 transition-colors"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </span>
            ));
          })}

          {/* Clear All button */}
          <button
            onClick={onClearAll}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
