import { EMPTY_MEDS, parseMeds, recordDose, undoDose, type DoseStatus, type Medicine, type MedsData } from './meds';
import { syncReminders } from './reminders';
import { newId, usePersisted } from './store';

export const MEDS_KEY = 'rush.meds';

export function useMeds() {
  const { value: data, loaded, save } = usePersisted<MedsData>(MEDS_KEY, parseMeds, EMPTY_MEDS);

  async function saveMeds(next: (prev: MedsData) => MedsData) {
    let result: MedsData = data;
    await save((prev) => (result = next(prev)));
    // Reminders failing (e.g. permission denied) must never block saving.
    syncReminders(result.meds).catch(() => {});
  }

  return {
    data,
    loaded,
    upsert: (med: Omit<Medicine, 'id' | 'createdAt'>, id?: string) =>
      saveMeds((prev) => {
        if (id && prev.meds.some((m) => m.id === id)) {
          return { ...prev, meds: prev.meds.map((m) => (m.id === id ? { ...m, ...med } : m)) };
        }
        return { ...prev, meds: [...prev.meds, { ...med, id: newId(), createdAt: new Date().toISOString() }] };
      }),
    remove: (id: string) =>
      saveMeds((prev) => ({ meds: prev.meds.filter((m) => m.id !== id), doses: prev.doses.filter((d) => d.medId !== id) })),
    mark: (medId: string, date: string, time: string, status: DoseStatus) =>
      save((prev) => recordDose(prev, medId, date, time, status, new Date())),
    unmark: (medId: string, date: string, time: string) => save((prev) => undoDose(prev, medId, date, time)),
  };
}
