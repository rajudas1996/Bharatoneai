import React, { useMemo, useState, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  AreaChart as AreaIcon, 
  Award, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Plus, 
  X,
  Filter,
  MapPin,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Move,
  RotateCcw
} from 'lucide-react';
import { 
  ColumnMeta, 
  DataRow, 
  FilterState, 
  DynamicChartWidget, 
  ChartType 
} from '../types/dashboard';
import { aggregateChartData } from '../utils/dashboardBuilder';
import { DynamicGeoMap } from './DynamicGeoMap';

interface DynamicDashboardChartsProps {
  charts: DynamicChartWidget[];
  columns: ColumnMeta[];
  filteredRows: DataRow[];
  filterState: FilterState;
  onSetCrossFilter: (columnKey: string, value: string, sourceChartId: string) => void;
  onClearCrossFilter: () => void;
  onUpdateChart: (widget: DynamicChartWidget) => void;
  onRemoveChart: (id: string) => void;
  onOpenEditChart: (widget: DynamicChartWidget) => void;
  onOpenAddChart: () => void;
  onReorderCharts?: (newCharts: DynamicChartWidget[]) => void;
}

const PALETTE_MAP: Record<string, string[]> = {
  red: ['#dc2626', '#ef4444', '#f87171', '#b91c1c', '#991b1b', '#fca5a5', '#fee2e2'],
  corporate: ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#64748b', '#0891b2'],
  emerald: ['#059669', '#10b981', '#34d399', '#047857', '#065f46', '#6ee7b7', '#a7f3d0'],
  amber: ['#d97706', '#f59e0b', '#fbbf24', '#b45309', '#92400e', '#fde68a', '#fef3c7'],
  blue: ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#1e40af', '#93c5fd', '#dbeafe'],
};

