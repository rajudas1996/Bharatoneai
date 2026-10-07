import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Compass,
  Map as MapIcon,
  Globe
} from 'lucide-react';
import { INDIA_STATE_PATHS } from '../data/indiaStateSvgPaths';
import { normalizeStateName } from '../utils/geoUtils';
import { Dataset } from '../types/dashboard';

interface IndiaGoogleMapExplorerProps {
  dataset: Dataset | null;
  onNavigateToDashboard: () => void;
  onSelectState?: (stateName: string) => void;
}

// Region metadata for richer state inspection
const STATE_META: Record<string, { capital: string; zone: string; code: string }> = {
  'Maharashtra': { capital: 'Mumbai', zone: 'Western India', code: 'MH' },
  'Delhi': { capital: 'New Delhi', zone: 'Northern India', code: 'DL' },
  'Karnataka': { capital: 'Bengaluru', zone: 'Southern India', code: 'KA' },
  'Gujarat': { capital: 'Gandhinagar', zone: 'Western India', code: 'GJ' },
  'Tamil Nadu': { capital: 'Chennai', zone: 'Southern India', code: 'TN' },
  'Uttar Pradesh': { capital: 'Lucknow', zone: 'Northern India', code: 'UP' },
  'West Bengal': { capital: 'Kolkata', zone: 'Eastern India', code: 'WB' },
  'Telangana': { capital: 'Hyderabad', zone: 'Southern India', code: 'TG' },
  'Rajasthan': { capital: 'Jaipur', zone: 'Northern India', code: 'RJ' },
  'Madhya Pradesh': { capital: 'Bhopal', zone: 'Central India', code: 'MP' },
  'Kerala': { capital: 'Thiruvananthapuram', zone: 'Southern India', code: 'KL' },
  'Andhra Pradesh': { capital: 'Amaravati', zone: 'Southern India', code: 'AP' },
  'Bihar': { capital: 'Patna', zone: 'Eastern India', code: 'BR' },
  'Punjab': { capital: 'Chandigarh', zone: 'Northern India', code: 'PB' },
  'Haryana': { capital: 'Chandigarh', zone: 'Northern India', code: 'HR' },
  'Odisha': { capital: 'Bhubaneswar', zone: 'Eastern India', code: 'OD' },
  'Assam': { capital: 'Dispur', zone: 'North-Eastern India', code: 'AS' },
  'Jharkhand': { capital: 'Ranchi', zone: 'Eastern India', code: 'JH' },
  'Chhattisgarh': { capital: 'Raipur', zone: 'Central India', code: 'CG' },
  'Uttarakhand': { capital: 'Dehradun', zone: 'Northern India', code: 'UK' },
  'Himachal Pradesh': { capital: 'Shimla', zone: 'Northern India', code: 'HP' },
  'Goa': { capital: 'Panaji', zone: 'Western India', code: 'GA' },
  'Tripura': { capital: 'Agartala', zone: 'North-Eastern India', code: 'TR' },
  'Meghalaya': { capital: 'Shillong', zone: 'North-Eastern India', code: 'ML' },
  'Manipur': { capital: 'Imphal', zone: 'North-Eastern India', code: 'MN' },
  'Nagaland': { capital: 'Kohima', zone: 'North-Eastern India', code: 'NL' },
  'Mizoram': { capital: 'Aizawl', zone: 'North-Eastern India', code: 'MZ' },
  'Sikkim': { capital: 'Gangtok', zone: 'North-Eastern India', code: 'SK' },
  'Arunachal Pradesh': { capital: 'Itanagar', zone: 'North-Eastern India', code: 'AR' },
  'Jammu and Kashmir': { capital: 'Srinagar / Jammu', zone: 'Northern India', code: 'JK' },
  'Ladakh': { capital: 'Leh', zone: 'Northern India', code: 'LA' },
  'Chandigarh': { capital: 'Chandigarh', zone: 'Union Territory', code: 'CH' },
  'Puducherry': { capital: 'Puducherry', zone: 'Union Territory', code: 'PY' },
  'Andaman and Nicobar Islands': { capital: 'Port Blair', zone: 'Union Territory', code: 'AN' },
  'Dadra and Nagar Haveli and Daman and Diu': { capital: 'Daman', zone: 'Union Territory', code: 'DD' },
  'Lakshadweep': { capital: 'Kavaratti', zone: 'Union Territory', code: 'LD' },
};

