import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { ListRow, Screen, SectionLabel, T, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { exportText } from '@/lib/export';
import { shareText } from '@/lib/share';
import { useHealthLog } from '@/lib/use-health-log';
import { useMeds } from '@/lib/use-meds';

// Figma "settings": Account settings and Support lists. "Account Login" is
// replaced by Profile because Rush has no account.
export default function Settings() {
  const { deleteAllData, medicalId } = useAppState();
  const { entries } = useHealthLog();
  const { data: meds } = useMeds();

  function confirmDelete() {
    const message =
      'This permanently removes your profile, medical ID and every other Rush record from this phone. It cannot be undone.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Delete all your data?\n\n${message}`)) deleteAllData();
      return;
    }
    Alert.alert('Delete all your data?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete everything', style: 'destructive', onPress: deleteAllData },
    ]);
  }

  return (
    <Screen>
      <Title>Account settings</Title>
      <ListRow icon="person-outline" label="Profile" onPress={() => router.push('/profile')} />
      <ListRow icon="id-card-outline" label="Medical ID" onPress={() => router.push('/medical-id')} />
      <ListRow icon="lock-closed-outline" label="Privacy" onPress={() => router.push({ pathname: '/about', params: { section: 'privacy' } })} />
      <ListRow icon="language-outline" label="Language" detail="English" onPress={() => router.push('/languages')} />

      <SectionLabel>Support</SectionLabel>
      <ListRow icon="information-circle-outline" label="About Rush" onPress={() => router.push('/about')} />
      <ListRow icon="call-outline" label="Emergency numbers" onPress={() => router.push('/sos')} />
      <ListRow icon="medkit-outline" label="Symptoms Checker" onPress={() => router.push('/symptoms')} />

      <SectionLabel>Your data</SectionLabel>
      <ListRow
        icon="share-outline"
        label="Export your medical data"
        detail="A summary to share with your doctor"
        onPress={() => shareText('Rush health summary', exportText(medicalId, entries, meds))}
      />
      <ListRow icon="trash-outline" label="Delete all my data" danger onPress={confirmDelete} />
      <T variant="small" color={Colors.textMuted} style={{ textAlign: 'center' }}>
        Rush 1.0 · your data never leaves this phone
      </T>
    </Screen>
  );
}
