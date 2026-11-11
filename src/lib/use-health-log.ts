import { parseEntries, sortNewestFirst, type Entry } from './health-log';
import { newId, usePersisted } from './store';

export const HEALTH_LOG_KEY = 'rush.healthLog';
const EMPTY: Entry[] = [];

export function useHealthLog() {
  const { value: entries, loaded, save } = usePersisted(HEALTH_LOG_KEY, parseEntries, EMPTY);
  return {
    entries,
    loaded,
    add: (entry: Omit<Entry, 'id'>) => save((prev) => sortNewestFirst([{ ...entry, id: newId() }, ...prev])),
    remove: (id: string) => save((prev) => prev.filter((e) => e.id !== id)),
  };
}