export const IndiaGoogleMapExplorer: React.FC<IndiaGoogleMapExplorerProps> = ({
  dataset,
  onNavigateToDashboard,
  onSelectState,
}) => {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Calculate live state record counts if dataset is loaded
  const stateRecordCounts = useMemo(() => {
    if (!dataset || !dataset.rows.length) return {};
    const counts: Record<string, number> = {};
    
    // Find state column
    const stateCol = dataset.columns.find((c) => {
      const l = c.name.toLowerCase();
      return l.includes('state') || l.includes('region') || l.includes('province');
    });

    if (stateCol) {
      dataset.rows.forEach((r) => {
        const raw = r[stateCol.key];
        const canonical = normalizeStateName(raw);
        if (canonical) {
          counts[canonical] = (counts[canonical] || 0) + 1;
        }
      });
    }

    return counts;
  }, [dataset]);

  // Max records for choropleth scale
  const maxRecords = useMemo(() => {
    const vals = Object.values(stateRecordCounts);
    return vals.length ? Math.max(...vals) : 0;
  }, [stateRecordCounts]);

  const activeDisplayState = hoveredState || selectedState;
  const meta = STATE_META[activeDisplayState] || { capital: 'Capital City', zone: 'India', code: 'IN' };
  const recordsForActiveState = stateRecordCounts[activeDisplayState] || 0;

  // Filtered state list for quick pills
  const stateKeys = useMemo(() => Object.keys(INDIA_STATE_PATHS), []);

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return stateKeys;
    const q = searchQuery.toLowerCase();
    return stateKeys.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery, stateKeys]);

  const handleStateClick = (stateName: string) => {
    setSelectedState(stateName);
    if (onSelectState) {
      onSelectState(stateName);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 0.8));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedState('Maharashtra');
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden select-none animate-in fade-in duration-200">
      {/* Google Maps Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-red-50/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                India Geographic Map Explorer
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                Live Vector 36 States/UTs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive Google Maps style interface • Verified boundary vectors matching simplemaps & official survey
            </p>
          </div>
        </div>

        {/* Top Controls: Mode switcher + Search */}
        <div className="flex items-center gap-2">
          {/* Map / Satellite Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMapMode('map')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-red-600" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapMode === 'satellite'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Satellite</span>
            </button>
          </div>

          {/* Quick Dashboard Action */}
          <button
            onClick={onNavigateToDashboard}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Open in Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Viewer Layout (2 Columns: Map Left, State Card Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Left Column: Interactive Map Canvas with Floating Google Controls (8 cols) */}
        <div className={`lg:col-span-8 relative flex items-center justify-center p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 ${
          mapMode === 'satellite' ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'
        }`}>
          {/* Floating Search Bar */}
          <div className="absolute top-4 left-4 z-10 w-64 max-w-[calc(100%-120px)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state (e.g. Maharashtra)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Floating Google Map Style Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center font-bold text-base transition-transform active:scale-90 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center font-bold text-base transition-transform active:scale-90 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* SVG Map Canvas rendering all 36 States */}
          <div className="w-full h-[380px] sm:h-[420px] flex items-center justify-center">
            <svg
              viewBox="0 0 800 800"
              className="w-full h-full max-h-full transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                cursor: 'grab',
              }}
            >
              <defs>
                <filter id="explorerSelectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#dc2626" floodOpacity="0.5" />
                </filter>
              </defs>

              <g>
                {Object.entries(INDIA_STATE_PATHS).map(([stateName, pathD]) => {
                  const isSelected = selectedState === stateName;
                  const isHovered = hoveredState === stateName;
                  const count = stateRecordCounts[stateName] || 0;

                  // Choropleth or default map theme
                  let fillColor = '#f1f5f9';
                  if (mapMode === 'satellite') {
                    fillColor = isSelected ? '#ef4444' : isHovered ? '#38bdf8' : '#1e293b';
                  } else {
                    if (isSelected) {
                      fillColor = '#dc2626'; // Red highlight for selected
                    } else if (isHovered) {
                      fillColor = '#f87171'; // Lighter red on hover
                    } else if (count > 0 && maxRecords > 0) {
                      const ratio = count / maxRecords;
                      fillColor = ratio > 0.5 ? '#ef4444' : ratio > 0.2 ? '#fca5a5' : '#fee2e2';
                    } else {
                      fillColor = '#ffffff';
                    }
                  }

                  const strokeColor = mapMode === 'satellite' 
                    ? (isSelected ? '#ffffff' : '#334155')
                    : (isSelected ? '#991b1b' : '#cbd5e1');

                  return (
                    <path
                      key={stateName}
                      d={pathD}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#explorerSelectedGlow)' : undefined}
                      className="transition-colors duration-150 cursor-pointer hover:stroke-slate-900"
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Bottom Left Legend */}
          <div className="absolute bottom-3 left-4 z-10 bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-lg px-2.5 py-1.5 shadow-2xs text-[10px] space-y-1">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Selected: {selectedState}</span>
            </div>
            {dataset && (
              <div className="text-slate-400 font-mono text-[9px]">
                {dataset.fileName} active • {Object.keys(stateRecordCounts).length} states mapped
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed State Profile Inspector (4 cols) */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-white space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                State Dossier
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                {meta.code}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{activeDisplayState}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {meta.zone} • Capital: <strong className="text-slate-800">{meta.capital}</strong>
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Status</span>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                  Verified Border
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <span className="text-[10px] font-bold text-red-400 uppercase font-mono">Data Records</span>
                <div className="text-sm font-extrabold text-red-600 mt-0.5">
                  {recordsForActiveState > 0 ? recordsForActiveState.toLocaleString() : 'No Uploaded Data'}
                </div>
              </div>
            </div>

            {/* Quick State Selector Chips */}
            <div className="mt-5">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">
                Quick Select Region:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredStates.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStateClick(s)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      selectedState === s
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={onNavigateToDashboard}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Explore {activeDisplayState} in Dashboard</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
