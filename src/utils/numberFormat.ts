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
