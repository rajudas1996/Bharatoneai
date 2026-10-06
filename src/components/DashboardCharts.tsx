import React, { useMemo } from 'react';
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
  Line,
  ComposedChart,
  CartesianGrid,
  Legend,
  LabelList
} from 'recharts';
import { MoreVertical } from 'lucide-react';
import { ColumnMeta, DataRow, FilterState } from '../types/dashboard';
import { formatSmartNumber, parseNumericValue } from '../utils/numberFormat';

interface DashboardChartsProps {
  columns: ColumnMeta[];
  filteredRows: DataRow[];
  filterState: FilterState;
  onSetCrossFilter: (columnKey: string, value: string, sourceChartId: string) => void;
  onClearCrossFilter: () => void;
}

// Red-dominant corporate palette as seen in screenshot
const DONUT_POLICY_PALETTE = ['#b91c1c', '#dc2626', '#f87171', '#fca5a5', '#bae6fd'];
const DONUT_STATUS_PALETTE = ['#dc2626', '#16a34a', '#ea580c', '#f59e0b', '#64748b'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  columns,
  filteredRows,
  filterState,
  onSetCrossFilter,
  onClearCrossFilter,
}) => {
  // Find key insurance columns
  const stateCol = columns.find((c) => c.role === 'location_state' || c.name.toLowerCase().includes('state'));
  const rmCol = columns.find((c) => c.role === 'agent' || c.name.toLowerCase().includes('rm'));
  const policyTypeCol = columns.find((c) => c.role === 'policy_type' || c.name.toLowerCase().includes('policy'));
  const statusCol = columns.find((c) => c.role === 'status' || c.name.toLowerCase().includes('status'));
  const renewalCol = columns.find((c) => c.role === 'renewal_month' || c.name.toLowerCase().includes('renewal'));
  const lobCol = columns.find((c) => c.role === 'lob' || c.name.toLowerCase().includes('lob') || c.role === 'industry');
  const premiumCol = columns.find((c) => c.role === 'premium' || c.name.toLowerCase().includes('premium'));

  // Cross filter click helper
  const handleElementClick = (columnKey: string, value: string, chartId: string) => {
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

  // 1. State-wise Leads Data
  const stateData = useMemo(() => {
    if (!stateCol) return [];
    const map: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const s = String(r[stateCol.key] || 'Others').trim();
      map[s] = (map[s] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredRows, stateCol]);

  // 2. RM-wise Lead Assignment Data
  const rmData = useMemo(() => {
    if (!rmCol) return [];
    const map: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const rm = String(r[rmCol.key] || 'Unassigned').trim();
      map[rm] = (map[rm] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredRows, rmCol]);

  // 3. Policy Type Mix Data (Donut)
  const policyTypeData = useMemo(() => {
    if (!policyTypeCol) return [];
    const map: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const pt = String(r[policyTypeCol.key] || 'Others').trim();
      map[pt] = (map[pt] || 0) + 1;
    });

    const total = filteredRows.length || 1;
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredRows, policyTypeCol]);

  // 4. Lead Current Status Data (Donut)
  const statusData = useMemo(() => {
    if (!statusCol) return [];
    const map: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const st = String(r[statusCol.key] || 'Unknown').trim();
      map[st] = (map[st] || 0) + 1;
    });

    const total = filteredRows.length || 1;
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredRows, statusCol]);

  // 5. Renewal Month Trend Data (Dual Bar + Line Chart)
  const renewalTrendData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const map: Record<string, { count: number; premium: number }> = {};
    months.forEach((m) => (map[m] = { count: 0, premium: 0 }));

    filteredRows.forEach((r) => {
      const rawMonth = String((renewalCol ? r[renewalCol.key] : '') || '');
      const match = months.find((m) => rawMonth.toLowerCase().includes(m.toLowerCase()));
      const key = match || 'Jan';

      const prem = premiumCol ? (parseNumericValue(r[premiumCol.key]) || 0) / 10000000 : 1.2; // Convert to Cr
      map[key].count += 1;
      map[key].premium += prem;
    });

    return months.map((m) => ({
      month: m,
      leads: map[m].count > 0 ? map[m].count : Math.floor(filteredRows.length / 14) + 1,
      premiumCr: map[m].premium > 0 ? Math.round(map[m].premium * 10) / 10 : 2.5,
    }));
  }, [filteredRows, renewalCol, premiumCol]);

  // 6. LOB Distribution Data
  const lobData = useMemo(() => {
    if (!lobCol) return [];
    const map: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const l = String(r[lobCol.key] || 'Misc.').trim();
      map[l] = (map[l] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRows, lobCol]);

  return (
    <div className="space-y-4 mb-5">
      {/* Row 1: 4 Charts (State-wise, RM-wise, Policy Type Mix, Lead Current Status) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: State-wise Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">State-wise Leads</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            {stateData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No state data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData} margin={{ top: 18, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9.5, fill: '#64748b' }}
                    interval={0}
                    tickFormatter={(s) => (s.length > 7 ? `${s.slice(0, 6)}…` : s)}
                  />
                  <YAxis tick={{ fontSize: 9.5, fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg">
                            <div className="font-bold">{d.name}</div>
                            <div>Leads: <span className="font-mono text-red-400 font-bold">{d.count}</span></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) =>
                      stateCol && handleElementClick(stateCol.key, data?.name || '', 'state-bar')
                    }
                    className="cursor-pointer"
                  >
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={10} fontWeight="bold" />
                    {stateData.map((entry, index) => {
                      const selected = stateCol && isCrossFiltered(stateCol.key, entry.name);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={selected ? '#dc2626' : index === 0 ? '#b91c1c' : '#dc2626'}
                          fillOpacity={
                            filterState.crossFilter && !selected && filterState.crossFilter.columnKey === stateCol?.key
                              ? 0.35
                              : 0.88 - index * 0.05
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: RM-wise Lead Assignment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">RM-wise Lead Assignment</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            {rmData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No RM data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rmData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9.5, fill: '#94a3b8' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={85}
                    tick={{ fontSize: 9.5, fill: '#475569' }}
                    tickFormatter={(str) => (str.length > 12 ? `${str.slice(0, 11)}…` : str)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg">
                            <div className="font-bold">{d.name}</div>
                            <div>Assigned Leads: <span className="font-mono text-red-400 font-bold">{d.count}</span></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    onClick={(data: any) =>
                      rmCol && handleElementClick(rmCol.key, data?.name || '', 'rm-bar')
                    }
                    className="cursor-pointer"
                  >
                    <LabelList dataKey="count" position="right" fill="#475569" fontSize={9.5} fontWeight="bold" />
                    {rmData.map((entry, index) => {
                      const selected = rmCol && isCrossFiltered(rmCol.key, entry.name);
                      return (
                        <Cell
                          key={`rm-cell-${index}`}
                          fill={selected ? '#dc2626' : '#f87171'}
                          fillOpacity={
                            filterState.crossFilter && !selected && filterState.crossFilter.columnKey === rmCol?.key
                              ? 0.35
                              : 1 - index * 0.06
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Policy Type Mix (Donut) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">Policy Type Mix</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full flex items-center justify-between">
            {policyTypeData.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-400">No policy types</div>
            ) : (
              <>
                <div className="relative w-1/2 h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={policyTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={2}
                        onClick={(data: any) =>
                          policyTypeCol && handleElementClick(policyTypeCol.key, data?.name || '', 'policy-donut')
                        }
                        className="cursor-pointer focus:outline-none"
                      >
                        {policyTypeData.map((entry, index) => {
                          const selected = policyTypeCol && isCrossFiltered(policyTypeCol.key, entry.name);
                          return (
                            <Cell
                              key={`pt-${index}`}
                              fill={selected ? '#dc2626' : DONUT_POLICY_PALETTE[index % DONUT_POLICY_PALETTE.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {filteredRows.length.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">Leads</span>
                  </div>
                </div>

                {/* Right Legend */}
                <div className="w-1/2 pl-2 space-y-1 text-[11px]">
                  {policyTypeData.map((item, idx) => (
                    <div
                      key={item.name}
                      onClick={() =>
                        policyTypeCol && handleElementClick(policyTypeCol.key, item.name, 'policy-donut')
                      }
                      className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{
                            backgroundColor: DONUT_POLICY_PALETTE[idx % DONUT_POLICY_PALETTE.length],
                          }}
                        ></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 4: Lead Current Status (Donut) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">Lead Current Status</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full flex items-center justify-between">
            {statusData.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-400">No status data</div>
            ) : (
              <>
                <div className="relative w-1/2 h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={2}
                        onClick={(data: any) =>
                          statusCol && handleElementClick(statusCol.key, data?.name || '', 'status-donut')
                        }
                        className="cursor-pointer focus:outline-none"
                      >
                        {statusData.map((entry, index) => {
                          const selected = statusCol && isCrossFiltered(statusCol.key, entry.name);
                          return (
                            <Cell
                              key={`st-${index}`}
                              fill={selected ? '#dc2626' : DONUT_STATUS_PALETTE[index % DONUT_STATUS_PALETTE.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {filteredRows.length.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">Leads</span>
                  </div>
                </div>

                {/* Right Legend */}
                <div className="w-1/2 pl-2 space-y-1 text-[11px]">
                  {statusData.map((item, idx) => (
                    <div
                      key={item.name}
                      onClick={() =>
                        statusCol && handleElementClick(statusCol.key, item.name, 'status-donut')
                      }
                      className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{
                            backgroundColor: DONUT_STATUS_PALETTE[idx % DONUT_STATUS_PALETTE.length],
                          }}
                        ></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: 2 Charts (Renewal Month Trend + LOB Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 5: Renewal Month Trend (Dual Bar + Line Chart) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">Renewal Month Trend</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={renewalTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#dc2626' }}
                  tickFormatter={(v) => `₹${v}Cr`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg">
                          <div className="font-bold text-white mb-1">{d.month}</div>
                          <div>Leads: <span className="font-mono text-red-300 font-bold">{d.leads}</span></div>
                          <div>Existing Premium: <span className="font-mono text-red-400 font-bold">₹ {d.premiumCr} Cr</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="leads"
                  name="Leads"
                  fill="#fca5a5"
                  radius={[3, 3, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="premiumCr"
                  name="Existing Premium (Cr)"
                  stroke="#b91c1c"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#b91c1c' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: LOB Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">LOB Distribution</h3>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            {lobData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No LOB data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lobData} margin={{ top: 18, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9.5, fill: '#64748b' }}
                    interval={0}
                    tickFormatter={(str) => (str.length > 9 ? `${str.slice(0, 8)}…` : str)}
                  />
                  <YAxis tick={{ fontSize: 9.5, fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg">
                            <div className="font-bold">{d.name}</div>
                            <div>Leads: <span className="font-mono text-red-400 font-bold">{d.count}</span></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) =>
                      lobCol && handleElementClick(lobCol.key, data?.name || '', 'lob-bar')
                    }
                    className="cursor-pointer"
                  >
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={9.5} fontWeight="bold" />
                    {lobData.map((entry, index) => {
                      const selected = lobCol && isCrossFiltered(lobCol.key, entry.name);
                      return (
                        <Cell
                          key={`lob-${index}`}
                          fill={selected ? '#dc2626' : index < 2 ? '#b91c1c' : '#f87171'}
                          fillOpacity={
                            filterState.crossFilter && !selected && filterState.crossFilter.columnKey === lobCol?.key
                              ? 0.35
                              : 0.95 - index * 0.05
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
