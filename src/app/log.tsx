import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { LevelBadge } from '@/components/level-badge';
import { LineChart } from '@/components/line-chart';
import { Button, Card, Choice, Field, Screen, SectionLabel, T, Title } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke } from '@/constants/theme';
import {
  assess,
  formatValue,
  makeEntry,
  METRIC_INFO,
  METRICS,
  MOOD_LABELS,
  series,
  type Entry,
  type Metric,
} from '@/lib/health-log';
import { useHealthLog } from '@/lib/use-health-log';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function LogScreen() {
  const params = useLocalSearchParams<{ metric?: string }>();
  const metric: Metric = (METRICS as readonly string[]).includes(params.metric ?? '') ? (params.metric as Metric) : 'bp';
  const info = METRIC_INFO[metric];
  const { entries, add, remove } = useHealthLog();
  const [days, setDays] = useState(30);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [fasting, setFasting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<Entry | null>(null);

  const mine = useMemo(() => entries.filter((e) => e.metric === metric), [entries, metric]);
  const points = useMemo(() => series(entries, metric, days), [entries, metric, days]);
  const charted = metric !== 'symptom';

  async function save() {
    const r = makeEntry(metric, { value, value2, fasting, note });
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    setError(null);
    await add(r.entry);
    setJustSaved({ ...r.entry, id: 'new' });
    setValue('');
    setValue2('');
    setNote('');
  }

  function confirmRemove(e: Entry) {
    const msg = `Delete this reading (${formatValue(e) || e.note})?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(msg)) remove(e.id);
      return;
    }
    Alert.alert('Delete reading?', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(e.id) },
    ]);
  }

  const lastAssessment = justSaved ? assess(justSaved) : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen back>
        <Title>{info.label}</Title>

        {charted ? (
          <Card>
            <View style={styles.ranges}>
              {RANGES.map((r) => (
                <Pressable
                  key={r.days}
                  accessibilityRole="button"
                  accessibilityState={{ selected: days === r.days }}
                  onPress={() => setDays(r.days)}
                  style={[styles.range, days === r.days && styles.rangeOn]}>
                  <T variant="smallBold" color={days === r.days ? Colors.onPrimary : Colors.ink}>
                    {r.label}
                  </T>
                </Pressable>
              ))}
            </View>
            <LineChart points={points} decimals={info.decimals} label={info.label} />
            {metric === 'bp' ? (
              <T variant="small" color={Colors.textMuted}>
                Solid line: top number (systolic). Dashed: bottom number (diastolic).
              </T>
            ) : null}
          </Card>
        ) : null}

        <SectionLabel>Add a reading</SectionLabel>
        <Card>
          {metric === 'bp' ? (
            <View style={styles.bpRow}>
              <View style={{ flex: 1 }}>
                <Field label="Top (systolic)" placeholder="120" value={value} onChangeText={setValue} keyboardType="number-pad" />
              </View>
              <T variant="heading" style={{ marginTop: 28 }}>
                /
              </T>
              <View style={{ flex: 1 }}>
                <Field label="Bottom (diastolic)" placeholder="80" value={value2} onChangeText={setValue2} keyboardType="number-pad" />
              </View>
            </View>
          ) : metric === 'mood' ? (
            <Choice
              label="How are you feeling?"
              options={['1', '2', '3', '4', '5'] as const}
              value={value as '1' | '2' | '3' | '4' | '5' | ''}
              onChange={(v) => setValue(v)}
            />
          ) : metric === 'symptom' ? (
            <>
              <Field label="What are you feeling?" placeholder="e.g. Headache and body pains" value={note} onChangeText={setNote} />
              <Field label="How bad, 0 to 10 (optional)" placeholder="e.g. 6" value={value} onChangeText={setValue} keyboardType="number-pad" />
            </>
          ) : (
            <Field
              label={`${info.label} (${info.unit})`}
              placeholder={metric === 'sugar' ? 'e.g. 5.4' : metric === 'temp' ? 'e.g. 37.2' : 'e.g. 68'}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
            />
          )}
          {metric === 'mood' && value ? (
            <T variant="small" color={Colors.textMuted}>
              {MOOD_LABELS[Number(value) - 1]}
            </T>
          ) : null}
          {metric === 'sugar' ? (
            <Choice label="When did you measure?" options={['Before eating', 'After eating'] as const} value={fasting ? 'Before eating' : 'After eating'} onChange={(v) => setFasting(v === 'Before eating')} />
          ) : null}
          {metric !== 'symptom' ? <Field label="Note (optional)" placeholder="e.g. After a walk" value={note} onChangeText={setNote} /> : null}
          {error ? (
            <T variant="small" color={Colors.danger} accessibilityLiveRegion="polite">
              {error}
            </T>
          ) : null}
          <Button label="Save reading" icon="add" onPress={save} />
        </Card>

        {justSaved && lastAssessment && lastAssessment.advice ? (
          <Card tone={lastAssessment.level === 'urgent' ? 'danger' : 'plain'}>
            <View style={styles.row}>
              <T variant="bodyBold" style={{ flex: 1 }}>
                Saved: {formatValue(justSaved)}
              </T>
              <LevelBadge level={lastAssessment.level} label={lastAssessment.label} />
            </View>
            <T>{lastAssessment.advice}</T>
            <T variant="small" color={Colors.textMuted}>
              General guidance only, not a diagnosis.
            </T>
          </Card>
        ) : null}

        <SectionLabel>History</SectionLabel>
        {mine.length === 0 ? (
          <T color={Colors.textMuted}>No readings yet.</T>
        ) : (
          mine.slice(0, 60).map((e) => {
            const a = assess(e);
            return (
              <View key={e.id} style={styles.entry}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bodyBold">{e.metric === 'symptom' ? e.note : formatValue(e)}</T>
                  <T variant="small" color={Colors.textMuted}>
                    {new Date(e.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {e.metric === 'symptom' ? (e.value ? ` · ${formatValue(e)}` : '') : e.note ? ` · ${e.note}` : ''}
                    {e.fasting ? ' · fasting' : ''}
                  </T>
                  {a && e.metric !== 'mood' ? <LevelBadge level={a.level} label={a.label} /> : null}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Delete reading" hitSlop={8} onPress={() => confirmRemove(e)} style={styles.del}>
                  <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                </Pressable>
              </View>
            );
          })
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ranges: { flexDirection: 'row', gap: Spacing.sm },
  range: { borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  rangeOn: { backgroundColor: Colors.ink },
  bpRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  del: { minWidth: MinTap, minHeight: MinTap, alignItems: 'center', justifyContent: 'center' },
});
