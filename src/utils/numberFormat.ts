/**
 * Number and currency formatting utilities
 */

export function parseNumericValue(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  
  if (typeof val === 'string') {
    let clean = val.trim();
    // Check for crore multiplier (e.g. "120 Cr", "₹ 50.5 Crores")
    const isCrore = /\b(cr|crore|crores)\b/i.test(clean);
    const isLakh = /\b(lakh|lakhs|lac|lacs)\b/i.test(clean);
    const isMillion = /\b(m|million|millions)\b/i.test(clean);
    const isBillion = /\b(b|billion|billions)\b/i.test(clean);
    const isKilo = /\b(k|thousand)\b/i.test(clean);

    // Remove currency symbols, commas, percent
    clean = clean.replace(/[₹$€£¥,%]/g, '').trim();
    // Match first valid float
    const match = clean.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (!match) return null;
    
    let num = parseFloat(match[0]);
    if (isNaN(num)) return null;

    if (isCrore && !val.toLowerCase().includes('cr')) {
      // already extracted
    }
    return num;
  }
  
  return null;
}

export function formatSmartNumber(num: number | null | undefined, isCurrency = false): string {
  if (num === null || num === undefined || isNaN(num)) return '—';

  const abs = Math.abs(num);
  const prefix = isCurrency ? '₹' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = num / 10000000;
    return `${prefix}${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
  } else if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lk = num / 100000;
    return `${prefix}${lk.toFixed(lk >= 10 ? 1 : 2)} L`;
  } else if (abs >= 1000) {
    return `${prefix}${num.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`;
  } else {
    return `${prefix}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function formatCurrencyWithSuffix(num: number | null | undefined): string {
  return formatSmartNumber(num, true);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateParts(day: number, monthIndex: number, year: number): string {
  const dd = String(day).padStart(2, '0');
  const mmm = MONTH_NAMES[monthIndex] || 'Jan';
  return `${dd} ${mmm} ${year}`;
}

/**
 * Converts Excel serial dates (e.g. 45577), Unix timestamps, Date objects,
 * or ISO date strings into clean formatted dates like "12 Oct 2024".
 */
export function formatDisplayDate(val: any): string | null {
  if (val === null || val === undefined || val === '') return null;

  // 1. If it's already a Date instance
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return formatDateParts(val.getUTCDate(), val.getUTCMonth(), val.getUTCFullYear());
    }
    return null;
  }

  // 2. Check if it's a number or purely numeric string (Excel serial date / Unix timestamp)
  const str = String(val).trim();
  const num = typeof val === 'number' ? val : (str !== '' && !isNaN(Number(str)) ? Number(str) : NaN);

  if (!isNaN(num) && /^\d+(\.\d+)?$/.test(str)) {
    // Excel serial dates: between 1000 (1902) and 85000 (2132)
    // Jan 1 1970 is day 25569 in Excel 1900 date system
    if (num >= 1000 && num <= 85000) {
      const dateMs = Math.round((num - 25569) * 86400 * 1000);
      const d = new Date(dateMs);
      if (!isNaN(d.getTime())) {
        return formatDateParts(d.getUTCDate(), d.getUTCMonth(), d.getUTCFullYear());
      }
    }

    // Unix timestamp in seconds (e.g. 1728691200)
    if (num > 1000000000 && num < 2500000000) {
      const d = new Date(num * 1000);
      if (!isNaN(d.getTime())) {
        return formatDateParts(d.getUTCDate(), d.getUTCMonth(), d.getUTCFullYear());
      }
    }

    // Unix timestamp in milliseconds (e.g. 1728691200000)
    if (num >= 2500000000 && num < 5000000000000) {
      const d = new Date(num);
      if (!isNaN(d.getTime())) {
        return formatDateParts(d.getUTCDate(), d.getUTCMonth(), d.getUTCFullYear());
      }
    }
  }

  // 3. If it's a date string (ISO, "YYYY-MM-DD", "DD/MM/YYYY", etc.)
  if (
    str.includes('T') ||
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str) ||
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(str)
  ) {
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      return formatDateParts(d.getDate(), d.getMonth(), d.getFullYear());
    }
  }

  // If already formatted like "12 Oct 2024" or "12-Oct-2024"
  if (/^\d{1,2}\s+[a-zA-Z]{3,}\s+\d{4}$/.test(str)) {
    return str;
  }

  return null;
}

