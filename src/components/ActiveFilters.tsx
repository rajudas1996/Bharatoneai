import React from 'react';
import { X, Filter, RotateCcw, MousePointerClick } from 'lucide-react';
import { FilterState, ColumnMeta } from '../types/dashboard';
import { formatSmartNumber } from '../utils/numberFormat';

interface ActiveFiltersProps {
  filterState: FilterState;
  columns: ColumnMeta[];
  onRemoveCategorical: (colKey: string, val: string) => void;
  onRemoveRange: (colKey: string) => void;
  onClearCrossFilter: () => void;
  onClearGlobalSearch: () => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filterState,
  columns,
  onRemoveCategorical,
  onRemoveRange,
  onClearCrossFilter,
  onClearGlobalSearch,
  onClearAll,
  filteredCount,
  totalCount,
}) => {
  const getColName = (key: string) => {
    return columns.find((c) => c.key === key)?.name || key;
  };

  const hasCategorical = Object.values(filterState.categorical).some((vals) => vals.length > 0);
  const hasRange = Object.keys(filterState.ranges).length > 0;
  const hasCross = !!filterState.crossFilter;
  const hasSearch = !!filterState.globalSearch;

  const hasAnyFilter = hasCategorical || hasRange || hasCross || hasSearch;

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs mb-5 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-2">
        <Filter className="w-3.5 h-3.5 text-indigo-600" />
        <span>Active Filters:</span>
      </div>

      {/* Cross Filter from Chart Click */}
      {filterState.crossFilter && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500 text-slate-950 font-semibold shadow-xs animate-pulse">
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>
            {getColName(filterState.crossFilter.columnKey)}: {filterState.crossFilter.value}
          </span>
          <button
            onClick={onClearCrossFilter}
            className="hover:opacity-75 focus:outline-none ml-0.5"
            title="Remove cross-filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Global Search Term */}
      {filterState.globalSearch && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
          <span className="text-slate-500">Search:</span> "{filterState.globalSearch}"
          <button
            onClick={onClearGlobalSearch}
            className="text-slate-400 hover:text-slate-700 focus:outline-none"
            title="Clear search term"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Categorical Filters */}
      {Object.entries(filterState.categorical).flatMap(([colKey, values]) =>
        values.map((val) => (
          <span
            key={`${colKey}-${val}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200"
          >
            <span className="text-indigo-600 font-semibold">{getColName(colKey)}:</span>
            <span>{val}</span>
            <button
              onClick={() => onRemoveCategorical(colKey, val)}
              className="text-indigo-400 hover:text-indigo-700 focus:outline-none"
              title={`Remove ${val}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))
      )}

      {/* Range Filters */}
      {Object.entries(filterState.ranges).map(([colKey, range]) => {
        const col = columns.find((c) => c.key === colKey);
        const isRevenue = col?.role === 'revenue';
        return (
          <span
            key={`range-${colKey}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200"
          >
            <span className="text-sky-600 font-semibold">{getColName(colKey)}:</span>
            <span className="font-mono tabular-nums">
              {formatSmartNumber(range.min, isRevenue)} - {formatSmartNumber(range.max, isRevenue)}
            </span>
            <button
              onClick={() => onRemoveRange(colKey)}
              className="text-sky-400 hover:text-sky-700 focus:outline-none"
              title="Remove range filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        );
      })}

      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All Filters</span>
      </button>

      <span className="text-[11px] text-slate-500 font-mono tabular-nums pl-2 border-l border-slate-200">
        Showing {filteredCount} of {totalCount} records
      </span>
    </div>
  );
};
