import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, SectionLabel, T, Title, type IconName } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke } from '@/constants/theme';
import { callNumber } from '@/lib/call';
import {
  CONCERNS,
  DURATIONS,
  EMPTY_ANSWERS,
  GENERAL_DANGER_SIGNS,
  nextStep,
  SEVERITIES,
  triage,
  WHO_OPTIONS,
  type Answers,
  type Step,
} from '@/lib/triage';

const STEP_NUMBER: Record<Step, number> = { danger: 1, who: 2, concern: 3, questions: 4, duration: 5, severity: 6, result: 7 };

export default function Symptoms() {
  const [a, setA] = useState<Answers>(EMPTY_ANSWERS);
  const [history, setHistory] = useState<Step[]>(['danger']);
  const step = history[history.length - 1];
  const go = (next: Answers) => {
    setA(next);
    setHistory((h) => [...h, nextStep(next, step)]);
  };
  const back = () => (history.length > 1 ? setHistory((h) => h.slice(0, -1)) : router.back());
  const restart = () => {
    setA(EMPTY_ANSWERS);
    setHistory(['danger']);
  };
  const concern = CONCERNS.find((c) => c.key === a.concern);

  return (
    <Screen
      footer={
        step === 'danger' ? (
          <Button label={a.dangerSigns.length > 0 ? 'See what to do' : 'None of these, continue'} onPress={() => go(a)} kind={a.dangerSigns.length > 0 ? 'danger' : 'primary'} />
        ) : step === 'questions' ? (
          <Button label="Continue" onPress={() => go(a)} />
        ) : step === 'result' ? (
          <Button label="Start again" kind="secondary" icon="refresh" onPress={restart} />
        ) : undefined
      }>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={18} color={Colors.ink} />
        <T>Back</T>
      </Pressable>
      {step !== 'result' ? (
        <T variant="label" color={Colors.textMuted}>
          STEP {STEP_NUMBER[step]} OF 6
        </T>
      ) : null}

      {step === 'danger' ? (
        <>
          <Title subtitle="Tick any that are happening right now.">Symptoms Checker</Title>
          {GENERAL_DANGER_SIGNS.map((s) => (
            <Check key={s} label={s} checked={a.dangerSigns.includes(s)} danger onPress={() => setA((p) => ({ ...p, dangerSigns: p.dangerSigns.includes(s) ? p.dangerSigns.filter((x) => x !== s) : [...p.dangerSigns, s] }))} />
          ))}
        </>
      ) : null}

      {step === 'who' ? (
        <>
          <Title>Who is unwell?</Title>
          {WHO_OPTIONS.map((o) => (
            <Option key={o.key} label={o.label} onPress={() => go({ ...a, who: o.key })} />
          ))}
        </>
      ) : null}

      {step === 'concern' ? (
        <>
          <Title>What is the main problem?</Title>
          <View style={styles.grid}>
            {CONCERNS.map((c) => (
              <Pressable key={c.key} accessibilityRole="button" onPress={() => go({ ...a, concern: c.key, yes: [] })} style={({ pressed }) => [styles.tile, pressed && { backgroundColor: Colors.overlay }]}>
                <Ionicons name={c.icon as IconName} size={26} color={Colors.ink} />
                <T variant="smallBold" style={{ textAlign: 'center' }}>
                  {c.label}
                </T>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {step === 'questions' && concern ? (
        <>
          <Title subtitle="Tick any that apply.">{concern.label}</Title>
          {concern.questions.map((q) => (
            <Check key={q.id} label={q.text} checked={a.yes.includes(q.id)} danger={q.flag === 'emergency'} onPress={() => setA((p) => ({ ...p, yes: p.yes.includes(q.id) ? p.yes.filter((x) => x !== q.id) : [...p.yes, q.id] }))} />
          ))}
        </>
      ) : null}

      {step === 'duration' ? (
        <>
          <Title>How long has it been going on?</Title>
          {DURATIONS.map((d) => (
            <Option key={d.key} label={d.label} onPress={() => go({ ...a, duration: d.key })} />
          ))}
        </>
      ) : null}

      {step === 'severity' ? (
        <>
          <Title>How bad is it?</Title>
          {SEVERITIES.map((s) => (
            <Option key={s.key} label={s.label} hint={s.hint} onPress={() => go({ ...a, severity: s.key })} />
          ))}
        </>
      ) : null}

      {step === 'result' ? <Result answers={a} /> : null}
    </Screen>
  );
}

function Result({ answers }: { answers: Answers }) {
  const r = triage(answers);
  const emergency = r.outcome === 'emergency';
  return (
    <>
      <Card tone={emergency ? 'danger' : 'plain'}>
        <T variant="title" color={emergency ? Colors.danger : Colors.ink}>
          {r.title}
        </T>
        <T>{r.summary}</T>
        {emergency ? (
          <View style={{ gap: Spacing.sm }}>
            <Button label="Call 112" icon="call" kind="danger" onPress={() => callNumber('112')} />
            <Button label="Call ambulance 193" icon="call" kind="danger" onPress={() => callNumber('193')} />
          </View>
        ) : null}
      </Card>
      {r.reasons.length > 0 ? (
        <>
          <SectionLabel>Why</SectionLabel>
          <Card>
            {r.reasons.map((x) => (
              <T key={x}>• {x}</T>
            ))}
          </Card>
        </>
      ) : null}
      <SectionLabel>What to do</SectionLabel>
      <Card>
        {r.advice.map((x) => (
          <View key={x} style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Ionicons name="checkmark" size={18} color={Colors.ink} style={{ marginTop: 3 }} />
            <T style={{ flex: 1 }}>{x}</T>
          </View>
        ))}
      </Card>
      <T variant="small" color={Colors.textMuted}>
        Rush gives general guidance, not a diagnosis. If you are worried, see a health worker anyway.
      </T>
    </>
  );
}

function Option({ label, hint, onPress }: { label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.option, pressed && { backgroundColor: Colors.overlay }]}>
      <View style={{ flex: 1 }}>
        <T variant="bodyBold">{label}</T>
        {hint ? (
          <T variant="small" color={Colors.textMuted}>
            {hint}
          </T>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.ink} />
    </Pressable>
  );
}

function Check({ label, checked, danger, onPress }: { label: string; checked: boolean; danger?: boolean; onPress: () => void }) {
  const tint = danger && checked ? Colors.danger : Colors.ink;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.option, checked && { borderColor: tint, backgroundColor: danger ? Colors.dangerSoft : Colors.surface }]}>
      <View style={[styles.box, checked && { backgroundColor: tint, borderColor: tint }]}>{checked ? <Ionicons name="checkmark" size={16} color={Colors.onPrimary} /> : null}</View>
      <T style={{ flex: 1 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  tile: {
    width: '48%',
    minHeight: 96,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  option: {
    minHeight: MinTap + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: Stroke, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
});
