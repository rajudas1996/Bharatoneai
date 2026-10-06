import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { 
  MapPin, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Layers, 
  ChevronRight, 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { 
  ColumnMeta, 
  DataRow, 
  FilterState, 
  DynamicChartWidget 
} from '../types/dashboard';
import { 
  getRegionName, 
  getDistrictName, 
  normalizeStateName, 
  normalizeCountryName,
  INDIAN_STATES_CANONICAL
} from '../utils/geoUtils';
import { formatSmartNumber, parseNumericValue } from '../utils/numberFormat';

interface DynamicGeoMapProps {
  widget: DynamicChartWidget;
  columns: ColumnMeta[];
  filteredRows: DataRow[];
  allRows: DataRow[];
  filterState: FilterState;
  onSetCrossFilter: (columnKey: string, value: string, sourceChartId: string) => void;
  onClearCrossFilter: () => void;
  onUpdateChart: (widget: DynamicChartWidget) => void;
  onRemoveChart: (id: string) => void;
  onOpenEditChart: (widget: DynamicChartWidget) => void;
}

// In-memory cache for loaded GeoJSON geometries to prevent re-fetching
const GEOJSON_CACHE: Record<string, any> = {};

export const DynamicGeoMap: React.FC<DynamicGeoMapProps> = ({
  widget,
  columns,
  filteredRows,
  allRows,
  filterState,
  onSetCrossFilter,
  onClearCrossFilter,
  onUpdateChart,
  onRemoveChart,
  onOpenEditChart,
}) => {
  // Navigation & Drilldown State: 'world' | 'india' | 'district'
  const [activeScope, setActiveScope] = useState<'world' | 'india' | 'district'>(() => {
    if (widget.chartType === 'world_map' || widget.geoScope === 'world') return 'world';
    return 'india';
  });

  const [drilldownState, setDrilldownState] = useState<string | null>(null);

  // GeoJSON state
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Tooltip state
  const [hoveredRegion, setHoveredRegion] = useState<{
    name: string;
    count: number;
    value: number;
    sharePct: number;
    formattedValue: string;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Determine current GeoJSON URL based on activeScope & drilldown
  const geoUrl = useMemo(() => {
    if (activeScope === 'world') {
      return '/maps/world.json';
    }
    if (activeScope === 'district' && drilldownState) {
      // Use full India districts file and filter to this state
      return '/maps/india.json';
    }
    // Default: India state/UT map
    return '/maps/india-states.json';
  }, [activeScope, drilldownState]);

  // Load GeoJSON with caching and error retry
  const loadGeoJSON = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    if (GEOJSON_CACHE[geoUrl]) {
      setGeoData(GEOJSON_CACHE[geoUrl]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(geoUrl);
      if (!res.ok) {
        throw new Error(`Failed to load map data (${res.status})`);
      }
      const data = await res.json();
      GEOJSON_CACHE[geoUrl] = data;
      setGeoData(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('GeoJSON loading error:', err);
      setLoadError('Map data could not be loaded. Please check network connection.');
      setIsLoading(false);
    }
  }, [geoUrl]);

  useEffect(() => {
    loadGeoJSON();
  }, [loadGeoJSON]);

  // Metric Column Meta
  const metricCol = useMemo(() => {
    return widget.metricKey ? columns.find((c) => c.key === widget.metricKey) : undefined;
  }, [columns, widget.metricKey]);

  const isCurrency = useMemo(() => {
    if (!metricCol) return false;
    const l = metricCol.name.toLowerCase();
    return (
      l.includes('premium') ||
      l.includes('turnover') ||
      l.includes('revenue') ||
      l.includes('amount') ||
      l.includes('sales') ||
      l.includes('price') ||
      l.includes('cost')
    );
  }, [metricCol]);

  // Calculate Region Aggregations from CURRENT filteredRows
  // Memoized for high performance
  const regionStats = useMemo(() => {
    const stats: Record<string, { count: number; sum: number; min: number; max: number }> = {};
    const totalCount = filteredRows.length;

    filteredRows.forEach((row) => {
      let rawVal = row[widget.dimensionKey];
      if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') return;

      let normalizedKey = String(rawVal).trim();
      if (activeScope === 'india') {
        const canonicalState = normalizeStateName(rawVal);
        if (canonicalState) normalizedKey = canonicalState;
      } else if (activeScope === 'world') {
        const canonicalCountry = normalizeCountryName(rawVal);
        if (canonicalCountry) normalizedKey = canonicalCountry;
      }

      if (!stats[normalizedKey]) {
        stats[normalizedKey] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
      }

      stats[normalizedKey].count += 1;

      if (widget.metricKey) {
        const num = parseNumericValue(row[widget.metricKey]);
        if (num !== null) {
          stats[normalizedKey].sum += num;
          if (num < stats[normalizedKey].min) stats[normalizedKey].min = num;
          if (num > stats[normalizedKey].max) stats[normalizedKey].max = num;
        }
      }
    });

    // Compute max and min values across all regions for choropleth scale
    let maxMetricVal = 0;
    let minMetricVal = Infinity;

    Object.values(stats).forEach((s) => {
      const metricVal = widget.metricKey && widget.aggregation === 'sum' 
        ? s.sum 
        : widget.metricKey && widget.aggregation === 'avg' && s.count > 0 
          ? s.sum / s.count 
          : s.count;

      if (metricVal > maxMetricVal) maxMetricVal = metricVal;
      if (metricVal < minMetricVal) minMetricVal = metricVal;
    });

    if (minMetricVal === Infinity) minMetricVal = 0;

    return {
      stats,
      maxMetricVal,
      minMetricVal,
      totalCount,
    };
  }, [filteredRows, widget.dimensionKey, widget.metricKey, widget.aggregation, activeScope]);

  // Synchronize Active Selection with CURRENT Filter State (Cross-filter / Categorical)
  const currentlySelectedRegion = useMemo(() => {
    // 1. Check crossFilter on widget dimension key
    if (filterState.crossFilter?.columnKey === widget.dimensionKey) {
      const raw = filterState.crossFilter.value;
      return activeScope === 'india' ? (normalizeStateName(raw) || raw) : raw;
    }

    // 2. Check categorical filters on widget dimension key
    const catList = filterState.categorical[widget.dimensionKey];
    if (catList && catList.length > 0) {
      const raw = catList[0];
      return activeScope === 'india' ? (normalizeStateName(raw) || raw) : raw;
    }

    return null;
  }, [filterState.crossFilter, filterState.categorical, widget.dimensionKey, activeScope]);

  // Click handler: Toggle or Replace Selection via EXISTING Dashboard Filter Engine
  const handleRegionClick = (regionName: string) => {
    if (!regionName) return;

    // Check if clicking India on World map to drill down
    if (activeScope === 'world' && (regionName === 'India' || regionName.toLowerCase() === 'india')) {
      setActiveScope('india');
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    // Normal Region Selection: synchronize with existing filter engine
    if (currentlySelectedRegion === regionName) {
      // Clicked currently active region -> Deselect / Clear filter
      onClearCrossFilter();
    } else {
      // Find raw representation in current dataset or use regionName
      const matchingRow = allRows.find((r) => {
        const val = r[widget.dimensionKey];
        if (activeScope === 'india') {
          return normalizeStateName(val) === regionName;
        }
        return String(val || '').trim().toLowerCase() === regionName.toLowerCase();
      });

      const filterValue = matchingRow ? String(matchingRow[widget.dimensionKey]) : regionName;
      onSetCrossFilter(widget.dimensionKey, filterValue, widget.id);
    }
  };

  // Drilldown to Districts for an Indian State
  const handleDrilldownToDistricts = (stateName: string) => {
    setDrilldownState(stateName);
    setActiveScope('district');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Filter features if in district drilldown mode
  const activeFeatures = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    if (activeScope === 'district' && drilldownState) {
      return geoData.features.filter((f: any) => {
        const st = getRegionName(f);
        return normalizeStateName(st) === normalizeStateName(drilldownState);
      });
    }
    return geoData.features;
  }, [geoData, activeScope, drilldownState]);

  // Sizing & D3 Projections
  const svgWidth = 540;
  const svgHeight = 440;

  const pathGenerator = useMemo(() => {
    if (!activeFeatures || activeFeatures.length === 0) return null;

    const projection = geoMercator();

    // Fit projection to available width and height with padding
    const featureCollection = {
      type: 'FeatureCollection',
      features: activeFeatures,
    };

    try {
      projection.fitExtent(
        [
          [20, 20],
          [svgWidth - 20, svgHeight - 20],
        ],
        featureCollection as any
      );
      return geoPath().projection(projection);
    } catch (e) {
      console.error('Projection fitting error:', e);
      return null;
    }
  }, [activeFeatures, svgWidth, svgHeight]);

  // Choropleth Color Calculator in Red Theme
  const getChoroplethColor = (val: number, isSelected: boolean) => {
    if (isSelected) {
      return '#dc2626'; // Strong Bold Red for Selected State
    }

    if (val <= 0) {
      return '#f1f5f9'; // Neutral light gray for regions with no matching records
    }

    const { minMetricVal, maxMetricVal } = regionStats;
    const range = Math.max(1, maxMetricVal - minMetricVal);
    const ratio = Math.max(0, Math.min(1, (val - minMetricVal) / range));

    // Red gradient stops from light pastel red to deep burgundy
    if (ratio < 0.2) return '#fee2e2';
    if (ratio < 0.4) return '#fca5a5';
    if (ratio < 0.6) return '#f87171';
    if (ratio < 0.8) return '#ef4444';
    if (ratio < 0.95) return '#dc2626';
    return '#991b1b'; // Deep dark red
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all group col-span-1 lg:col-span-2 select-none relative">
      {/* Top Header: Title, Breadcrumb, Active Scope Switcher, Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {widget.title || 'Geographic Distribution Map'}
              </h3>

              {currentlySelectedRegion && (
                <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                  <span>Selected: {currentlySelectedRegion}</span>
                  <button onClick={onClearCrossFilter} className="hover:opacity-75">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>

            {/* Breadcrumb & Navigation Level */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
              {activeScope === 'world' ? (
                <span className="text-slate-600 font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-red-600" />
                  World Overview
                </span>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveScope('world');
                      setDrilldownState(null);
                      setZoomLevel(1);
                    }}
                    className="hover:text-red-600 hover:underline flex items-center gap-0.5"
                  >
                    World
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <button
                    onClick={() => {
                      setActiveScope('india');
                      setDrilldownState(null);
                      setZoomLevel(1);
                    }}
                    className={`font-semibold hover:text-red-600 ${
                      activeScope === 'india' ? 'text-red-600' : 'text-slate-600'
                    }`}
                  >
                    India (States & UTs)
                  </button>

                  {activeScope === 'district' && drilldownState && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span className="text-red-600 font-bold">{drilldownState} (Districts)</span>
                    </>
                  )}
                </>
              )}
              <span> • Grouped by {widget.dimensionKey}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Zoom Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Drilldown Back button */}
          {activeScope === 'district' && (
            <button
              onClick={() => {
                setActiveScope('india');
                setDrilldownState(null);
                setZoomLevel(1);
              }}
              className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 shadow-2xs"
            >
              ← Back to States
            </button>
          )}

          {activeScope === 'india' && widget.chartType === 'world_map' && (
            <button
              onClick={() => {
                setActiveScope('world');
                setZoomLevel(1);
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              ← Back to World
            </button>
          )}

          {/* District drill-down trigger for selected state */}
          {activeScope === 'india' && currentlySelectedRegion && (
            <button
              onClick={() => handleDrilldownToDistricts(currentlySelectedRegion)}
              className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
            >
              Drill-down: {currentlySelectedRegion}
            </button>
          )}

          {/* Zoom In / Out / Reset Controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.3))}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.3))}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
              title="Reset Map View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onRemoveChart(widget.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Remove Map"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Rendering Area */}
      <div 
        ref={containerRef}
        className="w-full h-[400px] sm:h-[450px] relative bg-slate-50/50 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center select-none"
      >
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 z-10">
            <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs font-semibold">Loading official geographic map boundaries...</span>
          </div>
        )}

        {/* Fallback Error with Retry Button (Requirement 18) */}
        {!isLoading && loadError && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm z-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-800 mb-1">Map data could not be loaded.</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Unable to load the geographic boundary GeoJSON. The rest of the dashboard remains fully functional.
            </p>
            <button
              onClick={loadGeoJSON}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* SVG Map Canvas */}
        {!isLoading && !loadError && pathGenerator && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full max-h-full transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              cursor: 'grab',
            }}
          >
            <defs>
              <filter id="mapSelectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#dc2626" floodOpacity="0.45" />
              </filter>
            </defs>

            <g>
              {activeFeatures.map((feature: any, idx: number) => {
                const pathD = pathGenerator(feature);
                if (!pathD) return null;

                const rawName = getRegionName(feature);
                const districtName = getDistrictName(feature);
                const displayName = activeScope === 'district' && districtName 
                  ? `${districtName} (${rawName})` 
                  : rawName;

                // Match with stats
                const statKey = activeScope === 'india' 
                  ? (normalizeStateName(rawName) || rawName)
                  : activeScope === 'world'
                    ? (normalizeCountryName(rawName) || rawName)
                    : rawName;

                const stat = regionStats.stats[statKey] || { count: 0, sum: 0, min: 0, max: 0 };
                const metricValue = widget.metricKey && widget.aggregation === 'sum' 
                  ? stat.sum 
                  : widget.metricKey && widget.aggregation === 'avg' && stat.count > 0 
                    ? stat.sum / stat.count 
                    : stat.count;

                const isSelected = currentlySelectedRegion === statKey || currentlySelectedRegion === rawName;
                const fillColor = getChoroplethColor(metricValue, isSelected);

                return (
                  <path
                    key={feature.id || `${rawName}-${idx}`}
                    d={pathD}
                    fill={fillColor}
                    stroke={isSelected ? '#7f1d1d' : '#ffffff'}
                    strokeWidth={isSelected ? 2.5 : 0.75}
                    strokeLinejoin="round"
                    filter={isSelected ? 'url(#mapSelectedGlow)' : undefined}
                    className="transition-all duration-150 cursor-pointer hover:brightness-90 hover:stroke-slate-900 hover:stroke-[1.5px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegionClick(rawName);
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) {
                        const totalRowsCount = Math.max(1, regionStats.totalCount);
                        const share = Math.round((stat.count / totalRowsCount) * 1000) / 10;
                        setHoveredRegion({
                          name: displayName,
                          count: stat.count,
                          value: metricValue,
                          sharePct: share,
                          formattedValue: formatSmartNumber(metricValue, isCurrency),
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* Hover Tooltip (Requirement 7) */}
        {hoveredRegion && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-xs min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${Math.min(hoveredRegion.x + 12, (containerRef.current?.clientWidth || 300) - 170)}px`,
              top: `${Math.max(hoveredRegion.y - 70, 10)}px`,
            }}
          >
            <div className="font-bold text-xs text-white pb-1 border-b border-slate-700/80 mb-1 flex items-center justify-between">
              <span className="truncate">{hoveredRegion.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 ml-1" />
            </div>
            <div className="space-y-0.5 text-[11px] font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Records:</span>
                <span className="font-bold text-white">{hoveredRegion.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Share:</span>
                <span className="font-bold text-red-400">{hoveredRegion.sharePct}%</span>
              </div>
              {widget.metricKey && (
                <div className="flex justify-between text-slate-300 pt-0.5 border-t border-slate-800">
                  <span className="truncate">{metricCol?.name || 'Metric'}:</span>
                  <span className="font-bold text-white">{hoveredRegion.formattedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Left Legend & Active Regions Count */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg p-2 shadow-2xs text-[10px] space-y-1">
          <div className="flex items-center justify-between gap-3 text-slate-600 font-semibold">
            <span>Intensity Scale</span>
            <span className="font-mono text-red-600 font-bold">
              {formatSmartNumber(regionStats.maxMetricVal, isCurrency)} max
            </span>
          </div>
          {/* Gradient Bar */}
          <div className="w-32 h-2 rounded-full bg-gradient-to-r from-slate-200 via-red-300 to-red-700" />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Bottom Right Region Coverage Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg px-2.5 py-1 shadow-2xs text-[10px] text-slate-500 font-mono">
          <span className="font-bold text-slate-800">{Object.keys(regionStats.stats).length}</span> regions active in current view
        </div>
      </div>
    </div>
  );
};
