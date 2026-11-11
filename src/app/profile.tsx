import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Card, ListRow, Screen, T } from '@/components/ui';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { ageFrom, normalizePhone } from '@/lib/medical-id';

// Figma "profile details".
export default function Profile() {
  const { medicalId } = useAppState();
  const age = ageFrom(medicalId.dateOfBirth);
  const phone = medicalId.phone ? normalizePhone(medicalId.phone) : null;

  return (
    <Screen back>
      <Card style={styles.identity}>
        <Avatar name={medicalId.name} size={56} />
        <View style={{ flex: 1, alignItems: 'flex-end', gap: 2 }}>
          <T variant="heading">{medicalId.name || 'Your name'}</T>
          {age !== null ? <T variant="small">{age} years old</T> : null}
          {phone?.ok ? <T variant="small">{phone.display}</T> : null}
        </View>
      </Card>

      <Card>
        <View style={styles.historyRow}>
          <T variant="bodyBold" style={{ flex: 1 }}>
            Medical History
          </T>
          <Pressable accessibilityRole="button" onPress={() => router.push('/records')} style={styles.read}>
            <T variant="smallBold" color={Colors.onPrimary}>
              Read ›
            </T>
          </Pressable>
        </View>
        <T variant="small" color={Colors.textMuted}>
          Check all your medical history
        </T>
      </Card>

      <View style={styles.chips}>
        <Stat label="Blood group" value={medicalId.bloodGroup} color={Colors.peach} />
        <Stat label="Sickle cell" value={medicalId.sickleCell} color={Colors.sky} />
        <Stat label="Sex" value={medicalId.sex ? medicalId.sex[0] : ''} color={Colors.mint} />
      </View>

      <ListRow icon="person-outline" label="Personal information" onPress={() => router.push('/medical-id')} />
      <ListRow
        icon="people-outline"
        label="Emergency contact"
        detail={medicalId.contact.name || 'Not added yet'}
        onPress={() => router.push('/medical-id')}
      />
      <ListRow icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color }]} accessible accessibilityLabel={`${label}: ${value || 'not set'}`}>
      <T variant="small">{label}</T>
      <T variant="bodyBold">{value || '—'}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center' },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  read: { backgroundColor: Colors.ink, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, borderRadius: Radius.sm, borderWidth: Stroke, borderColor: Colors.ink, padding: Spacing.md, gap: 2 },
});
