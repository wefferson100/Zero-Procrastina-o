import { DayEntry, PlannedTask } from './types';

const STORAGE_PREFIX = 'w1_entry:';
const LEGACY_PREFIX = 'entry:';

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function fmtKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function emptyEntry(dateKey: string, plan: PlannedTask[] = []): DayEntry {
  return {
    date: dateKey,
    dayNotes: '',
    plan,
    review: plan.map((p) => ({
      id: p.id,
      status: null,
      excuse: '',
      excuseOther: '',
      focusShift: '',
      rating: 0,
      comment: '',
      consequenceShort: '',
      consequenceMedium: '',
      consequenceLong: '',
    })),
    nextPlan: [],
    closed: false,
  };
}

export function getEntry(dateKey: string): DayEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + dateKey) || localStorage.getItem(LEGACY_PREFIX + dateKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error(`Error loading entry for ${dateKey}:`, err);
    return null;
  }
}

export function saveEntry(entry: DayEntry): void {
  try {
    const key = STORAGE_PREFIX + entry.date;
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error(`Error saving entry for ${entry.date}:`, err);
  }
}

export function deleteEntry(dateKey: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + dateKey);
    localStorage.removeItem(LEGACY_PREFIX + dateKey);
  } catch (err) {
    console.error(`Error deleting entry for ${dateKey}:`, err);
  }
}

export function getAllEntries(): Record<string, DayEntry> {
  const result: Record<string, DayEntry> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith(LEGACY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const entry = JSON.parse(raw) as DayEntry;
            if (entry && entry.date) {
              result[entry.date] = entry;
            }
          } catch {
            // ignore malformed
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching all entries:', err);
  }
  return result;
}

export function exportAllData(): string {
  const entries = getAllEntries();
  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    entries,
  }, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    const entries = parsed.entries || parsed;
    if (typeof entries === 'object' && entries !== null) {
      Object.keys(entries).forEach((k) => {
        const entry = entries[k];
        if (entry && entry.date) {
          saveEntry(entry);
        }
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error importing data:', err);
    return false;
  }
}
