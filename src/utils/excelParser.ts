import * as XLSX from 'xlsx';
import { ColumnMeta, ColumnRole, ColumnType, DataRow, Dataset, DynamicChartWidget, DynamicKPIWidget } from '../types/dashboard';
import { parseNumericValue, formatDisplayDate } from './numberFormat';

export function isDateColumnHeader(header: string): boolean {
  const l = header.toLowerCase().trim();
  return (
    l.includes('date') ||
    l.includes('time') ||
    l.includes('dob') ||
    l.includes('valid upto') ||
    l.includes('valid to') ||
    l.includes('expiry') ||
    l.includes('timestamp') ||
    l.includes('created_at') ||
    l.includes('updated_at')
  );
}

export function isSerialNumberHeader(header: string): boolean {
  const l = header.toLowerCase().trim();
  return (
    l === 'sl. no.' ||
    l === 'sl. no' ||
    l === 'sl no' ||
    l === 's.no' ||
    l === 's.no.' ||
    l === 'sr no' ||
    l === 'sr. no' ||
    l === 'sr. no.' ||
    l === 'sno' ||
    l === 'serial' ||
    l === 'serial no' ||
    l === 'serial number' ||
    l === 'id' ||
    l === 'row id' ||
    l === 'row_id' ||
    l === 'index' ||
    l === 'seq' ||
    l === 'sequence' ||
    l.startsWith('sl.') ||
    l.startsWith('sl ') ||
    l.startsWith('sr.') ||
    l.startsWith('sr ') ||
    l.includes('serial number') ||
    l.includes('serial no')
  );
}

export async function parseExcelFile(
  file: File,
  targetSheetName?: string
): Promise<{ dataset: Dataset; allSheetNames: string[]; workbook: XLSX.WorkBook }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const allSheetNames = workbook.SheetNames;
  if (!allSheetNames.length) {
    throw new Error('The uploaded Excel workbook contains no sheets.');
  }

  const sheetToUse = targetSheetName && allSheetNames.includes(targetSheetName)
    ? targetSheetName
    : allSheetNames[0];

  const dataset = parseWorkbookSheet(workbook, file.name, sheetToUse);

  return { dataset, allSheetNames, workbook };
}

export function parseWorkbookSheet(
  workbook: XLSX.WorkBook,
  fileName: string,
  sheetName: string
): Dataset {
  const allSheetNames = workbook.SheetNames;
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" could not be found in the workbook.`);
  }

  // Convert to array of objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    blankrows: false,
    raw: false,
  });

  if (!rawRows.length) {
    throw new Error(`Sheet "${sheetName}" is empty or contains no data rows.`);
  }

  // Detect column headers
  const sampleHeaders = Object.keys(rawRows[0] || {});
  if (!sampleHeaders.length) {
    throw new Error(`Could not identify any column headers in sheet "${sheetName}".`);
  }

  // Build clean rows with unique __id, and normalize any date columns/serial numbers
  const rows: DataRow[] = rawRows.map((r, idx) => {
    const cleanRow: DataRow = { __id: `row-${idx + 1}` };
    sampleHeaders.forEach((header) => {
      const rawVal = r[header] !== undefined ? r[header] : '';
      if (isDateColumnHeader(header) && rawVal !== '') {
        const formatted = formatDisplayDate(rawVal);
        cleanRow[header] = formatted || rawVal;
      } else {
        cleanRow[header] = rawVal;
      }
    });
    return cleanRow;
  });

  // Analyze each column
  const columns: ColumnMeta[] = sampleHeaders.map((header) => {
    return analyzeColumn(header, rows);
  });

  return {
    fileName,
    sheetName,
    availableSheets: allSheetNames,
    columns,
    rows,
    totalRows: rows.length,
    totalColumns: columns.length,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDemo: false,
  };
}

