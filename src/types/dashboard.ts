export type ColumnType = 'numeric' | 'categorical' | 'date' | 'text' | 'boolean';

export type ColumnRole = 
  | 'entity_name'     // e.g. Company Name, Customer, Product
  | 'industry'        // Industry, Sector
  | 'location_state'  // State, Province
  | 'location_city'   // City, District
  | 'status'          // Status, Stage, Lead Current Status
  | 'agent'           // RM, Manager, Employee, Owner
  | 'revenue'         // Turnover, Revenue, Amount, Sales
  | 'premium'         // Existing Premium, Premium, Sum Insured
  | 'count'           // Employees, Quantity, Units
  | 'date'            // Date, Created Date, Import Date, Lead Date
  | 'lob'             // LOB, Line of Business
  | 'policy_type'     // Policy Type
  | 'renewal_month'   // Renewal Month
  | 'lead_source'     // Lead Source
  | 'general';

export interface ColumnMeta {
  key: string;
  name: string;
  type: ColumnType;
  role: ColumnRole;
  uniqueValues: string[];
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  nullCount: number;
  totalCount: number;
}

export interface DataRow {
  __id: string;
  [key: string]: any;
}

export interface Dataset {
  fileName: string;
  sheetName: string;
  availableSheets?: string[];
  columns: ColumnMeta[];
  rows: DataRow[];
  totalRows: number;
  totalColumns: number;
  uploadedAt: string;
  isDemo?: boolean;
}

export interface FilterState {
  globalSearch: string;
  categorical: Record<string, string[]>; // columnKey -> selected values
  ranges: Record<string, { min: number; max: number }>; // columnKey -> {min, max}
  crossFilter?: {
    columnKey: string;
    value: string;
    sourceChartId?: string;
  } | null;
}

export type ChartType = 
  | 'bar' 
  | 'horizontal_bar' 
  | 'donut' 
  | 'pie' 
  | 'line' 
  | 'area' 
  | 'metric_leaderboard'
  | 'auto_map'
  | 'india_map'
  | 'world_map';

export type AggregationType = 
  | 'count' 
  | 'sum' 
  | 'avg' 
  | 'min' 
  | 'max' 
  | 'unique_count';

export interface DynamicChartWidget {
  id: string;
  title: string;
  chartType: ChartType;
  dimensionKey: string;      // X-axis or Group By (categorical, date, text, geo)
  metricKey?: string;        // Y-axis or value column (numeric, or count if omitted)
  aggregation: AggregationType; // 'count' | 'sum' | 'avg' | 'min' | 'max'
  topN?: number;             // Top 5, 8, 10, etc. (0 = All categories)
  showTrendOverlay?: boolean; // For line/area charts (moving average overlay)
  trendPeriod?: number;      // Moving average period (3, 5, 7)
  colorPalette?: 'red' | 'corporate' | 'emerald' | 'amber' | 'blue';
  geoScope?: 'india' | 'world' | 'district' | 'auto' | 'latlon';
  selectedState?: string;
  drilldownDistrict?: string;
  latColumnKey?: string;
  lonColumnKey?: string;
}

export interface DynamicKPIWidget {
  id: string;
  title: string;
  columnKey?: string;         // Column to aggregate (or undefined for Total Records)
  aggregation: AggregationType; // 'count' | 'sum' | 'avg' | 'unique_count'
  format?: 'currency' | 'number' | 'count';
}

export interface DashboardLayoutConfig {
  kpis: DynamicKPIWidget[];
  charts: DynamicChartWidget[];
  filterColumns: string[];    // column keys appearing in the Top Filter Bar
}

export interface KPIConfig {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  iconName: string;
  format?: 'currency' | 'number' | 'count';
  columnKey?: string;
}
