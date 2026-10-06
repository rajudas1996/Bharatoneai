import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  AreaChart as AreaIcon, 
  Award, 
  Layers, 
  Sliders, 
  TrendingUp, 
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  ColumnMeta, 
  DataRow, 
  DynamicChartWidget, 
  ChartType, 
  AggregationType 
} from '../types/dashboard';
import { aggregateChartData } from '../utils/dashboardBuilder';
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
  CartesianGrid 
} from 'recharts';

interface ChartBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMeta[];
  rows: DataRow[];
  onSaveWidget: (widget: DynamicChartWidget) => void;
  initialWidget?: DynamicChartWidget | null;
  defaultColumnKey?: string;
}

const CHART_TYPES: { id: ChartType; label: string; icon: any; desc: string }[] = [
  { id: 'horizontal_bar', label: 'Horizontal Bar', icon: BarChart3, desc: 'Ranking categories and metrics horizontally' },
  { id: 'bar', label: 'Column Bar', icon: BarChart3, desc: 'Vertical bars for comparison' },
  { id: 'donut', label: 'Donut Chart', icon: PieIcon, desc: 'Proportions of categories (2-8 items)' },
  { id: 'pie', label: 'Pie Chart', icon: PieIcon, desc: 'Classic circular proportions' },
  { id: 'line', label: 'Line Chart', icon: LineIcon, desc: 'Trends over time with Moving Average' },
  { id: 'area', label: 'Area Chart', icon: AreaIcon, desc: 'Filled trend curves with Moving Average' },
  { id: 'metric_leaderboard', label: 'Leaderboard', icon: Award, desc: 'Top N ranking list with progress meters' },
];

