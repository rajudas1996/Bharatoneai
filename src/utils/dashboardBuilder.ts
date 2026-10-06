import { 
  ColumnMeta, 
  DataRow, 
  DashboardLayoutConfig, 
  DynamicChartWidget, 
  DynamicKPIWidget 
} from '../types/dashboard';
import { parseNumericValue, formatSmartNumber, formatCurrencyWithSuffix, formatDisplayDate } from './numberFormat';
import { detectGeographicColumns } from './geoUtils';

/**
 * Identifies serial numbers, IDs, date columns, or contact fields
 * that should NEVER be summed as KPI metrics.
 */
export function isNonMetricColumn(columnName: string, columnKey: string): boolean {
  const norm = (columnName + ' ' + columnKey).toLowerCase().replace(/[._-]/g, ' ').trim();
  
  // 1. Serial number / Sequence / ID patterns
  const serialPatterns = [
    'sl no', 's no', 'sr no', 'sno', 'serial no', 'serial number', 'serial',
    'row id', 'row num', 'row no', 'index', 'seq', 'sequence', 'token', 'token no',
    'id', 'record id', 'sr'
  ];
  if (serialPatterns.some((p) => norm === p || norm.startsWith(p + ' ') || norm.endsWith(' ' + p))) {
    return true;
  }
  if (/^sl\.?\s*no\.?$/i.test(columnName.trim()) || /^sr\.?\s*no\.?$/i.test(columnName.trim())) {
    return true;
  }

  // 2. Date / Time / Timestamp patterns
  const datePatterns = [
    'date', 'time', 'timestamp', 'dob', 'dt', 'year', 'month', 'day',
    'valid upto', 'valid to', 'expiry', 'created', 'updated'
  ];
  if (datePatterns.some((p) => norm.includes(p))) {
    return true;
  }

  // 3. Phone / Mobile / Pin / Postal code
  const contactPatterns = ['phone', 'mobile', 'contact', 'pincode', 'pin code', 'zip', 'postal'];
  if (contactPatterns.some((p) => norm.includes(p))) {
    return true;
  }

  return false;
}

/**
 * Automatically inspects ANY uploaded Excel sheet headers and rows,
 * and generates a smart initial dashboard tailored to this dataset.
 */
