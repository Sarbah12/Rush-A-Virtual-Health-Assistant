import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Art, Button, Card, Screen, SectionLabel, T, Title } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke } from '@/constants/theme';
import { adherence, formatTime, isActive, localDate, todaysDoses, type TodayDose } from '@/lib/meds';
import { remindersSupported } from '@/lib/reminders';
import { useMeds } from '@/lib/use-meds';

const STATUS: Record<TodayDose['status'], { label: string; color: string }> = {
  taken: { label: 'Taken', color: Colors.ink },
  skipped: { label: 'Skipped', color: Colors.textMuted },
  due: { label: 'Due now', color: Colors.danger },
  missed: { label: 'Missed?', color: Colors.warning },
  upcoming: { label: 'Later', color: Colors.textMuted },
};

export default function Meds() {
  const { data, loaded, mark, unmark } = useMeds();
  // Re-render every minute so "due" / "missed" stay current.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const today = localDate(now);
  const doses = todaysDoses(data, now);
  const week = adherence(data, now, 7);
  const active = data.meds.filter((m) => isActive(m, today));
  const finished = data.meds.filter((m) => !isActive(m, today));

  return (
    <Screen back footer={<Button label="Add a medicine" icon="add" onPress={() => router.push('/med-edit')} />}>
      <Title subtitle={remindersSupported ? 'Rush reminds you when each dose is due, even offline.' : 'Reminders work in the phone app. In a browser you can still track doses.'}>
        Medicines
      </Title>

      {loaded && data.meds.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Art icon="alarm-outline" size={88} />
          <T variant="heading">No medicines yet</T>
          <T color={Colors.textMuted} style={{ textAlign: 'center' }}>
            Add what you take and when. You can mark each dose taken or skipped.
          </T>
        </Card>
      ) : null}

      {doses.length > 0 ? (
        <>
          <SectionLabel>Today</SectionLabel>
          {doses.map((d) => {
            const s = STATUS[d.status];
            const done = d.status === 'taken' || d.status === 'skipped';
            return (
              <View key={`${d.med.id}-${d.time}`} style={[styles.dose, d.status === 'due' && { borderColor: Colors.danger }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bodyBold">
                    {formatTime(d.time)} · {d.med.name}
                  </T>
                  <T variant="small" color={s.color}>
                    {[d.med.dose, s.label].filter(Boolean).join(' · ')}
                  </T>
                </View>
                {done ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Undo ${s.label.toLowerCase()} for ${d.med.name}`} onPress={() => unmark(d.med.id, today, d.time)} style={styles.small}>
                    <Ionicons name={d.status === 'taken' ? 'checkmark-circle' : 'close-circle-outline'} size={26} color={Colors.ink} />
                  </Pressable>
                ) : (
                  <View style={styles.actions}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Skip ${d.med.name}`} onPress={() => mark(d.med.id, today, d.time, 'skipped')} style={[styles.small, styles.outline]}>
                      <T variant="smallBold">Skip</T>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${d.med.name} taken`} onPress={() => mark(d.med.id, today, d.time, 'taken')} style={[styles.small, styles.take]}>
                      <T variant="smallBold" color={Colors.onPrimary}>
                        Take
                      </T>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </>
      ) : null}

      {week.scheduled > 0 ? (
        <Card tone="soft">
          <T variant="bodyBold">Last 7 days</T>
          <T>
            {week.taken} of {week.scheduled} doses marked taken ({Math.round((week.taken / week.scheduled) * 100)}%).
          </T>
        </Card>
      ) : null}

      {active.length > 0 ? <SectionLabel>Your medicines</SectionLabel> : null}
      {active.map((m) => (
        <MedRow key={m.id} id={m.id} name={m.name} detail={[m.dose, m.times.map(formatTime).join(', '), m.remind ? '' : 'no reminder'].filter(Boolean).join(' · ')} />
      ))}
      {finished.length > 0 ? <SectionLabel>Finished</SectionLabel> : null}
      {finished.map((m) => (
        <MedRow key={m.id} id={m.id} name={m.name} detail={`Ended ${m.endDate}`} />
      ))}

      <T variant="small" color={Colors.textMuted}>
        Never change or stop a medicine without talking to your doctor, nurse or pharmacist.
      </T>
    </Screen>
  );
}

function MedRow({ id, name, detail }: { id: string; name: string; detail: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit ${name}`}
      onPress={() => router.push({ pathname: '/med-edit', params: { id } })}
      style={({ pressed }) => [styles.dose, pressed && { backgroundColor: Colors.overlay }]}>
      <Ionicons name="medical-outline" size={20} color={Colors.ink} />
      <View style={{ flex: 1 }}>
        <T variant="bodyBold">{name}</T>
        <T variant="small" color={Colors.textMuted}>
          {detail}
        </T>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  small: { minHeight: 40, minWidth: MinTap, paddingHorizontal: Spacing.md, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: Stroke, borderColor: Colors.border },
  take: { backgroundColor: Colors.ink },
});
