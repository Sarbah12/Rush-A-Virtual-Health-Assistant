import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

// Small persisted collections (health log, medicines, chat). Everything is
// stored on this phone under a "rush." key so "Delete all my data" finds it.

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

export async function readJson<T>(key: string, parse: (raw: unknown) => T, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notify(key);
}

/** Notifies every open screen that a key was wiped (used by delete-all). */
export function notifyAll() {
  listeners.forEach((set) => set.forEach((l) => l()));
}

/**
 * A persisted value shared by every screen that uses the same key. `parse`
 * must turn untrusted stored JSON into a valid value and never throw.
 */
export function usePersisted<T>(key: string, parse: (raw: unknown) => T, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const latest = useRef(value);
  latest.current = value;
  const parseRef = useRef(parse);
  parseRef.current = parse;
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    let alive = true;
    const load = () =>
      readJson(key, parseRef.current, fallbackRef.current).then((v) => {
        if (alive) {
          setValue(v);
          setLoaded(true);
        }
      });
    load();
    const set = listeners.get(key) ?? new Set();
    set.add(load);
    listeners.set(key, set);
    return () => {
      alive = false;
      set.delete(load);
    };
  }, [key]);

  const save = useCallback(
    async (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(latest.current) : next;
      latest.current = resolved;
      setValue(resolved);
      await writeJson(key, resolved);
    },
    [key],
  );

  return { value, loaded, save };
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
