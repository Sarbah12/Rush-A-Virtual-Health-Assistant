import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Art, Card, Pill, Screen, T, type IconName } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

// One screen for every feature that is planned but not built yet, so the
// home cards already lead somewhere honest.
const FEATURES: Record<string, { title: string; body: string; icon: IconName }> = {
  symptoms: {
    title: 'Symptoms Checker',
    body: 'Answer a few simple questions about how you feel and Rush will suggest whether to rest at home, see a pharmacist, visit a clinic or get emergency care.',
    icon: 'medkit-outline',
  },
  library: {
    title: 'Health Library',
    body: 'Short, trusted articles that work offline: malaria prevention, staying hydrated in the heat, blood pressure, diabetes, mental health and first aid.',
    icon: 'library-outline',
  },
  recipes: {
    title: 'Healthy Recipes',
    body: 'Simple, nourishing recipes using local ingredients, with notes for diabetes, blood pressure and pregnancy.',
    icon: 'nutrition-outline',
  },
  meds: {
    title: 'Medicines',
    body: 'Add your medicines and Rush will remind you when each dose is due, even without internet.',
    icon: 'alarm-outline',
  },
};

export default function Soon() {
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const f = FEATURES[feature ?? ''] ?? { title: 'Coming soon', body: 'This part of Rush is on the way.', icon: 'time-outline' as IconName };

  return (
    <Screen back>
      <View style={styles.art}>
        <Art icon={f.icon} size={120} />
      </View>
      <Card>
        <T variant="title">{f.title}</T>
        <T color={Colors.textMuted}>{f.body}</T>
        <Pill label="Coming soon" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', paddingVertical: Spacing.xl },
});
