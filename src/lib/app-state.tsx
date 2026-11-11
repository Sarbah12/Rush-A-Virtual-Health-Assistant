import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { cleanMedicalId, emptyMedicalId, parseMedicalId, type MedicalId } from './medical-id';
import { syncReminders } from './reminders';
import { notifyAll } from './store';

// Everything here lives only on this phone. Nothing is sent anywhere.
const KEYS = {
  consent: 'rush.consentVersion',
  onboarded: 'rush.onboarded',
  medicalId: 'rush.medicalId',
} as const;

/** Bump when the consent text changes in a way users must re-accept. */
export const CONSENT_VERSION = '1';

type AppState = {
  ready: boolean;
  consented: boolean;
  onboarded: boolean;
  medicalId: MedicalId;
  acceptConsent: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  saveMedicalId: (id: MedicalId) => Promise<void>;
  /** Wipes every Rush record from this phone and returns to onboarding. */
  deleteAllData: () => Promise<void>;
};

const AppStateContext = createContext<AppState | null>(null);

async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consented, setConsented] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [medicalId, setMedicalId] = useState<MedicalId>(emptyMedicalId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [consent, done, storedId] = await Promise.all([
        read(KEYS.consent),
        read(KEYS.onboarded),
        read(KEYS.medicalId),
      ]);
      if (cancelled) return;
      const hasConsent = consent === CONSENT_VERSION;
      setConsented(hasConsent);
      // A new consent version sends people back through the consent step.
      setOnboarded(done === '1' && hasConsent);
      if (storedId) setMedicalId(parseMedicalId(storedId));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const acceptConsent = useCallback(async () => {
    await AsyncStorage.setItem(KEYS.consent, CONSENT_VERSION);
    setConsented(true);
  }, []);

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(KEYS.onboarded, '1');
    setOnboarded(true);
  }, []);

  const saveMedicalId = useCallback(async (id: MedicalId) => {
    const clean = cleanMedicalId(id);
    await AsyncStorage.setItem(KEYS.medicalId, JSON.stringify(clean));
    setMedicalId(clean);
  }, []);

  const deleteAllData = useCallback(async () => {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('rush.'));
    await AsyncStorage.multiRemove(keys);
    await syncReminders([]).catch(() => {});
    notifyAll();
    setMedicalId(emptyMedicalId());
    setConsented(false);
    setOnboarded(false);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      consented,
      onboarded,
      medicalId,
      acceptConsent,
      finishOnboarding,
      saveMedicalId,
      deleteAllData,
    }),
    [ready, consented, onboarded, medicalId, acceptConsent, finishOnboarding, saveMedicalId, deleteAllData],
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState(): AppState {
  const ctx = use(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