export function generateAutoDashboardConfig(
  columns: ColumnMeta[],
  rows: DataRow[]
): DashboardLayoutConfig {
  // Exclude serial numbers and date columns from numeric metrics
  const numericCols = columns.filter(
    (c) => c.type === 'numeric' && !isNonMetricColumn(c.name, c.key)
  );
  const categoricalCols = columns.filter(
    (c) => c.type === 'categorical' || (c.uniqueValues.length > 0 && c.uniqueValues.length <= 150)
  );
  const dateCols = columns.filter((c) => c.type === 'date' || c.role === 'date');

  // 1. DYNAMIC KPIS
  const kpis: DynamicKPIWidget[] = [
    {
      id: 'kpi-total-records',
      title: 'Total Records',
      aggregation: 'count',
      format: 'count',
    },
  ];

  // Numeric KPIs (Sum / Avg) - strictly true metrics only
  if (numericCols.length > 0) {
    const primaryNum = numericCols[0];
    const isCurrency = 
      primaryNum.name.toLowerCase().includes('premium') ||
      primaryNum.name.toLowerCase().includes('turnover') ||
      primaryNum.name.toLowerCase().includes('revenue') ||
      primaryNum.name.toLowerCase().includes('amount') ||
      primaryNum.name.toLowerCase().includes('sales') ||
      primaryNum.name.toLowerCase().includes('cost') ||
      primaryNum.name.toLowerCase().includes('price');

    kpis.push({
      id: `kpi-sum-${primaryNum.key}`,
      title: `Total ${primaryNum.name}`,
      columnKey: primaryNum.key,
      aggregation: 'sum',
      format: isCurrency ? 'currency' : 'number',
    });

    if (numericCols.length > 1) {
      const secondNum = numericCols[1];
      const isSecondCurrency = 
        secondNum.name.toLowerCase().includes('premium') ||
        secondNum.name.toLowerCase().includes('turnover') ||
        secondNum.name.toLowerCase().includes('revenue') ||
        secondNum.name.toLowerCase().includes('amount') ||
        secondNum.name.toLowerCase().includes('sales');

      kpis.push({
        id: `kpi-sum-${secondNum.key}`,
        title: `Total ${secondNum.name}`,
        columnKey: secondNum.key,
        aggregation: 'sum',
        format: isSecondCurrency ? 'currency' : 'number',
      });
    } else {
      kpis.push({
        id: `kpi-avg-${primaryNum.key}`,
        title: `Avg ${primaryNum.name}`,
        columnKey: primaryNum.key,
        aggregation: 'avg',
        format: isCurrency ? 'currency' : 'number',
      });
    }
  }

  // Categorical Unique Count KPIs
  const entityCol = categoricalCols.find((c) => 
    c.role === 'entity_name' || 
    c.name.toLowerCase().includes('company') || 
    c.name.toLowerCase().includes('client') ||
    c.name.toLowerCase().includes('customer') ||
    c.name.toLowerCase().includes('name')
  );

  const stateCol = categoricalCols.find((c) => 
    c.role === 'location_state' || 
    c.name.toLowerCase().includes('state') ||
    c.name.toLowerCase().includes('region') ||
    c.name.toLowerCase().includes('branch')
  );

  const agentCol = categoricalCols.find((c) => 
    c.role === 'agent' || 
    c.name.toLowerCase().includes('rm') ||
    c.name.toLowerCase().includes('agent') ||
    c.name.toLowerCase().includes('manager') ||
    c.name.toLowerCase().includes('owner')
  );

  if (entityCol && !kpis.some(k => k.columnKey === entityCol.key)) {
    kpis.push({
      id: `kpi-unique-${entityCol.key}`,
      title: `Unique ${entityCol.name}`,
      columnKey: entityCol.key,
      aggregation: 'unique_count',
      format: 'count',
    });
  }

  if (stateCol && !kpis.some(k => k.columnKey === stateCol.key)) {
    kpis.push({
      id: `kpi-unique-${stateCol.key}`,
      title: `${stateCol.name} Covered`,
      columnKey: stateCol.key,
      aggregation: 'unique_count',
      format: 'count',
    });
  }

  if (agentCol && !kpis.some(k => k.columnKey === agentCol.key) && kpis.length < 6) {
    kpis.push({
      id: `kpi-unique-${agentCol.key}`,
      title: `Active ${agentCol.name}s`,
      columnKey: agentCol.key,
      aggregation: 'unique_count',
      format: 'count',
    });
  }

  // Ensure at least 4-5 KPIs
  for (const c of categoricalCols) {
    if (kpis.length >= 5) break;
    if (!kpis.some(k => k.columnKey === c.key) && c.uniqueValues.length >= 2) {
      kpis.push({
        id: `kpi-unique-${c.key}`,
        title: `Unique ${c.name}`,
        columnKey: c.key,
        aggregation: 'unique_count',
        format: 'count',
      });
    }
  }

  // 2. DYNAMIC TOP FILTER COLUMNS (select 4 to 8 meaningful categorical / date columns)
  const filterColumns: string[] = [];
  const candidateFilterCols = [...categoricalCols, ...dateCols].filter(
    (c) => c.uniqueValues.length >= 2 && c.uniqueValues.length <= 80
  );

  for (const c of candidateFilterCols) {
    if (filterColumns.length >= 8) break;
    if (!filterColumns.includes(c.key)) {
      filterColumns.push(c.key);
    }
  }

  // 3. DYNAMIC CHARTS (topN = 0 by default to show ALL available categories completely)
  const charts: DynamicChartWidget[] = [];
  const primaryNum = numericCols[0];

  // Map Feature: Automatically determine and add Map ONLY if valid geographic data exists
  const geoInfo = detectGeographicColumns(columns, rows);
  if (geoInfo.hasGeographicData) {
    charts.push({
      id: 'chart-geo-map-auto',
      title: geoInfo.geoScope === 'world'
        ? 'Global Geographic Map'
        : `${geoInfo.geoColumnName} Geographic Map`,
      chartType: 'auto_map',
      dimensionKey: geoInfo.geoColumnKey,
      metricKey: primaryNum?.key,
      aggregation: primaryNum ? 'sum' : 'count',
      topN: 0,
      colorPalette: 'red',
      geoScope: geoInfo.geoScope,
    });
  }

  // Chart 1: Categorical Bar or Horizontal Bar (e.g. State, Category, RM, Product)
  const barDim = stateCol || categoricalCols.find(c => c.uniqueValues.length >= 3 && c.uniqueValues.length <= 40) || categoricalCols[0];
  if (barDim) {
    charts.push({
      id: 'chart-dim-bar-1',
      title: `${barDim.name} Breakdown`,
      chartType: 'horizontal_bar',
      dimensionKey: barDim.key,
      metricKey: primaryNum?.key,
      aggregation: primaryNum ? 'sum' : 'count',
      topN: 0, // 0 = Show ALL available categories (complete list)
      colorPalette: 'red',
    });
  }

  // Chart 2: Donut Chart for Low-Cardinality Field (Status, Stage, LOB, Type)
  const lowCardCol = categoricalCols.find(
    (c) => c.key !== barDim?.key && c.uniqueValues.length >= 2 && c.uniqueValues.length <= 7
  ) || categoricalCols.find((c) => c.key !== barDim?.key);

  if (lowCardCol) {
    charts.push({
      id: 'chart-donut-2',
      title: `${lowCardCol.name} Distribution`,
      chartType: 'donut',
      dimensionKey: lowCardCol.key,
      aggregation: 'count',
      topN: 0, // Show all categories
      colorPalette: 'corporate',
    });
  }

  // Chart 3: Temporal / Trend Analysis Chart (Line or Area Chart with Moving Average overlay)
  const trendDim = dateCols[0] || categoricalCols.find((c) => {
    const n = c.name.toLowerCase();
    return n.includes('month') || n.includes('year') || n.includes('quarter') || n.includes('period') || n.includes('date');
  });

  if (trendDim) {
    charts.push({
      id: 'chart-trend-3',
      title: `${trendDim.name} Trend & Fluctuations`,
      chartType: 'line',
      dimensionKey: trendDim.key,
      metricKey: primaryNum?.key,
      aggregation: primaryNum ? 'sum' : 'count',
      topN: 0, // Show complete timeline
      showTrendOverlay: true,
      trendPeriod: 3,
      colorPalette: 'red',
    });
  }

  // Chart 4: Leaderboard / Ranking (All Entities)
  const rankDim = entityCol || agentCol || categoricalCols.find(
    (c) => c.key !== barDim?.key && c.key !== lowCardCol?.key && c.key !== trendDim?.key
  );

  if (rankDim) {
    charts.push({
      id: 'chart-rank-4',
      title: `${rankDim.name} Performance`,
      chartType: 'metric_leaderboard',
      dimensionKey: rankDim.key,
      metricKey: primaryNum?.key,
      aggregation: primaryNum ? 'sum' : 'count',
      topN: 0, // Show all
      colorPalette: 'red',
    });
  }

  // Chart 5: Additional distribution or Area chart
  const secondaryDim = categoricalCols.find(
    (c) => !charts.some((ch) => ch.dimensionKey === c.key) && c.uniqueValues.length >= 2
  );

  if (secondaryDim) {
    charts.push({
      id: 'chart-area-5',
      title: `${secondaryDim.name} Volume Analysis`,
      chartType: 'bar',
      dimensionKey: secondaryDim.key,
      metricKey: numericCols.length > 1 ? numericCols[1].key : primaryNum?.key,
      aggregation: primaryNum ? 'sum' : 'count',
      topN: 0, // Show all
      colorPalette: 'corporate',
    });
  }

  return {
    kpis,
    charts,
    filterColumns,
  };
}

