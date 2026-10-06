import { ColumnMeta, DataRow } from '../types/dashboard';

/**
 * Standard Canonical 36 States and Union Territories of India
 * matching udit-001/india-maps-data GeoJSON
 */
export const INDIAN_STATES_CANONICAL = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

/**
 * Comprehensive normalization dictionary for Indian states & UTs
 * Supports common abbreviations, prefixes, historical names, and spelling variations.
 */
const INDIAN_STATES_LOOKUP: Record<string, string> = {
  // Andaman and Nicobar
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'andaman & nicobar': 'Andaman and Nicobar Islands',
  'andaman': 'Andaman and Nicobar Islands',
  'nicobar': 'Andaman and Nicobar Islands',
  'a&n': 'Andaman and Nicobar Islands',
  'an': 'Andaman and Nicobar Islands',

  // Andhra Pradesh
  'andhra pradesh': 'Andhra Pradesh',
  'andhra': 'Andhra Pradesh',
  'ap': 'Andhra Pradesh',

  // Arunachal Pradesh
  'arunachal pradesh': 'Arunachal Pradesh',
  'arunachal': 'Arunachal Pradesh',
  'ar': 'Arunachal Pradesh',

  // Assam
  'assam': 'Assam',
  'as': 'Assam',

  // Bihar
  'bihar': 'Bihar',
  'br': 'Bihar',

  // Chandigarh
  'chandigarh': 'Chandigarh',
  'ch': 'Chandigarh',

  // Chhattisgarh
  'chhattisgarh': 'Chhattisgarh',
  'chhatisgarh': 'Chhattisgarh',
  'chattisgarh': 'Chhattisgarh',
  'cg': 'Chhattisgarh',
  'ct': 'Chhattisgarh',

  // Dadra and Nagar Haveli and Daman and Diu
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra & nagar haveli & daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dnh and dd': 'Dadra and Nagar Haveli and Daman and Diu',
  'dnh & dd': 'Dadra and Nagar Haveli and Daman and Diu',
  'dnh': 'Dadra and Nagar Haveli and Daman and Diu',
  'dd': 'Dadra and Nagar Haveli and Daman and Diu',

  // Delhi
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'nct of delhi': 'Delhi',
  'nct delhi': 'Delhi',
  'nct': 'Delhi',
  'dl': 'Delhi',

  // Goa
  'goa': 'Goa',
  'ga': 'Goa',

  // Gujarat
  'gujarat': 'Gujarat',
  'gujrat': 'Gujarat',
  'gj': 'Gujarat',

  // Haryana
  'haryana': 'Haryana',
  'hr': 'Haryana',

  // Himachal Pradesh
  'himachal pradesh': 'Himachal Pradesh',
  'himachal': 'Himachal Pradesh',
  'hp': 'Himachal Pradesh',

  // Jammu and Kashmir
  'jammu and kashmir': 'Jammu and Kashmir',
  'jammu & kashmir': 'Jammu and Kashmir',
  'jammu kashmir': 'Jammu and Kashmir',
  'j&k': 'Jammu and Kashmir',
  'jk': 'Jammu and Kashmir',

  // Jharkhand
  'jharkhand': 'Jharkhand',
  'jh': 'Jharkhand',

  // Karnataka
  'karnataka': 'Karnataka',
  'ka': 'Karnataka',

  // Kerala
  'kerala': 'Kerala',
  'kl': 'Kerala',

  // Ladakh
  'ladakh': 'Ladakh',
  'la': 'Ladakh',

  // Lakshadweep
  'lakshadweep': 'Lakshadweep',
  'ld': 'Lakshadweep',

  // Madhya Pradesh
  'madhya pradesh': 'Madhya Pradesh',
  'mp': 'Madhya Pradesh',

  // Maharashtra
  'maharashtra': 'Maharashtra',
  'mh': 'Maharashtra',

  // Manipur
  'manipur': 'Manipur',
  'mn': 'Manipur',

  // Meghalaya
  'meghalaya': 'Meghalaya',
  'ml': 'Meghalaya',

  // Mizoram
  'mizoram': 'Mizoram',
  'mz': 'Mizoram',

  // Nagaland
  'nagaland': 'Nagaland',
  'nl': 'Nagaland',

  // Odisha
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'or': 'Odisha',
  'od': 'Odisha',

  // Puducherry
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
  'py': 'Puducherry',

  // Punjab
  'punjab': 'Punjab',
  'pb': 'Punjab',

  // Rajasthan
  'rajasthan': 'Rajasthan',
  'raj': 'Rajasthan',
  'rj': 'Rajasthan',

  // Sikkim
  'sikkim': 'Sikkim',
  'sk': 'Sikkim',

  // Tamil Nadu
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'tn': 'Tamil Nadu',

  // Telangana
  'telangana': 'Telangana',
  'telengana': 'Telangana',
  'tg': 'Telangana',
  'ts': 'Telangana',

  // Tripura
  'tripura': 'Tripura',
  'tr': 'Tripura',

  // Uttar Pradesh
  'uttar pradesh': 'Uttar Pradesh',
  'up': 'Uttar Pradesh',

  // Uttarakhand
  'uttarakhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'uk': 'Uttarakhand',
  'ut': 'Uttarakhand',

  // West Bengal
  'west bengal': 'West Bengal',
  'bengal': 'West Bengal',
  'wb': 'West Bengal',
};

