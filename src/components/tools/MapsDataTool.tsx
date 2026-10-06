import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Layers, 
  Building2, 
  Navigation, 
  Filter, 
  Compass, 
  Download, 
  Eye, 
  CheckCircle2,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';

interface POIItem {
  id: string;
  name: string;
  city: string;
  state: string;
  coords: { x: number; y: number }; // Relative coordinates for interactive SVG canvas
  category: 'Corporate HQ' | 'Regional Hub' | 'Branch Office' | 'Underwriting Center';
  turnover: string;
  activeLeads: number;
  rm: string;
}

const POI_LOCATIONS: POIItem[] = [
  { id: 'poi-1', name: 'Mumbai BKC Financial Hub', city: 'Mumbai', state: 'Maharashtra', coords: { x: 38, y: 58 }, category: 'Corporate HQ', turnover: '₹ 450 Cr', activeLeads: 142, rm: 'Vikram Rao' },
  { id: 'poi-2', name: 'Bengaluru Electronics City', city: 'Bengaluru', state: 'Karnataka', coords: { x: 44, y: 78 }, category: 'Regional Hub', turnover: '₹ 320 Cr', activeLeads: 98, rm: 'Sneha Patel' },
  { id: 'poi-3', name: 'New Delhi Connaught Place', city: 'New Delhi', state: 'Delhi NCR', coords: { x: 40, y: 32 }, category: 'Underwriting Center', turnover: '₹ 280 Cr', activeLeads: 85, rm: 'Amit Shah' },
  { id: 'poi-4', name: 'Hyderabad Hitec City Hub', city: 'Hyderabad', state: 'Telangana', coords: { x: 47, y: 64 }, category: 'Regional Hub', turnover: '₹ 190 Cr', activeLeads: 64, rm: 'Pooja Nair' },
  { id: 'poi-5', name: 'Chennai OMR Tech Corridor', city: 'Chennai', state: 'Tamil Nadu', coords: { x: 48, y: 82 }, category: 'Branch Office', turnover: '₹ 165 Cr', activeLeads: 52, rm: 'Karthik Raja' },
  { id: 'poi-6', name: 'Kolkata Salt Lake Sector V', city: 'Kolkata', state: 'West Bengal', coords: { x: 74, y: 48 }, category: 'Branch Office', turnover: '₹ 140 Cr', activeLeads: 41, rm: 'Raju Das' },
  { id: 'poi-7', name: 'Pune Magarpatta Cybercity', city: 'Pune', state: 'Maharashtra', coords: { x: 40, y: 62 }, category: 'Branch Office', turnover: '₹ 110 Cr', activeLeads: 37, rm: 'Rahul Deshmukh' },
  { id: 'poi-8', name: 'Ahmedabad GIFT City IFSC', city: 'Ahmedabad', state: 'Gujarat', coords: { x: 32, y: 50 }, category: 'Underwriting Center', turnover: '₹ 210 Cr', activeLeads: 73, rm: 'Deepak Joshi' },
];

export const MapsDataTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPOI, setSelectedPOI] = useState<POIItem>(POI_LOCATIONS[0]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredPOIs = POI_LOCATIONS.filter((poi) => {
    const matchesSearch =
      poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || poi.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Maps & Geographic Data Explorer</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              Spatial Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic territory mapping, regional hub density, and location-based business metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showHeatmap
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Directory & Filters, Right Interactive Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List & Search (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search city, state, or location hub..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Corporate HQ', 'Regional Hub', 'Branch Office', 'Underwriting Center'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Location List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredPOIs.map((poi) => (
              <button
                key={poi.id}
                onClick={() => setSelectedPOI(poi)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  selectedPOI.id === poi.id
                    ? 'border-red-500 bg-red-50/70 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-xs text-slate-900">{poi.name}</div>
                  <span className="text-[10px] font-mono font-bold text-red-600 shrink-0">
                    {poi.turnover}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {poi.city}, {poi.state} • <span className="font-semibold text-slate-700">{poi.category}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>RM: {poi.rm}</span>
                  <span className="font-mono">{poi.activeLeads} Active Leads</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Map Canvas & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Map Visualizer Canvas */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-lg p-5 relative overflow-hidden min-h-[420px] flex flex-col justify-between">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between z-10 text-white text-xs">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-red-500" />
                <span className="font-bold">National Enterprise Territory Map</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Lat: 19.0760° N • Long: 72.8777° E
              </span>
            </div>

            {/* Stylized Vector Map Surface with Pinpoints */}
            <div className="relative w-full h-80 my-4 flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Geographic Hub Hotspots */}
              {POI_LOCATIONS.map((poi) => {
                const isSelected = selectedPOI.id === poi.id;
                return (
                  <button
                    key={poi.id}
                    onClick={() => setSelectedPOI(poi)}
                    style={{ left: `${poi.coords.x}%`, top: `${poi.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    {/* Ripple / Heatmap glow */}
                    {showHeatmap && (
                      <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-pulse pointer-events-none" />
                    )}
                    <div
                      className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                        isSelected
                          ? 'bg-red-600 text-white scale-125 ring-4 ring-red-400/50 shadow-lg z-20'
                          : 'bg-white text-red-600 hover:scale-110 shadow-md'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>

                    {/* Tooltip on hover/active */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-black/90 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none z-30">
                      {poi.name} ({poi.turnover})
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map Canvas Footer */}
            <div className="flex items-center justify-between z-10 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              <span>Selected Point: <strong className="text-white">{selectedPOI.name}</strong></span>
              <span className="font-mono text-emerald-400">All Nodes Online</span>
            </div>
          </div>

          {/* Selected POI Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  {selectedPOI.category}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedPOI.name}</h3>
                <p className="text-xs text-slate-500">{selectedPOI.city}, {selectedPOI.state}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Exporting geospatial metadata for ${selectedPOI.name}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Coordinates</span>
                </button>
              </div>
            </div>

            {/* Metric Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Turnover Volume</span>
                <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{selectedPOI.turnover}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Active Leads</span>
                <div className="text-sm font-extrabold text-red-600 font-mono mt-0.5">{selectedPOI.activeLeads} Leads</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned RM</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedPOI.rm}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