/**
 * Aggregates dataset rows for a given dynamic chart widget,
 * sorting and computing moving averages if trend overlay is enabled.
 */
export function aggregateChartData(
  widget: DynamicChartWidget,
  rows: DataRow[],
  allColumns: ColumnMeta[]
) {
  const { dimensionKey, metricKey, aggregation, topN = 10, showTrendOverlay, trendPeriod = 3 } = widget;
  const dimCol = allColumns.find((c) => c.key === dimensionKey);
  const isDateOrTime = 
    dimCol?.type === 'date' || 
    dimCol?.role === 'date' ||
    dimensionKey.toLowerCase().includes('date') || 
    dimensionKey.toLowerCase().includes('month') || 
    dimensionKey.toLowerCase().includes('year');

  // Group by dimension key
  const groups: Record<string, { count: number; sum: number; min: number; max: number }> = {};

  rows.forEach((row) => {
    let dimVal = String(row[dimensionKey] ?? '').trim();
    if (!dimVal) {
      dimVal = 'Unknown / N/A';
    } else if (isDateOrTime) {
      const parsedDate = formatDisplayDate(dimVal);
      if (parsedDate) dimVal = parsedDate;
    }

    if (!groups[dimVal]) {
      groups[dimVal] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
    }

    groups[dimVal].count += 1;

    if (metricKey) {
      const num = parseNumericValue(row[metricKey]);
      if (num !== null) {
        groups[dimVal].sum += num;
        if (num < groups[dimVal].min) groups[dimVal].min = num;
        if (num > groups[dimVal].max) groups[dimVal].max = num;
      }
    }
  });

  // Calculate final value per group
  let result = Object.entries(groups).map(([name, data]) => {
    let value = data.count;
    if (metricKey) {
      if (aggregation === 'sum') value = Math.round(data.sum * 100) / 100;
      else if (aggregation === 'avg') value = data.count > 0 ? Math.round((data.sum / data.count) * 100) / 100 : 0;
      else if (aggregation === 'min') value = data.min === Infinity ? 0 : data.min;
      else if (aggregation === 'max') value = data.max === -Infinity ? 0 : data.max;
    }

    return {
      name,
      value,
      count: data.count,
      formattedValue: formatSmartNumber(value),
    };
  });

  // Sort
  if (isDateOrTime) {
    // Chronological order for dates / timelines
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Value descending for rankings / categories
    result.sort((a, b) => b.value - a.value);
  }

  // Top N limit
  if (topN && topN > 0 && result.length > topN) {
    result = result.slice(0, topN);
  }

  // Trend Analysis: Calculate moving average overlay if enabled
  if (showTrendOverlay && result.length > 0) {
    const period = Math.max(2, trendPeriod || 3);
    result = result.map((item, idx, arr) => {
      const start = Math.max(0, idx - period + 1);
      const windowSlice = arr.slice(start, idx + 1);
      const avg = windowSlice.reduce((acc, curr) => acc + curr.value, 0) / windowSlice.length;
      return {
        ...item,
        movingAverage: Math.round(avg * 100) / 100,
      };
    });
  }

  return result;
}

