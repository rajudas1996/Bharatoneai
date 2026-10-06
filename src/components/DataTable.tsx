import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Columns3, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Maximize2
} from 'lucide-react';
import { ColumnMeta, DataRow } from '../types/dashboard';
import { formatSmartNumber, parseNumericValue, formatDisplayDate } from '../utils/numberFormat';

interface DataTableProps {
  columns: ColumnMeta[];
  rows: DataRow[];
  onSelectRow: (row: DataRow) => void;
  onExport: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  onSelectRow,
  onExport,
}) => {
  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Local search inside table
  const [tableSearch, setTableSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility state: colKey -> boolean
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((c) => {
      initial[c.key] = true;
    });
    return initial;
  });

  const [showColMenu, setShowColMenu] = useState(false);

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  // Filtered & Sorted rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // Local table search filter
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      result = result.filter((row) => {
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortKey) {
      const colMeta = columns.find((c) => c.key === sortKey);
      const isNum = colMeta?.type === 'numeric';

      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (isNum) {
          const numA = parseNumericValue(valA) ?? -Infinity;
          const numB = parseNumericValue(valB) ?? -Infinity;
          return sortDir === 'asc' ? numA - numB : numB - numA;
        } else {
          const strA = String(valA ?? '').toLowerCase();
          const strB = String(valB ?? '').toLowerCase();
          return sortDir === 'asc'
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA);
        }
      });
    }

    return result;
  }, [rows, tableSearch, sortKey, sortDir, columns]);

  // Paginated rows
  const totalRows = processedRows.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const safePage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, safePage, pageSize]);

  // Visible columns list
  const activeColumns = columns.filter((c) => visibleCols[c.key] !== false);

  const toggleColumn = (key: string) => {
    setVisibleCols((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAllColumns = () => {
    const next: Record<string, boolean> = {};
    columns.forEach((c) => (next[c.key] = true));
    setVisibleCols(next);
  };

  // Status pill badge helper
  const renderStatusBadge = (val: any) => {
    const str = String(val || '').trim();
    const lower = str.toLowerCase();

    if (lower.includes('active')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          {str}
        </span>
      );
    }
    if (lower.includes('converted') || lower.includes('won')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          {str}
        </span>
      );
    }
    if (lower.includes('hold') || lower.includes('pending')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
          {str}
        </span>
      );
    }
    if (lower.includes('lost')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
          {str}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
        {str}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col mb-8 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-900">
            Lead Preview Table
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            (Showing first {Math.min(paginatedRows.length, pageSize)} of {totalRows.toLocaleString()} rows)
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Quick Search inside Table */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search in table..."
              className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:bg-white w-44 sm:w-56 text-slate-800"
            />
          </div>

          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
            >
              <Columns3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {showColMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800">Display Columns</span>
                  <button
                    onClick={showAllColumns}
                    className="text-[10px] text-red-600 font-semibold hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {columns.map((c) => (
                    <label
                      key={c.key}
                      className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols[c.key] !== false}
                        onChange={() => toggleColumn(c.key)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span className="truncate text-slate-700">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export to Excel */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 shadow-2xs transition-colors"
            title="Download filtered table as Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Container with Sticky Header & Horizontal Scroll */}
      <div className="overflow-x-auto min-h-[300px] max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <tr className="text-slate-700 select-none">
              <th className="py-2.5 px-3 w-12 text-center text-slate-400 font-mono text-[10px] bg-slate-50">
                #
              </th>
              {activeColumns.map((col) => {
                const isSorted = sortKey === col.key;
                const isNum = col.type === 'numeric';
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`py-2.5 px-3 font-semibold text-slate-700 hover:bg-slate-100/70 cursor-pointer transition-colors whitespace-nowrap bg-slate-50 ${
                      isNum ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${isNum ? 'flex-row-reverse' : ''}`}>
                      <span>{col.name}</span>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-red-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-red-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="py-2.5 px-3 text-center w-14 bg-slate-50">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 2} className="py-12 text-center text-slate-400">
                  No records match the currently applied filters or search query.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const globalIndex = (safePage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row.__id || idx}
                    className="hover:bg-red-50/20 transition-colors group"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums">
                      {globalIndex}
                    </td>

                    {activeColumns.map((col) => {
                      const val = row[col.key];
                      const lowerName = col.name.toLowerCase();
                      const isDate = col.type === 'date' || col.role === 'date' || lowerName.includes('date') || lowerName.includes('dob') || lowerName.includes('valid');
                      const isNum = !isDate && col.type === 'numeric';
                      const isPremium = col.role === 'premium' || lowerName.includes('premium');
                      const isRevenue = col.role === 'revenue' || lowerName.includes('turnover');
                      const isStatus = col.role === 'status' || lowerName.includes('status');
                      const isWebsite = lowerName.includes('website');

                      let displayContent: React.ReactNode = '—';
                      if (val !== null && val !== undefined && val !== '') {
                        if (isStatus) {
                          displayContent = renderStatusBadge(val);
                        } else if (isWebsite) {
                          const url = String(val).startsWith('http') ? String(val) : `https://${val}`;
                          displayContent = (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 hover:underline truncate"
                            >
                              {String(val)}
                            </a>
                          );
                        } else if (isDate) {
                          // Format Excel date serials or timestamps as proper formatted date
                          const dateFormatted = formatDisplayDate(val);
                          displayContent = dateFormatted ? (
                            <span className="font-mono text-slate-700 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200/60 inline-flex items-center gap-1 font-semibold text-[11px]">
                              {dateFormatted}
                            </span>
                          ) : (
                            String(val)
                          );
                        } else if (isNum) {
                          const n = parseNumericValue(val);
                          displayContent = n !== null ? formatSmartNumber(n, isPremium || isRevenue) : String(val);
                        } else {
                          // Check if value is a date serial or date string even if not marked as date
                          const maybeDate = lowerName.includes('date') ? formatDisplayDate(val) : null;
                          displayContent = maybeDate ? (
                            <span className="font-mono text-slate-700 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200/60 inline-flex items-center gap-1 font-semibold text-[11px]">
                              {maybeDate}
                            </span>
                          ) : String(val);
                        }
                      }

                      return (
                        <td
                          key={col.key}
                          className={`py-2.5 px-3 text-slate-800 whitespace-nowrap ${
                            isNum ? 'text-right font-mono tabular-nums' : 'text-left'
                          }`}
                        >
                          <span className="truncate max-w-[220px] inline-block" title={String(val)}>
                            {displayContent}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectRow(row)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="View Full Record Details"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-300">|</span>
          <span className="tabular-nums font-mono text-[11px]">
            Showing {(safePage - 1) * pageSize + 1} -{' '}
            {Math.min(safePage * pageSize, totalRows)} of {totalRows.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={safePage <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            title="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            title="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