/**
 * Standard World Countries Lookup
 */
const WORLD_COUNTRIES_LOOKUP: Record<string, string> = {
  india: 'India',
  bharat: 'India',
  'united states': 'United States of America',
  'united states of america': 'United States of America',
  usa: 'United States of America',
  us: 'United States of America',
  'united kingdom': 'United Kingdom',
  uk: 'United Kingdom',
  britain: 'United Kingdom',
  'great britain': 'United Kingdom',
  'united arab emirates': 'United Arab Emirates',
  uae: 'United Arab Emirates',
  dubai: 'United Arab Emirates',
  canada: 'Canada',
  australia: 'Australia',
  germany: 'Germany',
  france: 'France',
  singapore: 'Singapore',
  china: 'China',
  japan: 'Japan',
  brazil: 'Brazil',
  russia: 'Russia',
  'saudi arabia': 'Saudi Arabia',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  oman: 'Oman',
  bahrain: 'Bahrain',
  malaysia: 'Malaysia',
  thailand: 'Thailand',
  indonesia: 'Indonesia',
  vietnam: 'Vietnam',
  'south africa': 'South Africa',
  italy: 'Italy',
  spain: 'Spain',
  netherlands: 'Netherlands',
  switzerland: 'Switzerland',
  sweden: 'Sweden',
  mexico: 'Mexico',
  argentina: 'Argentina',
  egypt: 'Egypt',
  nigeria: 'Nigeria',
  kenya: 'Kenya',
  philippines: 'Philippines',
  'south korea': 'South Korea',
  korea: 'South Korea',
};

/**
 * Geographic detection result
 */
export interface GeoDetectionResult {
  hasGeographicData: boolean;
  geoScope: 'india' | 'world' | 'latlon';
  geoColumnKey: string;
  geoColumnName: string;
  stateColumnKey?: string;
  countryColumnKey?: string;
  cityColumnKey?: string;
  latColumnKey?: string;
  lonColumnKey?: string;
  matchedStateCount: number;
  matchedCountryCount: number;
}

/**
 * Normalizes input string to canonical Indian State/UT name.
 * Does not modify original Excel data, only used for map feature matching.
 */
export function normalizeStateName(rawInput: any): string | null {
  if (rawInput === null || rawInput === undefined) return null;
  const str = String(rawInput).trim().toLowerCase();
  if (!str) return null;

  // Direct lookup
  if (INDIAN_STATES_LOOKUP[str]) {
    return INDIAN_STATES_LOOKUP[str];
  }

  // Remove common punctuation or prefixes like "State of", "UT of"
  const clean = str
    .replace(/\bstate\s+of\b/g, '')
    .replace(/\but\s+of\b/g, '')
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (INDIAN_STATES_LOOKUP[clean]) {
    return INDIAN_STATES_LOOKUP[clean];
  }

  // Check fuzzy / partial prefix match
  for (const [key, canonical] of Object.entries(INDIAN_STATES_LOOKUP)) {
    if (key.length > 3 && (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key))) {
      return canonical;
    }
  }

  return null;
}

