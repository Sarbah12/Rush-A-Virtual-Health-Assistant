import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Card, Screen, SectionLabel, T, Title } from '@/components/ui';
import { RECIPES } from '@/constants/recipes';
import { Colors, Spacing } from '@/constants/theme';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const r = RECIPES.find((x) => x.id === id);
  if (!r) {
    return (
      <Screen back>
        <Title>Recipe not found</Title>
      </Screen>
    );
  }
  return (
    <Screen back>
      <Title subtitle={r.summary}>{r.title}</Title>
      <T variant="label" color={Colors.textMuted}>
        {`${r.minutes} MIN · SERVES ${r.serves} · ${r.tags.join(' · ').toUpperCase()}`}
      </T>
      <SectionLabel>Ingredients</SectionLabel>
      <Card>
        {r.ingredients.map((i) => (
          <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <T>•</T>
            <T style={{ flex: 1 }}>{i}</T>
          </View>
        ))}
      </Card>
      <SectionLabel>Method</SectionLabel>
      {r.steps.map((s, n) => (
        <View key={s} style={{ flexDirection: 'row', gap: Spacing.md }}>
          <T variant="heading">{n + 1}</T>
          <T style={{ flex: 1 }}>{s}</T>
        </View>
      ))}
      <Card tone="soft">
        <T variant="bodyBold">Healthy tip</T>
        <T>{r.tip}</T>
      </Card>
    </Screen>
  );
}