export const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({
  isOpen,
  onClose,
  columns,
  rows,
  onSaveWidget,
  initialWidget,
  defaultColumnKey,
}) => {
  const numericColumns = useMemo(() => columns.filter((c) => c.type === 'numeric'), [columns]);

  // Form State
  const [chartType, setChartType] = useState<ChartType>('horizontal_bar');
  const [title, setTitle] = useState('');
  const [dimensionKey, setDimensionKey] = useState('');
  const [metricKey, setMetricKey] = useState<string>(''); // empty string = Count of Records
  const [aggregation, setAggregation] = useState<AggregationType>('count');
  const [topN, setTopN] = useState<number>(8);
  const [showTrendOverlay, setShowTrendOverlay] = useState<boolean>(false);
  const [trendPeriod, setTrendPeriod] = useState<number>(3);
  const [colorPalette, setColorPalette] = useState<'red' | 'corporate' | 'emerald' | 'amber' | 'blue'>('red');

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (initialWidget) {
      setChartType(initialWidget.chartType);
      setTitle(initialWidget.title);
      setDimensionKey(initialWidget.dimensionKey);
      setMetricKey(initialWidget.metricKey || '');
      setAggregation(initialWidget.aggregation);
      setTopN(initialWidget.topN || 8);
      setShowTrendOverlay(!!initialWidget.showTrendOverlay);
      setTrendPeriod(initialWidget.trendPeriod || 3);
      setColorPalette(initialWidget.colorPalette || 'red');
    } else {
      // New widget defaults
      const initialDim = defaultColumnKey || columns[0]?.key || '';
      const selectedCol = columns.find((c) => c.key === initialDim);
      
      let inferredType: ChartType = 'horizontal_bar';
      if (selectedCol?.type === 'date' || selectedCol?.role === 'date') {
        inferredType = 'line';
      } else if (selectedCol?.uniqueValues.length && selectedCol.uniqueValues.length <= 6) {
        inferredType = 'donut';
      }

      setChartType(inferredType);
      setDimensionKey(initialDim);

      const hasNumeric = numericColumns.length > 0;
      const initialMetric = hasNumeric ? numericColumns[0].key : '';
      setMetricKey(initialMetric);
      setAggregation(hasNumeric ? 'sum' : 'count');
      setTopN(8);
      setShowTrendOverlay(inferredType === 'line');
      setTrendPeriod(3);
      setColorPalette('red');

      // Auto title
      const metricLabel = hasNumeric ? `Total ${numericColumns[0].name}` : 'Records';
      setTitle(`${selectedCol?.name || 'Category'} Breakdown (${metricLabel})`);
    }
  }, [isOpen, initialWidget, defaultColumnKey, columns, numericColumns]);

  // Handle Dimension Change
  const handleDimensionChange = (key: string) => {
    setDimensionKey(key);
    const col = columns.find((c) => c.key === key);
    if (col?.type === 'date' && chartType !== 'line' && chartType !== 'area') {
      setChartType('line');
      setShowTrendOverlay(true);
    }
    // Update title suggestion
    const metricCol = columns.find((c) => c.key === metricKey);
    const metricLabel = metricCol ? `Total ${metricCol.name}` : 'Records';
    setTitle(`${col?.name || key} Breakdown (${metricLabel})`);
  };

  // Handle Metric Change
  const handleMetricChange = (key: string) => {
    setMetricKey(key);
    if (!key) {
      setAggregation('count');
    } else if (aggregation === 'count') {
      setAggregation('sum');
    }
    const dimCol = columns.find((c) => c.key === dimensionKey);
    const metricCol = columns.find((c) => c.key === key);
    const metricLabel = metricCol ? `Total ${metricCol.name}` : 'Records';
    setTitle(`${dimCol?.name || dimensionKey} Breakdown (${metricLabel})`);
  };

  // Preview Widget Data
  const previewWidget: DynamicChartWidget = useMemo(
    () => ({
      id: initialWidget?.id || 'preview-widget',
      title: title || 'Visualization Preview',
      chartType,
      dimensionKey,
      metricKey: metricKey || undefined,
      aggregation,
      topN,
      showTrendOverlay,
      trendPeriod,
      colorPalette,
    }),
    [
      initialWidget,
      title,
      chartType,
      dimensionKey,
      metricKey,
      aggregation,
      topN,
      showTrendOverlay,
      trendPeriod,
      colorPalette,
    ]
  );

  const previewData = useMemo(() => {
    if (!dimensionKey) return [];
    return aggregateChartData(previewWidget, rows, columns);
  }, [previewWidget, rows, columns, dimensionKey]);

  // Save handler
  const handleSave = () => {
    if (!dimensionKey) return;
    const finalWidget: DynamicChartWidget = {
      id: initialWidget?.id || `widget-${Date.now()}`,
      title: title.trim() || `${dimensionKey} Breakdown`,
      chartType,
      dimensionKey,
      metricKey: metricKey || undefined,
      aggregation,
      topN,
      showTrendOverlay,
      trendPeriod,
      colorPalette,
    };
    onSaveWidget(finalWidget);
    onClose();
  };

  if (!isOpen) return null;

  const PALETTE_COLORS: Record<string, string[]> = {
    red: ['#dc2626', '#ef4444', '#f87171', '#b91c1c', '#991b1b', '#fca5a5'],
    corporate: ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#64748b'],
    emerald: ['#059669', '#10b981', '#34d399', '#047857', '#065f46', '#6ee7b7'],
    amber: ['#d97706', '#f59e0b', '#fbbf24', '#b45309', '#92400e', '#fde68a'],
    blue: ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#1e40af', '#93c5fd'],
  };

  const currentColors = PALETTE_COLORS[colorPalette] || PALETTE_COLORS.red;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {initialWidget ? 'Edit Chart Visualization' : 'Create Dynamic Visualization'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Select headers, choose chart type, and define metrics dynamically
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

        {/* Content Body: Left Form, Right Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Configuration Form (Col 1 to 6) */}
          <div className="lg:col-span-6 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto">
            {/* 1. Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chart Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. State-wise Turnover Breakdown"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-red-500 outline-none transition-all"
              />
            </div>

            {/* 2. Visual Chart Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Visualization Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CHART_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = chartType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setChartType(t.id);
                        if (t.id === 'line' || t.id === 'area') {
                          setShowTrendOverlay(true);
                        }
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 text-red-900 ring-1 ring-red-500 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-slate-500'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </div>
                      <span className="text-xs font-bold leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Dimension (Group By / X-Axis) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dimension (Group By / Categories)
              </label>
              <select
                value={dimensionKey}
                onChange={(e) => handleDimensionChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer"
              >
                {columns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name} ({c.type.toUpperCase()}) - {c.uniqueValues.length} unique values
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Metric (Y-Axis / Value) & Aggregation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Metric (Value)
                </label>
                <select
                  value={metricKey}
                  onChange={(e) => handleMetricChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer"
                >
                  <option value="">Count of Records</option>
                  {numericColumns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} (Numeric)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aggregation
                </label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as AggregationType)}
                  disabled={!metricKey}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-red-500 outline-none cursor-pointer disabled:opacity-50"
                >
                  {!metricKey ? (
                    <option value="count">Count (Total Rows)</option>
                  ) : (
                    <>
                      <option value="sum">Sum (Total)</option>
                      <option value="avg">Average</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* 5. Top N Limit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Display Top Items</label>
                <span className="text-xs font-mono font-bold text-red-600">{topN} items</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                step="1"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Top 3</span>
                <span>Top 10</span>
                <span>Top 25</span>
              </div>
            </div>

            {/* 6. Trend Analysis Toggle (for Line & Area charts) */}
            {(chartType === 'line' || chartType === 'area') && (
              <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="text-xs font-bold text-red-950">Trend Analysis Overlay</div>
                      <div className="text-[10px] text-red-700">Display moving average curve</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTrendOverlay}
                    onChange={(e) => setShowTrendOverlay(e.target.checked)}
                    className="w-4 h-4 accent-red-600 cursor-pointer rounded"
                  />
                </div>

                {showTrendOverlay && (
                  <div className="flex items-center justify-between pt-2 border-t border-red-200/60">
                    <span className="text-[11px] font-semibold text-red-900">Moving Average Window:</span>
                    <div className="flex gap-1.5">
                      {[3, 5, 7].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTrendPeriod(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                            trendPeriod === p
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p}-Period
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Color Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chart Color Scheme
              </label>
              <div className="flex items-center gap-2">
                {(['red', 'corporate', 'emerald', 'amber', 'blue'] as const).map((pal) => (
                  <button
                    key={pal}
                    type="button"
                    onClick={() => setColorPalette(pal)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border capitalize transition-all ${
                      colorPalette === pal
                        ? 'border-slate-800 bg-slate-900 text-white font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PALETTE_COLORS[pal][0] }}
                    />
                    <span>{pal}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Preview Area (Col 7 to 12) */}
          <div className="lg:col-span-6 p-6 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  Live Preview
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {previewData.length} data points
                </span>
              </div>

              {/* Chart Title Display */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs mb-4">
                <div className="font-bold text-xs text-slate-900 mb-0.5">{title}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Grouped by {dimensionKey} • {metricKey ? `${aggregation.toUpperCase()} of ${metricKey}` : 'Row Count'}
                </div>

                {/* Render Chart */}
                <div className="h-64 w-full mt-3">
                  {previewData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                      No data available for this field configuration
                    </div>
                  ) : chartType === 'horizontal_bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={previewData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="value" fill={currentColors[0]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={previewData} margin={{ top: 5, right: 10, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="value" fill={currentColors[0]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : chartType === 'donut' || chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={previewData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={chartType === 'donut' ? 45 : 0}
                          outerRadius={75}
                          paddingAngle={chartType === 'donut' ? 2 : 0}
                        >
                          {previewData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={currentColors[idx % currentColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : chartType === 'line' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={previewData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={currentColors[0]} strokeWidth={2.5} dot={{ r: 3 }} />
                        {showTrendOverlay && (
                          <Line
                            type="monotone"
                            dataKey="movingAverage"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : chartType === 'area' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={previewData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke={currentColors[0]} fill={`${currentColors[0]}22`} strokeWidth={2} />
                        {showTrendOverlay && (
                          <Line
                            type="monotone"
                            dataKey="movingAverage"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    /* Leaderboard preview */
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
                      {previewData.map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                            <span className="font-semibold text-slate-800">{item.name}</span>
                          </div>
                          <span className="font-bold font-mono text-red-600">{item.formattedValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all active:scale-[0.98]"
              >
                {initialWidget ? 'Update Visualization' : 'Save Visualization'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
