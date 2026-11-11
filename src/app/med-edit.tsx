import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Field, Screen, T, Title } from '@/components/ui';
import { switchWebThumb } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke } from '@/constants/theme';
import { formatTime, normalizeTime, TIME_PRESETS, validateMed } from '@/lib/meds';
import { remindersSupported } from '@/lib/reminders';
import { useMeds } from '@/lib/use-meds';

export default function MedEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, upsert, remove } = useMeds();
  const existing = data.meds.find((m) => m.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [dose, setDose] = useState(existing?.dose ?? '');
  const [times, setTimes] = useState<string[]>(existing?.times ?? ['08:00']);
  const [newTime, setNewTime] = useState('');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [remind, setRemind] = useState(existing?.remind ?? true);
  const [endDate, setEndDate] = useState(existing?.endDate ?? '');
  const [error, setError] = useState<string | null>(null);

  function addTime() {
    const t = normalizeTime(newTime);
    if (!t) {
      setError('Use 24-hour time like 08:00 or 20:30.');
      return;
    }
    setError(null);
    setTimes((prev) => [...new Set([...prev, t])].sort());
    setNewTime('');
  }

  async function save() {
    const r = validateMed({ name, dose, times, notes, remind, endDate });
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    await upsert(r.med, existing?.id);
    router.canGoBack() ? router.back() : router.replace('/meds');
  }

  function confirmDelete() {
    if (!existing) return;
    const msg = `Remove ${existing.name} and its reminders?`;
    const go = async () => {
      await remove(existing.id);
      router.canGoBack() ? router.back() : router.replace('/meds');
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(msg)) go();
      return;
    }
    Alert.alert('Remove medicine?', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: go },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen back edges={['top', 'bottom']} footer={<Button label="Save" icon="checkmark" onPress={save} />}>
        <Title>{existing ? 'Edit medicine' : 'Add a medicine'}</Title>
        <Field label="Medicine name" placeholder="e.g. Amlodipine" value={name} onChangeText={setName} />
        <Field label="Dose (optional)" placeholder="e.g. 5mg, 1 tablet" value={dose} onChangeText={setDose} />

        <Card>
          <T variant="bodyBold">When do you take it?</T>
          <View style={styles.wrap}>
            {Object.entries(TIME_PRESETS).map(([label, preset]) => (
              <Pressable key={label} accessibilityRole="button" onPress={() => setTimes(preset)} style={styles.preset}>
                <T variant="smallBold">{label}</T>
              </Pressable>
            ))}
          </View>
          <View style={styles.wrap}>
            {times.map((t) => (
              <View key={t} style={styles.time}>
                <T variant="smallBold" color={Colors.onPrimary}>
                  {formatTime(t)}
                </T>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${formatTime(t)}`} hitSlop={10} onPress={() => setTimes((prev) => prev.filter((x) => x !== t))}>
                  <Ionicons name="close" size={16} color={Colors.onPrimary} />
                </Pressable>
              </View>
            ))}
          </View>
          <View style={styles.addRow}>
            <View style={{ flex: 1 }}>
              <Field label="Add a time" hideLabel placeholder="Add a time, e.g. 14:00" value={newTime} onChangeText={setNewTime} onSubmitEditing={addTime} />
            </View>
            <Button label="Add" kind="secondary" onPress={addTime} />
          </View>
        </Card>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <T variant="bodyBold">Remind me</T>
            <T variant="small" color={Colors.textMuted}>
              {remindersSupported ? 'A notification at each time.' : 'Reminders work in the phone app.'}
            </T>
          </View>
          <Switch value={remind} onValueChange={setRemind} trackColor={{ true: Colors.ink, false: Colors.hairline }} thumbColor={Colors.surface} {...switchWebThumb} accessibilityLabel="Remind me" />
        </View>

        <Field label="Course ends (optional)" placeholder="YYYY-MM-DD, e.g. for antibiotics" value={endDate} onChangeText={setEndDate} />
        <Field label="Notes (optional)" placeholder="e.g. Take after food" value={notes} onChangeText={setNotes} multiline />

        {error ? (
          <T variant="small" color={Colors.danger} accessibilityLiveRegion="polite">
            {error}
          </T>
        ) : null}
        {existing ? <Button label="Remove medicine" kind="secondary" icon="trash-outline" onPress={confirmDelete} /> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  preset: { borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  time: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.ink, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  addRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: MinTap },
});
