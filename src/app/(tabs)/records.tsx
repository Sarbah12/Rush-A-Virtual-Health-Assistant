import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { LevelBadge } from '@/components/level-badge';
import { MedicalSummary } from '@/components/medical-summary';
import { ListRow, Screen, SectionLabel, T, Title, type IconName } from '@/components/ui';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { assess, formatValue, latestByMetric, METRIC_INFO, METRICS } from '@/lib/health-log';
import { useHealthLog } from '@/lib/use-health-log';

export default function Records() {
  const { medicalId } = useAppState();
  const { entries } = useHealthLog();
  const latest = latestByMetric(entries);

  return (
    <Screen>
      <Title subtitle="Everything here is saved only on this phone.">Medical History</Title>

      <SectionLabel>Health log</SectionLabel>
      <View style={styles.grid}>
        {METRICS.map((m) => {
          const info = METRIC_INFO[m];
          const e = latest[m];
          const a = e ? assess(e) : null;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityLabel={`${info.label}${e ? `, latest ${formatValue(e) || e.note}` : ', no readings yet'}`}
              onPress={() => router.push({ pathname: '/log', params: { metric: m } })}
              style={({ pressed }) => [styles.tile, pressed && { backgroundColor: Colors.overlay }]}>
              <View style={styles.tileHead}>
                <Ionicons name={info.icon as IconName} size={18} color={Colors.ink} />
                <T variant="smallBold" style={{ flex: 1 }}>
                  {info.label}
                </T>
              </View>
              {e ? (
                <>
                  <T variant="bodyBold" numberOfLines={1}>
                    {m === 'symptom' ? e.note : formatValue(e)}
                  </T>
                  <T variant="small" color={Colors.textMuted}>
                    {new Date(e.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </T>
                  {a && m !== 'mood' ? <LevelBadge level={a.level} label={a.label} /> : null}
                </>
              ) : (
                <T variant="small" color={Colors.textMuted}>
                  Tap to add
                </T>
              )}
            </Pressable>
          );
        })}
      </View>

      <SectionLabel>Medical ID</SectionLabel>
      <MedicalSummary medicalId={medicalId} />
      <ListRow
        icon="people-outline"
        label="Emergency contact"
        detail={medicalId.contact.name || 'Not added yet'}
        onPress={() => router.push('/medical-id')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  tile: {
    width: '48%',
    minHeight: 112,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 4,
  },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
