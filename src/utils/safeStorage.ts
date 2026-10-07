/**
 * Safe Browser Storage Utility
 * Prevents SecurityError exceptions in incognito mode, privacy browsing,
 * or when third-party cookies/storage are blocked.
 */

class SafeStorage {
  private memoryFallback = new Map<string, string>();

  public getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In incognito or restricted mode, fall back to in-memory storage
    }
    return this.memoryFallback.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In incognito or storage full, store in memory
    }
    this.memoryFallback.set(key, value);
  }

  public removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    this.memoryFallback.delete(key);
  }

  public clear(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch {}
    this.memoryFallback.clear();
  }
}

export const safeStorage = new SafeStorage();