function analyzeColumn(header: string, rows: DataRow[]): ColumnMeta {
  const lowerHeader = header.toLowerCase().trim();
  const totalCount = rows.length;
  let nonNullCount = 0;
  let numericParsableCount = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  const uniqueSet = new Set<string>();

  const isDateCol = isDateColumnHeader(header);
  const isSerialCol = isSerialNumberHeader(header);

  for (const row of rows) {
    const val = row[header];
    if (val !== null && val !== undefined && val !== '') {
      nonNullCount++;
      const strVal = String(val).trim();
      uniqueSet.add(strVal);

      // Only calculate sum/min/max if NOT a date column and NOT a serial number
      if (!isDateCol && !isSerialCol) {
        const num = parseNumericValue(val);
        if (num !== null) {
          numericParsableCount++;
          sum += num;
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }
    }
  }

  const nullCount = totalCount - nonNullCount;
  const isMostlyNumeric = !isDateCol && !isSerialCol && nonNullCount > 0 && numericParsableCount / nonNullCount >= 0.65;
  const uniqueCount = uniqueSet.size;

  let type: ColumnType = 'text';
  if (isDateCol) {
    type = 'date';
  } else if (isMostlyNumeric) {
    type = 'numeric';
  } else if (
    lowerHeader.includes('year') ||
    lowerHeader.includes('month')
  ) {
    type = 'categorical';
  } else if (uniqueCount <= 120 || (nonNullCount > 0 && uniqueCount / nonNullCount <= 0.45)) {
    type = 'categorical';
  }

  const role = detectColumnRole(lowerHeader, type);

  return {
    key: header,
    name: header,
    type,
    role,
    uniqueValues: Array.from(uniqueSet).slice(0, 300),
    min: min === Infinity ? undefined : min,
    max: max === -Infinity ? undefined : max,
    avg: numericParsableCount > 0 ? sum / numericParsableCount : undefined,
    sum: numericParsableCount > 0 ? sum : undefined,
    nullCount,
    totalCount,
  };
}

function detectColumnRole(lowerHeader: string, type: ColumnType): ColumnRole {
  // Insurance Existing Premium
  if (lowerHeader.includes('premium')) {
    return 'premium';
  }

  // Insurance LOB
  if (lowerHeader === 'lob' || lowerHeader.includes('line of business') || lowerHeader.includes('lob ')) {
    return 'lob';
  }

  // Insurance Policy Type
  if (lowerHeader.includes('policy type') || lowerHeader.includes('policy_type')) {
    return 'policy_type';
  }

  // Insurance Renewal Month
  if (lowerHeader.includes('renewal month') || lowerHeader.includes('renewal')) {
    return 'renewal_month';
  }

  // Lead Source
  if (lowerHeader.includes('lead source') || lowerHeader.includes('source')) {
    return 'lead_source';
  }

  // Financial / Turnover
  if (
    lowerHeader.includes('turnover') ||
    lowerHeader.includes('revenue') ||
    lowerHeader.includes('sales') ||
    lowerHeader.includes('amount') ||
    lowerHeader.includes('cost') ||
    lowerHeader.includes('val') ||
    lowerHeader.includes('price') ||
    lowerHeader.includes('budget') ||
    lowerHeader.includes('cr') ||
    lowerHeader.includes('lakh')
  ) {
    return 'revenue';
  }

  // Count / Employees
  if (
    lowerHeader.includes('employee') ||
    lowerHeader.includes('headcount') ||
    lowerHeader.includes('workforce') ||
    lowerHeader.includes('staff') ||
    lowerHeader.includes('count') ||
    lowerHeader.includes('quantity') ||
    lowerHeader.includes('qty') ||
    lowerHeader.includes('volume')
  ) {
    return 'count';
  }

  // Entity / Company Name
  if (
    lowerHeader.includes('company') ||
    lowerHeader.includes('firm') ||
    lowerHeader.includes('client') ||
    lowerHeader.includes('customer') ||
    lowerHeader.includes('org') ||
    lowerHeader.includes('account') ||
    (lowerHeader.includes('name') && !lowerHeader.includes('rm') && !lowerHeader.includes('manager'))
  ) {
    return 'entity_name';
  }

  // Industry / Sector
  if (
    lowerHeader.includes('industry') ||
    lowerHeader.includes('sector') ||
    lowerHeader.includes('vertical') ||
    lowerHeader.includes('domain') ||
    lowerHeader.includes('category')
  ) {
    return 'industry';
  }

  // State
  if (lowerHeader.includes('state') || lowerHeader.includes('province') || lowerHeader.includes('region')) {
    return 'location_state';
  }

  // City
  if (lowerHeader.includes('city') || lowerHeader.includes('district') || lowerHeader.includes('town')) {
    return 'location_city';
  }

  // Status
  if (
    lowerHeader.includes('status') ||
    lowerHeader.includes('stage') ||
    lowerHeader.includes('lead') ||
    lowerHeader.includes('quote')
  ) {
    return 'status';
  }

  // Agent / RM / Manager
  if (
    lowerHeader.includes('rm') ||
    lowerHeader.includes('manager') ||
    lowerHeader.includes('executive') ||
    lowerHeader.includes('director') ||
    lowerHeader.includes('owner') ||
    lowerHeader.includes('person') ||
    lowerHeader.includes('rep')
  ) {
    return 'agent';
  }

  if (type === 'date') {
    return 'date';
  }

  return 'general';
}

export function syncVisualizationsToWorkbook(
  workbook: XLSX.WorkBook,
  charts: DynamicChartWidget[],
  kpis: DynamicKPIWidget[] = []
): XLSX.WorkBook {
  try {
    const vizData = charts.map((c, idx) => ({
      'Seq #': idx + 1,
      'Chart Title': c.title,
      'Visualization Type': c.chartType.toUpperCase().replace('_', ' '),
      'Dimension (X-Axis)': c.dimensionKey,
      'Metric (Y-Axis)': c.metricKey || '(Count of Records)',
      'Aggregation': c.aggregation.toUpperCase(),
      'Color Palette': c.colorPalette || 'red',
      'Scope / Details': c.geoScope ? `Geo (${c.geoScope})` : 'Standard View',
      'Last Modified': new Date().toLocaleString(),
    }));

    // Also include KPI summaries if present
    if (kpis && kpis.length > 0) {
      kpis.forEach((k, idx) => {
        vizData.push({
          'Seq #': charts.length + idx + 1,
          'Chart Title': `[KPI] ${k.title}`,
          'Visualization Type': 'KPI STAT CARD',
          'Dimension (X-Axis)': 'Total Dataset',
          'Metric (Y-Axis)': k.columnKey || 'Record Count',
          'Aggregation': k.aggregation.toUpperCase(),
          'Color Palette': 'amber',
          'Scope / Details': k.format ? `Format: ${k.format}` : 'Standard Number',
          'Last Modified': new Date().toLocaleString(),
        });
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(vizData);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 32 },
      { wch: 22 },
      { wch: 26 },
      { wch: 26 },
      { wch: 16 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
    ];

    const sheetName = 'Dashboard_Visualizations';
    workbook.Sheets[sheetName] = worksheet;
    if (!workbook.SheetNames.includes(sheetName)) {
      workbook.SheetNames.push(sheetName);
    }
  } catch (err) {
    console.warn('Could not sync visualizations sheet into workbook:', err);
  }
  return workbook;
}

export function downloadUpdatedWorkbook(
  workbook: XLSX.WorkBook,
  baseFileName = 'bharat1_workbook'
) {
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, '');
  const outName = `${cleanBase}_updated_visualizations_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, outName);
}

export function exportFilteredToExcel(
  rows: DataRow[],
  columns: ColumnMeta[],
  baseFileName = 'epoch_filtered_export'
) {
  // Exclude internal __id
  const exportData = rows.map((r) => {
    const item: Record<string, any> = {};
    columns.forEach((col) => {
      item[col.name] = r[col.key] ?? '';
    });
    return item;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-fit column widths
  const colWidths = columns.map((col) => {
    let maxLen = col.name.length;
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const val = String(rows[i][col.key] || '');
      if (val.length > maxLen) maxLen = val.length;
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');

  const cleanBase = baseFileName.replace(/\.[^/.]+$/, '');
  const outName = `${cleanBase}_filtered_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, outName);
}