/**
 * Normalizes input string to canonical Country name.
 */
export function normalizeCountryName(rawInput: any): string | null {
  if (rawInput === null || rawInput === undefined) return null;
  const str = String(rawInput).trim().toLowerCase();
  if (!str) return null;

  if (WORLD_COUNTRIES_LOOKUP[str]) {
    return WORLD_COUNTRIES_LOOKUP[str];
  }

  const clean = str.replace(/[.,\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (WORLD_COUNTRIES_LOOKUP[clean]) {
    return WORLD_COUNTRIES_LOOKUP[clean];
  }

  return null;
}

/**
 * Extracts standard region/state/country name from GeoJSON feature properties.
 * Inspects `st_nm`, `ST_NM`, `state_name`, `name`, `NAME`, `ADMIN`, etc.
 */
export function getRegionName(feature: any): string {
  if (!feature || !feature.properties) return '';
  const p = feature.properties;
  return (
    p.st_nm ||
    p.ST_NM ||
    p.state_name ||
    p.NAME_1 ||
    p.name ||
    p.NAME ||
    p.ADMIN ||
    p.admin ||
    p.district ||
    p.DISTRICT ||
    ''
  );
}

/**
 * Extracts district name from GeoJSON feature properties.
 */
export function getDistrictName(feature: any): string {
  if (!feature || !feature.properties) return '';
  const p = feature.properties;
  return p.district || p.DISTRICT || p.dt_name || '';
}

/**
 * Validates actual column values in rows before determining if a column is geographic.
 * Prevents false positives like State = "Open", "Pending", "Closed".
 */
export function validateColumnAsIndianState(columnKey: string, rows: DataRow[]): { isValid: boolean; matchCount: number } {
  if (!rows || rows.length === 0) return { isValid: false, matchCount: 0 };
  
  let validMatches = 0;
  let nonNullCount = 0;

  for (const row of rows.slice(0, 150)) {
    const val = row[columnKey];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      nonNullCount++;
      const normalized = normalizeStateName(val);
      if (normalized) {
        validMatches++;
      }
    }
  }

  // Must match at least 2 distinct Indian states or >= 35% of non-null rows
  const ratio = nonNullCount > 0 ? validMatches / nonNullCount : 0;
  const isValid = validMatches >= 2 && ratio >= 0.35;
  return { isValid, matchCount: validMatches };
}

/**
 * Validates actual column values in rows for country names.
 */
export function validateColumnAsCountry(columnKey: string, rows: DataRow[]): { isValid: boolean; matchCount: number; isMultiCountry: boolean } {
  if (!rows || rows.length === 0) return { isValid: false, matchCount: 0, isMultiCountry: false };

  let validMatches = 0;
  let nonNullCount = 0;
  const countries = new Set<string>();

  for (const row of rows.slice(0, 150)) {
    const val = row[columnKey];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      nonNullCount++;
      const normalized = normalizeCountryName(val);
      if (normalized) {
        validMatches++;
        countries.add(normalized);
      }
    }
  }

  const ratio = nonNullCount > 0 ? validMatches / nonNullCount : 0;
  const isValid = validMatches >= 2 && ratio >= 0.35;
  const isMultiCountry = countries.size >= 2;
  return { isValid, matchCount: validMatches, isMultiCountry };
}

/**
 * Analyzes dataset columns and data rows to detect geographic context.
 * Implements Rule 2 & 3:
 * - Checks header names AND validates actual field values.
 * - If no usable geographic data exists: hasGeographicData = false.
 */
