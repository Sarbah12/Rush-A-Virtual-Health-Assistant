import { router } from 'expo-router';

import { MedicalSummary } from '@/components/medical-summary';
import { Card, ListRow, Pill, Screen, SectionLabel, T, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';

export default function Records() {
  const { medicalId } = useAppState();
  return (
    <Screen>
      <Title subtitle="Everything here is saved only on this phone.">Medical History</Title>
      <MedicalSummary medicalId={medicalId} />
      <ListRow
        icon="people-outline"
        label="Emergency contact"
        detail={medicalId.contact.name || 'Not added yet'}
        onPress={() => router.push('/medical-id')}
      />
      <SectionLabel>Coming soon</SectionLabel>
      <Card tone="soft">
        <T variant="bodyBold">Health log</T>
        <T color={Colors.textMuted}>
          Record symptoms, blood pressure, blood sugar, weight and temperature, and see how they change over time.
        </T>
        <Pill label="Next update" />
      </Card>
    </Screen>
  );
}
