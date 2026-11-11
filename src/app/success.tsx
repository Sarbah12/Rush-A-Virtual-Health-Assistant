import { StyleSheet, View } from 'react-native';

import { Button, Logo, Screen, T } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { firstName } from '@/lib/medical-id';

// Figma "sucess": big RUSH mark, Congratulations, Continue.
export default function Success() {
  const { medicalId, finishOnboarding } = useAppState();
  const name = firstName(medicalId);

  return (
    <Screen edges={['top', 'bottom']} scroll={false} footer={<Button label="Continue" onPress={finishOnboarding} />}>
      <View style={styles.center}>
        <Logo size={120} wordmark={false} />
        <T variant="title" style={{ textAlign: 'center', marginTop: Spacing.xl }}>
          Congratulations{name ? `, ${name}` : ''}
        </T>
        <T color={Colors.textMuted} style={{ textAlign: 'center' }}>
          Your Rush profile is ready. You can add more details any time from your profile.
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, minHeight: 480 },
});