export const DynamicDashboardCharts: React.FC<DynamicDashboardChartsProps> = ({
  charts,
  columns,
  filteredRows,
  filterState,
  onSetCrossFilter,
  onClearCrossFilter,
  onUpdateChart,
  onRemoveChart,
  onOpenEditChart,
  onOpenAddChart,
  onReorderCharts,
}) => {
  // Drag-and-drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [insertionTarget, setInsertionTarget] = useState<number | null>(null); // Index where dragged item will be inserted
  const [fullWidthCharts, setFullWidthCharts] = useState<Set<string>>(new Set());
  const initialChartsRef = useRef<DynamicChartWidget[]>(charts);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragOverInsertionZone = (e: React.DragEvent, insertAtPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (insertionTarget !== insertAtPos) {
      setInsertionTarget(insertAtPos);
    }
  };

  const handleDropOnInsertionZone = (e: React.DragEvent, insertAtPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null) return;

    const fromIndex = draggedIndex;
    if (fromIndex === insertAtPos || fromIndex === insertAtPos - 1) {
      // No movement
      setDraggedIndex(null);
      setDragOverIndex(null);
      setInsertionTarget(null);
      return;
    }

    const updated = [...charts];
    const [movedItem] = updated.splice(fromIndex, 1);
    // If we dragged an item from before insertAtPos, removing it shifted remaining indices left by 1
    const targetIdx = fromIndex < insertAtPos ? insertAtPos - 1 : insertAtPos;
    updated.splice(targetIdx, 0, movedItem);

    if (onReorderCharts) {
      onReorderCharts(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setInsertionTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setInsertionTarget(null);
      return;
    }

    const updated = [...charts];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    if (onReorderCharts) {
      onReorderCharts(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setInsertionTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setInsertionTarget(null);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= charts.length || fromIndex === toIndex) return;
    const updated = [...charts];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    if (onReorderCharts) {
      onReorderCharts(updated);
    }
  };

  // Move directly to a specific 0-based sequence position
  const handleMoveToPosition = (fromIndex: number, toPosition: number) => {
    if (toPosition < 0 || toPosition >= charts.length || fromIndex === toPosition) return;
    const updated = [...charts];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toPosition, 0, movedItem);
    if (onReorderCharts) {
      onReorderCharts(updated);
    }
  };

  const handleToggleWidth = (widgetId: string) => {
    setFullWidthCharts((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  };

  const handleResetOrder = () => {
    if (initialChartsRef.current && onReorderCharts) {
      onReorderCharts([...initialChartsRef.current]);
    }
  };

  // Cross-filter click handler
  const handleItemClick = (columnKey: string, value: string, chartId: string) => {
    if (!value) return;
    if (
      filterState.crossFilter?.columnKey === columnKey &&
      filterState.crossFilter?.value === value
    ) {
      onClearCrossFilter();
    } else {
      onSetCrossFilter(columnKey, value, chartId);
    }
  };

  const isCrossFiltered = (key: string, val: string) => {
    return (
      filterState.crossFilter?.columnKey === key &&
      filterState.crossFilter?.value === val
    );
  };

  if (charts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 mb-1">No Visualizations Created Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Choose from detected column headers to dynamically build interactive charts for your data.
        </p>
        <button
          onClick={onOpenAddChart}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Visualization</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Sequence & Alignment Layout Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Visualizations Sequence & Alignment</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {charts.length} Visualizations
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Drag <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1 rounded">⠿</span> handle or select position to change order. Drag between items to insert anywhere. Toggle <span className="font-semibold text-slate-700">Full Width / Half Width</span> for alignment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetOrder}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset sequence order to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sequence</span>
            </button>
          </div>
        </div>

        {/* Visual Sequence Track Mini-Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Current Sequence:
          </span>
          {charts.map((c, i) => (
            <div
              key={c.id}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === i
                  ? 'opacity-40 border-slate-300'
                  : dragOverIndex === i
                  ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
              title={`Drag to reorder position. Currently #${i + 1}`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center font-mono">
                {i + 1}
              </span>
              <span className="truncate max-w-[130px]">{c.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Draggable Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {charts.map((widget, index) => {
        const isFullWidth = fullWidthCharts.has(widget.id);
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index && draggedIndex !== index;
        
        // Wrap with insertion zone before each item if dragging
        const insertionZoneBefore = draggedIndex !== null && (
          <div
            key={`drop-zone-${index}`}
            onDragOver={(e) => handleDragOverInsertionZone(e, index)}
            onDrop={(e) => handleDropOnInsertionZone(e, index)}
            className={`col-span-1 lg:col-span-2 transition-all duration-200 border-2 border-dashed rounded-xl py-2.5 px-4 text-center cursor-pointer ${
              insertionTarget === index
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm scale-[1.01]'
                : 'border-slate-300 bg-slate-50/70 text-slate-500 hover:border-red-400 hover:text-red-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>
                {index === 0
                  ? '↓ Drop Here to Insert at Position #1 (First)'
                  : `↓ Drop Here to Insert between #${index} and #${index + 1} (At Position #${index + 1})`}
              </span>
            </div>
          </div>
        );

        // If this widget is a map visualization, render DynamicGeoMap with drag & drop support!
        if (
          widget.chartType === 'auto_map' ||
          widget.chartType === 'india_map' ||
          widget.chartType === 'world_map'
        ) {
          return (
            <React.Fragment key={widget.id}>
              {insertionZoneBefore}
              <div
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 ${
                  isFullWidth ? 'lg:col-span-2 col-span-1' : 'col-span-1'
                } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${
                  isDragOver ? 'ring-2 ring-red-500 rounded-xl ring-offset-2' : ''
                }`}
              >
                <DynamicGeoMap
                  widget={widget}
                  columns={columns}
                  filteredRows={filteredRows}
                  allRows={filteredRows}
                  filterState={filterState}
                  onSetCrossFilter={onSetCrossFilter}
                  onClearCrossFilter={onClearCrossFilter}
                  onUpdateChart={onUpdateChart}
                  onRemoveChart={onRemoveChart}
                  onOpenEditChart={onOpenEditChart}
                  sequenceNumber={index + 1}
                  totalCharts={charts.length}
                  onMoveLeft={() => handleMove(index, index - 1)}
                  onMoveRight={() => handleMove(index, index + 1)}
                  onToggleWidth={() => handleToggleWidth(widget.id)}
                  isFullWidth={isFullWidth}
                />
              </div>
            </React.Fragment>
          );
        }

        // Calculate all categories count and the active data slice
        const allCategoriesData = aggregateChartData({ ...widget, topN: 0 }, filteredRows, columns);
        const data = aggregateChartData(widget, filteredRows, columns);
        const palette = PALETTE_MAP[widget.colorPalette || 'red'] || PALETTE_MAP.red;
        const isCurrentlyCrossFilteredSource =
          filterState.crossFilter?.sourceChartId === widget.id;
        const totalCategories = allCategoriesData.length;

        // Dynamic height for horizontal bar if many items
        const isHBar = widget.chartType === 'horizontal_bar';
        const hBarDynamicHeight = Math.max(260, data.length * 28);

        return (
          <React.Fragment key={widget.id}>
            {insertionZoneBefore}
            <div
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 ${
                isFullWidth ? 'lg:col-span-2 col-span-1' : 'col-span-1'
              } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${
                isDragOver ? 'ring-2 ring-red-500 rounded-xl ring-offset-2' : ''
              }`}
            >
              <div
                className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all group ${
                  isCurrentlyCrossFilteredSource
                    ? 'border-red-400 ring-2 ring-red-500/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Sequence & Alignment Reorder Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-100/90 text-xs select-none">
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                      title="Click and drag to reorder this visualization"
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-[11px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full font-mono shadow-xs tracking-wider">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Quick Position Selector Dropdown */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[11px]">
                      <span className="text-slate-400 font-semibold">Pos:</span>
                      <select
                        value={index}
                        onChange={(e) => handleMoveToPosition(index, Number(e.target.value))}
                        className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
                        title="Jump to specific sequence position"
                      >
                        {charts.map((_, i) => (
                          <option key={i} value={i}>
                            #{i + 1} {i === 0 ? '(First)' : i === charts.length - 1 ? '(Last)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                      of {charts.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, 0)}
                      disabled={index === 0}
                      className="px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer text-[10px] font-bold"
                      title="Move to First (#1)"
                    >
                      ⤒ First
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Move Left / Earlier in sequence"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, index + 1)}
                      disabled={index === charts.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Move Right / Later in sequence"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, charts.length - 1)}
                      disabled={index === charts.length - 1}
                      className="px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer text-[10px] font-bold"
                      title="Move to Last"
                    >
                      ⤓ Last
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleWidth(widget.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ml-1 transition-all cursor-pointer ${
                        isFullWidth
                          ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Toggle Full Width or Half Width alignment"
                    >
                      {isFullWidth ? 'Full Width (100%)' : 'Half Width (50%)'}
                    </button>
                  </div>
                </div>
            {/* Card Header: Title, Category Count Selector, Quick Chart Switcher, Actions */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate" title={widget.title}>
                    {widget.title}
                  </h3>
                  {filterState.crossFilter?.columnKey === widget.dimensionKey && (
                    <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                      Filtered: {filterState.crossFilter.value}
                      <button onClick={onClearCrossFilter} className="hover:opacity-75">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {/* Category Limit Selector: Default is All (Maximum available) with option to customize */}
                  {totalCategories > 1 && (
                    <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[10px]">
                      <span className="text-slate-500 font-medium">Items:</span>
                      <select
                        value={widget.topN || 0}
                        onChange={(e) => onUpdateChart({ ...widget, topN: Number(e.target.value) })}
                        className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
                        title="Customize number of categories shown"
                      >
                        <option value={0}>All ({totalCategories}) [Max]</option>
                        {totalCategories > 5 && <option value={5}>Top 5</option>}
                        {totalCategories > 8 && <option value={8}>Top 8</option>}
                        {totalCategories > 10 && <option value={10}>Top 10</option>}
                        {totalCategories > 15 && <option value={15}>Top 15</option>}
                        {totalCategories > 20 && <option value={20}>Top 20</option>}
                        {totalCategories > 25 && <option value={25}>Top 25</option>}
                        {totalCategories > 30 && <option value={30}>Top 30</option>}
                      </select>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                  Grouped by <span className="text-slate-600 font-semibold">{widget.dimensionKey}</span>
                  {widget.metricKey && (
                    <span> • {widget.aggregation.toUpperCase()}({widget.metricKey})</span>
                  )}
                  <span className="text-slate-500 ml-1.5">({data.length} of {totalCategories} showing)</span>
                </div>
              </div>

              {/* Quick Chart Type Switcher Icons directly on card header */}
              <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => onUpdateChart({ ...widget, chartType: 'horizontal_bar' })}
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'horizontal_bar'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Horizontal Bar"
                >
                  <BarChart3 className="w-3 h-3 rotate-90" />
                </button>
                <button
                  onClick={() => onUpdateChart({ ...widget, chartType: 'bar' })}
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'bar'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Column Bar"
                >
                  <BarChart3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateChart({ ...widget, chartType: 'donut' })}
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'donut' || widget.chartType === 'pie'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Donut"
                >
                  <PieIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    onUpdateChart({
                      ...widget,
                      chartType: 'line',
                      showTrendOverlay: true,
                    })
                  }
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'line'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Line Chart with Moving Average"
                >
                  <LineIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    onUpdateChart({
                      ...widget,
                      chartType: 'area',
                      showTrendOverlay: true,
                    })
                  }
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'area'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Area Chart with Moving Average"
                >
                  <AreaIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateChart({ ...widget, chartType: 'metric_leaderboard' })}
                  className={`p-1 rounded transition-colors ${
                    widget.chartType === 'metric_leaderboard'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Leaderboard"
                >
                  <Award className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateChart({ ...widget, chartType: 'auto_map' })}
                  className="p-1 rounded transition-colors text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                  title="Switch to Geographic Map"
                >
                  <MapPin className="w-3 h-3" />
                </button>

                {/* Edit & Delete */}
                <div className="w-[1px] h-3 bg-slate-300 mx-0.5" />
                <button
                  onClick={() => onOpenEditChart(widget)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                  title="Customize visualization"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemoveChart(widget.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove visualization"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Trend Analysis Toggle for Line & Area Charts */}
            {(widget.chartType === 'line' || widget.chartType === 'area') && (
              <div className="flex items-center justify-between px-2.5 py-1.5 mb-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold">Trend Analysis (Moving Average):</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[3, 5, 7].map((p) => (
                      <button
                        key={p}
                        onClick={() =>
                          onUpdateChart({
                            ...widget,
                            showTrendOverlay: true,
                            trendPeriod: p,
                          })
                        }
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono transition-colors ${
                          widget.showTrendOverlay && (widget.trendPeriod || 3) === p
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {p}P
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      onUpdateChart({
                        ...widget,
                        showTrendOverlay: !widget.showTrendOverlay,
                      })
                    }
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                      widget.showTrendOverlay
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {widget.showTrendOverlay ? 'Overlay On' : 'Overlay Off'}
                  </button>
                </div>
              </div>
            )}

            {/* Chart Canvas */}
            <div className={`w-full select-none ${isHBar && data.length > 8 ? 'max-h-[460px] overflow-y-auto pr-1' : 'h-64'}`}>
              {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">
                  No data matching current filters
                </div>
              ) : widget.chartType === 'horizontal_bar' ? (
                <div style={{ height: isHBar && data.length > 8 ? `${hBarDynamicHeight}px` : '100%', minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: '#475569' }}
                        width={105}
                        stroke="#cbd5e1"
                      />
                      <Tooltip
                        formatter={(val: any) => [val, widget.metricKey || 'Count']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        cursor="pointer"
                        onClick={(e: any) => handleItemClick(widget.dimensionKey, e.name, widget.id)}
                      >
                        {data.map((entry, index) => {
                          const active = isCrossFiltered(widget.dimensionKey, entry.name);
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={active ? '#991b1b' : palette[0]}
                              opacity={
                                filterState.crossFilter && !active && filterState.crossFilter.columnKey === widget.dimensionKey
                                  ? 0.35
                                  : 1
                              }
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : widget.chartType === 'bar' ? (
                <div className={data.length > 12 ? 'overflow-x-auto h-full' : 'h-full'}>
                  <div style={{ minWidth: data.length > 12 ? `${Math.max(450, data.length * 36)}px` : '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9, fill: '#64748b' }}
                          angle={-25}
                          textAnchor="end"
                          stroke="#cbd5e1"
                        />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[4, 4, 0, 0]}
                          cursor="pointer"
                          onClick={(e: any) => handleItemClick(widget.dimensionKey, e.name, widget.id)}
                        >
                          {data.map((entry, index) => {
                            const active = isCrossFiltered(widget.dimensionKey, entry.name);
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={active ? '#991b1b' : palette[0]}
                                opacity={
                                  filterState.crossFilter && !active && filterState.crossFilter.columnKey === widget.dimensionKey
                                    ? 0.35
                                    : 1
                                }
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : widget.chartType === 'donut' || widget.chartType === 'pie' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={widget.chartType === 'donut' ? 50 : 0}
                      outerRadius={80}
                      paddingAngle={widget.chartType === 'donut' ? 2 : 0}
                      cursor="pointer"
                      onClick={(e: any) => handleItemClick(widget.dimensionKey, e.name, widget.id)}
                    >
                      {data.map((entry, index) => {
                        const active = isCrossFiltered(widget.dimensionKey, entry.name);
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={palette[index % palette.length]}
                            stroke={active ? '#0f172a' : '#ffffff'}
                            strokeWidth={active ? 2 : 1}
                            opacity={
                              filterState.crossFilter && !active && filterState.crossFilter.columnKey === widget.dimensionKey
                                ? 0.35
                                : 1
                            }
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : widget.chartType === 'line' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line
                      type="monotone"
                      name={widget.metricKey || 'Records'}
                      dataKey="value"
                      stroke={palette[0]}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: palette[0] }}
                      activeDot={{ r: 5 }}
                    />
                    {widget.showTrendOverlay && (
                      <Line
                        type="monotone"
                        name={`Moving Avg (${widget.trendPeriod || 3}P)`}
                        dataKey="movingAverage"
                        stroke="#059669"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : widget.chartType === 'area' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area
                      type="monotone"
                      name={widget.metricKey || 'Records'}
                      dataKey="value"
                      stroke={palette[0]}
                      fill={`${palette[0]}20`}
                      strokeWidth={2}
                    />
                    {widget.showTrendOverlay && (
                      <Line
                        type="monotone"
                        name={`Moving Avg (${widget.trendPeriod || 3}P)`}
                        dataKey="movingAverage"
                        stroke="#059669"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                /* Leaderboard Ranking View */
                <div className="space-y-2 h-full overflow-y-auto pr-1">
                  {data.map((item, idx) => {
                    const isSelected = isCrossFiltered(widget.dimensionKey, item.name);
                    const maxValue = Math.max(...data.map((d) => d.value), 1);
                    const pct = Math.round((item.value / maxValue) * 100);

                    return (
                      <button
                        key={item.name}
                        onClick={() => handleItemClick(widget.dimensionKey, item.name, widget.id)}
                        className={`w-full p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-red-50 border-red-500 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-[10px] font-mono text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-red-600 shrink-0">
                            {item.formattedValue}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-red-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom info helper */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Filter className="w-2.5 h-2.5" /> Click elements to cross-filter
              </span>
              <span className="font-mono">{data.length} items shown</span>
            </div>
          </div>
        </div>
      </React.Fragment>
      );
    })}

      {/* End Insertion Drop Target Zone */}
      {draggedIndex !== null && (
        <div
          onDragOver={(e) => handleDragOverInsertionZone(e, charts.length)}
          onDrop={(e) => handleDropOnInsertionZone(e, charts.length)}
          className={`col-span-1 lg:col-span-2 transition-all duration-200 border-2 border-dashed rounded-xl py-3 px-4 text-center cursor-pointer ${
            insertionTarget === charts.length
              ? 'border-red-500 bg-red-50 text-red-700 shadow-sm scale-[1.01]'
              : 'border-slate-300 bg-slate-50/70 text-slate-500 hover:border-red-400 hover:text-red-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>↓ Drop Here to Place at End (Position #{charts.length})</span>
          </div>
        </div>
      )}

      {/* Add Another Visualization Card at the end */}
      <button
        onClick={onOpenAddChart}
        className="bg-white hover:bg-red-50/40 rounded-xl border border-dashed border-slate-300 hover:border-red-400 p-8 flex flex-col items-center justify-center text-center transition-all group min-h-[300px]"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-red-100 text-slate-500 group-hover:text-red-600 flex items-center justify-center mb-2 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-slate-800 group-hover:text-red-700 mb-0.5">
          + Add New Visualization
        </div>
        <div className="text-[10px] text-slate-400 max-w-[200px]">
          Choose any detected header and build a Bar, Donut, Line or Leaderboard chart
        </div>
      </button>
      </div>
    </div>
  );
};
