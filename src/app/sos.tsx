import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { MedicalSummary } from '@/components/medical-summary';
import { Button, Card, Screen, SectionLabel, T, Title } from '@/components/ui';
import { DANGER_SIGNS, EMERGENCY_LINES, type EmergencyLine } from '@/constants/emergency';
import { Colors, MinTap, Radius, Spacing, Stroke } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { callNumber } from '@/lib/call';
import { normalizePhone, type MedicalId } from '@/lib/medical-id';

const spoken = (n: string) => n.split('').join(' ');

export default function Sos() {
  const { medicalId } = useAppState();
  const primary = EMERGENCY_LINES.filter((l) => l.primary);
  const other = EMERGENCY_LINES.filter((l) => !l.primary);

  return (
    <Screen back>
      <Title subtitle="Tap a number to open your phone's dialler.">Emergency</Title>

      {primary.map((line) => (
        <BigCallButton key={line.number} line={line} />
      ))}

      <View style={styles.smallRow}>
        {other.map((line) => (
          <Pressable
            key={line.number}
            accessibilityRole="button"
            accessibilityLabel={`Call ${line.name}, ${spoken(line.number)}`}
            onPress={() => callNumber(line.number)}
            style={({ pressed }) => [styles.smallCall, pressed && { backgroundColor: Colors.dangerSoft }]}>
            <T variant="heading" color={Colors.danger}>
              {line.number}
            </T>
            <T variant="small" color={Colors.textMuted}>
              {line.name}
            </T>
          </Pressable>
        ))}
      </View>

      <EmergencyContactCard medicalId={medicalId} />
      <MedicalSummary medicalId={medicalId} accent={Colors.danger} />

      <SectionLabel>Call for help now if you see</SectionLabel>
      <Card>
        {DANGER_SIGNS.map((sign) => (
          <View key={sign} style={styles.sign}>
            <Ionicons name="warning" size={18} color={Colors.danger} style={{ marginTop: 3 }} />
            <T style={{ flex: 1 }}>{sign}</T>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function BigCallButton({ line }: { line: EmergencyLine }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Call ${line.name}, ${spoken(line.number)}`}
      onPress={() => callNumber(line.number)}
      style={({ pressed }) => [styles.big, { backgroundColor: pressed ? Colors.dangerPressed : Colors.danger }]}>
      <View style={styles.bigIcon}>
        <Ionicons name="call" size={26} color={Colors.danger} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="bodyBold" color={Colors.onPrimary}>
          {line.name}
        </T>
        <T variant="small" color="#FFE3E0">
          {line.detail}
        </T>
      </View>
      <T variant="display" color={Colors.onPrimary}>
        {line.number}
      </T>
    </Pressable>
  );
}

function EmergencyContactCard({ medicalId }: { medicalId: MedicalId }) {
  const { contact } = medicalId;
  const phone = contact.phone ? normalizePhone(contact.phone) : null;

  if (!contact.name && !contact.phone) {
    return (
      <Card>
        <T variant="bodyBold">Add someone to call</T>
        <T color={Colors.textMuted}>
          Save a family member or friend so you, or someone helping you, can reach them in one tap.
        </T>
        <Button label="Add emergency contact" icon="person-add-outline" kind="secondary" onPress={() => router.push('/medical-id')} />
      </Card>
    );
  }

  return (
    <Card>
      <T variant="label" color={Colors.textMuted}>
        EMERGENCY CONTACT
      </T>
      <View>
        <T variant="heading">{contact.name || 'Emergency contact'}</T>
        {contact.relationship ? <T color={Colors.textMuted}>{contact.relationship}</T> : null}
        {phone?.ok ? <T color={Colors.textMuted}>{phone.display}</T> : null}
      </View>
      {phone?.ok ? (
        <Button label={`Call ${contact.name || 'contact'}`} icon="call" onPress={() => callNumber(phone.dial)} />
      ) : (
        <T variant="small" color={Colors.warning}>
          No valid phone number saved. Edit your medical ID to fix it.
        </T>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  big: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, padding: Spacing.lg, minHeight: 88 },
  bigIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.onPrimary, alignItems: 'center', justifyContent: 'center' },
  smallRow: { flexDirection: 'row', gap: Spacing.md },
  smallCall: {
    flex: 1,
    minHeight: MinTap + 16,
    borderRadius: Radius.md,
    borderWidth: Stroke,
    borderColor: Colors.danger,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  sign: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
});
