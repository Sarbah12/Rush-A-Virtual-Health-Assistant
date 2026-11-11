import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Logo, Screen, T } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

// Figma "Onboarding": line-art illustration, tagline, RUSH mark, one action.
// (The Figma's Sign In / Register switch is replaced by a single button:
// Rush keeps everything on the phone, so there is no account.)
export default function Onboarding() {
  return (
    <Screen edges={['top', 'bottom']} footer={<Button label="Get started" onPress={() => router.push('/consent')} />}>
      <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {/* Placeholder for the exported line-art drawing. */}
        <Ionicons name="body-outline" size={140} color={Colors.ink} />
      </View>
      <T variant="heading" style={styles.tagline}>
        Personalise your healthcare and manage your medical data
      </T>
      <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
        <Logo size={56} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl, minHeight: 260 },
  tagline: { textAlign: 'center', paddingHorizontal: Spacing.lg },
});
