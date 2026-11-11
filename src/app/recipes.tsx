import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ContentCard } from '@/components/content-card';
import { Screen, T, Title, type IconName } from '@/components/ui';
import { RECIPES, type Recipe } from '@/constants/recipes';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';

const TAGS: Recipe['tags'][number][] = ['Diabetes friendly', 'Low salt', 'High fibre', 'Pregnancy', 'Quick', 'Vegetarian'];

// Figma "health recipe".
export default function Recipes() {
  const [tag, setTag] = useState<Recipe['tags'][number] | null>(null);
  const shown = tag ? RECIPES.filter((r) => r.tags.includes(tag)) : RECIPES;

  return (
    <Screen back>
      <Title subtitle="Familiar Ghanaian dishes, cooked a little lighter.">Health Recipe</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
        {[null, ...TAGS].map((t) => {
          const on = tag === t;
          return (
            <Pressable key={t ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setTag(t)} style={[styles.chip, on && styles.chipOn]}>
              <T variant="smallBold" color={on ? Colors.onPrimary : Colors.ink}>
                {t ?? 'All'}
              </T>
            </Pressable>
          );
        })}
      </ScrollView>
      {shown.map((r) => (
        <ContentCard key={r.id} icon={r.icon as IconName} title={r.title} summary={r.summary} meta={`${r.minutes} min · serves ${r.serves}`} onPress={() => router.push({ pathname: '/recipe', params: { id: r.id } })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: Stroke, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  chipOn: { backgroundColor: Colors.ink },
});