/**
 * Calculates dynamic KPI value
 */
export function calculateKPIValue(
  kpi: DynamicKPIWidget,
  filteredRows: DataRow[],
  totalRowsCount: number
): { formatted: string; raw: number; subLabel?: string } {
  const { columnKey, aggregation, format } = kpi;

  if (aggregation === 'count' || !columnKey) {
    const count = filteredRows.length;
    const pct = totalRowsCount > 0 ? Math.round((count / totalRowsCount) * 100) : 100;
    return {
      raw: count,
      formatted: count.toLocaleString(),
      subLabel: `${pct}% of total records`,
    };
  }

  if (aggregation === 'unique_count') {
    const set = new Set<string>();
    filteredRows.forEach((r) => {
      const val = String(r[columnKey] ?? '').trim();
      if (val) set.add(val);
    });
    const uniqueCount = set.size;
    return {
      raw: uniqueCount,
      formatted: uniqueCount.toLocaleString(),
      subLabel: `Distinct entries in ${columnKey}`,
    };
  }

  // Numeric aggregations (Sum, Avg, Min, Max)
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;

  filteredRows.forEach((r) => {
    const num = parseNumericValue(r[columnKey]);
    if (num !== null) {
      sum += num;
      count += 1;
      if (num < min) min = num;
      if (num > max) max = num;
    }
  });

  let rawValue = 0;
  if (aggregation === 'sum') rawValue = sum;
  else if (aggregation === 'avg') rawValue = count > 0 ? sum / count : 0;
  else if (aggregation === 'min') rawValue = min === Infinity ? 0 : min;
  else if (aggregation === 'max') rawValue = max === -Infinity ? 0 : max;

  let formatted = '';
  if (format === 'currency') {
    formatted = formatCurrencyWithSuffix(rawValue);
  } else {
    formatted = formatSmartNumber(rawValue);
  }

  const subLabel = 
    aggregation === 'avg' 
      ? `Across ${count.toLocaleString()} valid rows`
      : aggregation === 'sum'
      ? `${columnKey} cumulative`
      : `${aggregation.toUpperCase()} value`;

  return {
    raw: rawValue,
    formatted,
    subLabel,
  };
}