export function detectGeographicColumns(
  columns: ColumnMeta[],
  rows: DataRow[]
): GeoDetectionResult {
  const defaultNoGeo: GeoDetectionResult = {
    hasGeographicData: false,
    geoScope: 'india',
    geoColumnKey: '',
    geoColumnName: '',
    matchedStateCount: 0,
    matchedCountryCount: 0,
  };

  if (!columns.length || !rows.length) return defaultNoGeo;

  // 1. Check for Country column
  let detectedCountryCol: ColumnMeta | undefined;
  let isMultiCountry = false;

  for (const col of columns) {
    const lower = col.name.toLowerCase().trim();
    if (
      lower === 'country' ||
      lower === 'country name' ||
      lower === 'nation' ||
      lower.includes('country')
    ) {
      const { isValid, matchCount, isMultiCountry: multi } = validateColumnAsCountry(col.key, rows);
      if (isValid) {
        detectedCountryCol = col;
        isMultiCountry = multi;
        break;
      }
    }
  }

  // 2. Check for State column
  let detectedStateCol: ColumnMeta | undefined;
  let maxStateMatches = 0;

  for (const col of columns) {
    const lower = col.name.toLowerCase().trim();
    if (
      lower === 'state' ||
      lower === 'state name' ||
      lower === 'province' ||
      lower === 'region' ||
      lower.includes('state') ||
      lower.includes('province') ||
      col.role === 'location_state'
    ) {
      const { isValid, matchCount } = validateColumnAsIndianState(col.key, rows);
      if (isValid && matchCount > maxStateMatches) {
        detectedStateCol = col;
        maxStateMatches = matchCount;
      }
    }
  }

  // 3. Check for Latitude & Longitude columns
  const latCol = columns.find((c) => {
    const l = c.name.toLowerCase().trim();
    return (l === 'lat' || l === 'latitude' || l.includes('lat')) && c.type === 'numeric';
  });
  const lonCol = columns.find((c) => {
    const l = c.name.toLowerCase().trim();
    return (l === 'lon' || l === 'lng' || l === 'longitude' || l.includes('long')) && c.type === 'numeric';
  });

  const hasLatLon = !!(latCol && lonCol);

  // 4. Check for City column
  const cityCol = columns.find((c) => {
    const l = c.name.toLowerCase().trim();
    return l === 'city' || l === 'city name' || l === 'district' || c.role === 'location_city';
  });

  // Decision Logic:
  // Case B: Global Data (multi-country)
  if (detectedCountryCol && isMultiCountry) {
    return {
      hasGeographicData: true,
      geoScope: 'world',
      geoColumnKey: detectedCountryCol.key,
      geoColumnName: detectedCountryCol.name,
      countryColumnKey: detectedCountryCol.key,
      stateColumnKey: detectedStateCol?.key,
      cityColumnKey: cityCol?.key,
      matchedStateCount: maxStateMatches,
      matchedCountryCount: 2,
    };
  }

  // Case A: India Data
  if (detectedStateCol) {
    return {
      hasGeographicData: true,
      geoScope: 'india',
      geoColumnKey: detectedStateCol.key,
      geoColumnName: detectedStateCol.name,
      stateColumnKey: detectedStateCol.key,
      countryColumnKey: detectedCountryCol?.key,
      cityColumnKey: cityCol?.key,
      matchedStateCount: maxStateMatches,
      matchedCountryCount: detectedCountryCol ? 1 : 0,
    };
  }

  // Case C: Lat + Lon
  if (hasLatLon && latCol && lonCol) {
    return {
      hasGeographicData: true,
      geoScope: 'latlon',
      geoColumnKey: latCol.key,
      geoColumnName: 'Coordinates',
      latColumnKey: latCol.key,
      lonColumnKey: lonCol.key,
      matchedStateCount: 0,
      matchedCountryCount: 0,
    };
  }

  // Case D: Single Country (India) with City
  if (cityCol && detectedCountryCol) {
    return {
      hasGeographicData: true,
      geoScope: 'india',
      geoColumnKey: cityCol.key,
      geoColumnName: cityCol.name,
      cityColumnKey: cityCol.key,
      countryColumnKey: detectedCountryCol.key,
      matchedStateCount: 0,
      matchedCountryCount: 1,
    };
  }

  // No usable geographic data found -> completely hide Map
  return defaultNoGeo;
}
