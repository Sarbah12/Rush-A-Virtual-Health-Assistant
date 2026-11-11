import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, T } from '@/components/ui';
import { Colors, MinTap, Spacing } from '@/constants/theme';
import { ageFrom, formatDob, isMedicalIdEmpty, type MedicalId } from '@/lib/medical-id';

const openEditor = () => router.push('/medical-id');

/** Read-only medical ID card, shown on Records and SOS. */
export function MedicalSummary({ medicalId, accent = Colors.ink }: { medicalId: MedicalId; accent?: string }) {
  if (isMedicalIdEmpty(medicalId)) {
    return (
      <Card>
        <T variant="bodyBold">Set up your medical ID</T>
        <T color={Colors.textMuted}>
          Blood group, allergies and conditions help doctors treat you quickly if you cannot speak. It stays on this
          phone.
        </T>
        <Button label="Create medical ID" icon="id-card-outline" kind="secondary" onPress={openEditor} />
      </Card>
    );
  }

  const age = ageFrom(medicalId.dateOfBirth);
  const dob = medicalId.dateOfBirth ? `${formatDob(medicalId.dateOfBirth)}${age !== null ? ` (${age})` : ''}` : '';
  const rows: [string, string][] = [
    ['Name', medicalId.name],
    ['Date of birth', dob],
    ['Location', medicalId.location],
    ['Sex', medicalId.sex],
    ['Blood group', medicalId.bloodGroup],
    ['Sickle cell status', medicalId.sickleCell],
    ['Allergies', medicalId.allergies],
    ['Conditions', medicalId.conditions],
    ['Medicines', medicalId.medications],
    ['Other information', medicalId.notes],
  ];

  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="id-card-outline" size={22} color={accent} />
        <T variant="heading" style={{ flex: 1 }}>
          Medical ID
        </T>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit medical ID" hitSlop={12} style={styles.edit} onPress={openEditor}>
          <T variant="bodyBold" color={Colors.link}>
            Edit
          </T>
        </Pressable>
      </View>
      {rows
        .filter(([, v]) => v.trim() !== '')
        .map(([label, value]) => (
          <View key={label} style={{ gap: 2 }}>
            <T variant="label" color={Colors.textMuted}>
              {label.toUpperCase()}
            </T>
            <T>{value}</T>
          </View>
        ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  edit: { minHeight: MinTap, justifyContent: 'center', paddingHorizontal: Spacing.sm },
});
