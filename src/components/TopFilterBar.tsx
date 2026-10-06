import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { ColumnMeta, FilterState, DataRow } from '../types/dashboard';

interface TopFilterBarProps {
  columns: ColumnMeta[];
  allRows: DataRow[];
  filterState: FilterState;
  onUpdateCategorical: (colKey: string, selectedValues: string[]) => void;
  onClearCrossFilter: () => void;
  onClearGlobalSearch: () => void;
  onClearAll: () => void;
  onRemoveCategorical: (colKey: string, val: string) => void;
}

export const TopFilterBar: React.FC<TopFilterBarProps> = ({
  columns,
  allRows,
  filterState,
  onUpdateCategorical,
  onClearCrossFilter,
  onClearGlobalSearch,
  onClearAll,
  onRemoveCategorical,
}) => {
  // Predefined order of top insurance filters
  const preferredFilterKeys = [
    { label: 'Import Date', roles: ['date'], matchKey: 'import date' },
    { label: 'Lead Source', roles: ['lead_source'], matchKey: 'source' },
    { label: 'RM', roles: ['agent'], matchKey: 'rm' },
    { label: 'Lead Current Status', roles: ['status'], matchKey: 'status' },
    { label: 'LOB', roles: ['lob'], matchKey: 'lob' },
    { label: 'Policy Type', roles: ['policy_type'], matchKey: 'policy' },
    { label: 'Renewal Month', roles: ['renewal_month'], matchKey: 'renewal' },
    { label: 'State', roles: ['location_state'], matchKey: 'state' },
    { label: 'City', roles: ['location_city'], matchKey: 'city' },
  ];

  // Resolve matching column for each filter slot
  const resolvedFilters = preferredFilterKeys.map((item) => {
    let col = columns.find(
      (c) =>
        c.role &&
        item.roles.includes(c.role as any) &&
        (c.name.toLowerCase().includes(item.matchKey) || item.roles.includes(c.role as any))
    );
    if (!col) {
      col = columns.find((c) => c.name.toLowerCase().includes(item.matchKey));
    }
    return {
      label: item.label,
      colKey: col?.key,
      col,
    };
  });

  // Calculate unique sorted values for each column
  const getOptions = (colKey?: string) => {
    if (!colKey) return [];
    const set = new Set<string>();
    allRows.forEach((r) => {
      const v = String(r[colKey] ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  };

  const hasAnyFilter =
    Object.values(filterState.categorical).some((v) => v.length > 0) ||
    !!filterState.crossFilter ||
    !!filterState.globalSearch;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 mb-4">
      {/* 9-Column Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
        {resolvedFilters.map((slot) => {
          if (!slot.colKey) return null;
          const options = getOptions(slot.colKey);
          const currentSelected = filterState.categorical[slot.colKey] || [];
          const activeValue = currentSelected[0] || '';

          return (
            <div key={slot.label} className="flex flex-col min-w-0">
              <label className="text-[11px] font-semibold text-slate-700 truncate mb-1" title={slot.label}>
                {slot.label}
              </label>
              <select
                value={activeValue}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateCategorical(slot.colKey!, val ? [val] : []);
                }}
                className={`w-full text-xs rounded-lg px-2 py-1.5 border outline-none font-medium truncate transition-colors ${
                  activeValue
                    ? 'border-red-500 bg-red-50/50 text-red-900 font-semibold'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700'
                }`}
              >
                <option value="">All</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Active Filter Chips Bar */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {/* Cross Filter chip */}
          {filterState.crossFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 text-white shadow-xs">
              <span>
                {filterState.crossFilter.columnKey}: {filterState.crossFilter.value}
              </span>
              <button
                onClick={onClearCrossFilter}
                className="hover:opacity-80 focus:outline-none ml-1"
                title="Remove cross-filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Global search chip */}
          {filterState.globalSearch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              <span>Search: "{filterState.globalSearch}"</span>
              <button
                onClick={onClearGlobalSearch}
                className="hover:text-red-900 focus:outline-none"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Categorical filter chips */}
          {Object.entries(filterState.categorical).flatMap(([colKey, values]) => {
            const colName = columns.find((c) => c.key === colKey)?.name || colKey;
            return values.map((val) => (
              <span
                key={`${colKey}-${val}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
              >
                <span>
                  {colName}: {val}
                </span>
                <button
                  onClick={() => onRemoveCategorical(colKey, val)}
                  className="hover:text-red-900 focus:outline-none ml-1"
                  title={`Remove ${val}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ));
          })}

          {/* Clear All button */}
          <button
            onClick={onClearAll}
            className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      )}
    </div>
  );
};
