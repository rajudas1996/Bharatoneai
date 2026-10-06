import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  TrendingUp, 
  Building2, 
  Users, 
  Download, 
  Compass, 
  Layers,
  ArrowUpRight,
  Sparkles,
  Send,
  Navigation
} from 'lucide-react';
import { IndiaMapGraphic } from '../IndiaMapGraphic';
import { queryAiMaps } from '../../utils/aiClient';

interface StateData {
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  revenueCr: number;
  activeLeads: number;
  growth: number;
  hubs: number;
}

const INDIA_STATE_DATA: StateData[] = [
  { state: 'Maharashtra', region: 'West', revenueCr: 482.5, activeLeads: 14200, growth: 24.5, hubs: 8 },
  { state: 'Karnataka', region: 'South', revenueCr: 395.2, activeLeads: 12850, growth: 28.2, hubs: 6 },
  { state: 'Delhi NCR', region: 'North', revenueCr: 340.8, activeLeads: 10400, growth: 18.7, hubs: 5 },
  { state: 'Tamil Nadu', region: 'South', revenueCr: 298.4, activeLeads: 9600, growth: 16.4, hubs: 5 },
  { state: 'Gujarat', region: 'West', revenueCr: 275.6, activeLeads: 8900, growth: 21.0, hubs: 4 },
  { state: 'Telangana', region: 'South', revenueCr: 245.0, activeLeads: 8100, growth: 31.5, hubs: 4 },
  { state: 'Uttar Pradesh', region: 'North', revenueCr: 210.8, activeLeads: 9400, growth: 19.8, hubs: 3 },
  { state: 'West Bengal', region: 'East', revenueCr: 168.4, activeLeads: 6200, growth: 14.2, hubs: 3 },
  { state: 'Rajasthan', region: 'North', revenueCr: 135.2, activeLeads: 4900, growth: 17.5, hubs: 2 },
  { state: 'Madhya Pradesh', region: 'Central', revenueCr: 118.0, activeLeads: 4300, growth: 15.1, hubs: 2 },
];

export const MapsDataTool: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [mapQuery, setMapQuery] = useState('Key ports, logistics hubs and industrial corridors connecting Mumbai to Pune');
  const [isQuerying, setIsQuerying] = useState(false);
  const [groundedResult, setGroundedResult] = useState<string | null>(null);

  const handleQueryGrounding = async () => {
    if (!mapQuery.trim()) return;
    setIsQuerying(true);
    const result = await queryAiMaps(mapQuery);
    setGroundedResult(result.text);
    setIsQuerying(false);
  };

  const filtered = INDIA_STATE_DATA.filter((s) => {
    const matchesRegion = selectedRegion === 'All' || s.region === selectedRegion;
    const matchesSearch = s.state.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const totalRevenue = filtered.reduce((acc, s) => acc + s.revenueCr, 0);
  const totalLeads = filtered.reduce((acc, s) => acc + s.activeLeads, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Maps & Spatial Intelligence</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                India Territory Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive state & district analytics, revenue hotspots, lead density, and logistics hubs
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Spatial dataset exported successfully (.csv)!')}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Geo Data</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Territory Revenue
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{totalRevenue.toFixed(1)} Cr
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +22.4% YoY Growth across states
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Pan-India Leads
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalLeads.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Covering 28 States & 8 Union Territories
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Regional Logistics Hubs
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            37 Hubs
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">
            100% On-Time Delivery Index
          </div>
        </div>
      </div>

      {/* Main Layout: Graphic Left, Data Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Graphic Representation (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-slate-900 mb-2 self-start flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Interactive India Territory Overview</span>
          </div>
          <div className="w-full max-w-[320px] py-4">
            <IndiaMapGraphic className="w-full h-auto drop-shadow-md" />
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            Territory boundaries and regional hubs mapped with high precision
          </div>
        </div>

        {/* Right Column: Filter & State Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Region Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              {['All', 'North', 'South', 'West', 'East', 'Central'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    selectedRegion === r
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search state..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Revenue (₹ Cr)</th>
                  <th className="py-2.5 px-3">Active Leads</th>
                  <th className="py-2.5 px-3">Growth</th>
                  <th className="py-2.5 px-3 text-right">Hubs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((s) => (
                  <tr key={s.state} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.state}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.region}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{s.revenueCr.toFixed(1)}</td>
                    <td className="py-2.5 px-3 font-mono">{s.activeLeads.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+{s.growth}%</td>
                    <td className="py-2.5 px-3 text-right font-mono">{s.hubs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Google Maps AI Grounding Assistant */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Google Maps Grounding AI Assistant</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  gemini-3.5-flash + googleMaps
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Ask any real-time question about routes, cities, distances, logistics corridors, or industrial zones
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={mapQuery}
            onChange={(e) => setMapQuery(e.target.value)}
            placeholder="e.g. Find key ports, logistics hubs and industrial corridors connecting Mumbai to Pune"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleQueryGrounding}
            disabled={isQuerying}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isQuerying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Grounding...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Query Maps AI</span>
              </>
            )}
          </button>
        </div>

        {groundedResult && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-slate-800 space-y-1.5 animate-in fade-in">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Grounded Location Intelligence Response:</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-slate-700">
              {groundedResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
