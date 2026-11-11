import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ContentCard } from '@/components/content-card';
import { Screen, SectionLabel, T, Title, type IconName } from '@/components/ui';
import { ARTICLE_CATEGORIES, ARTICLES } from '@/constants/library';
import { Colors, MinTap, Radius, Spacing, Stroke, Type } from '@/constants/theme';

// Figma "health library": thumbnail + title + short summary cards.
export default function Library() {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ARTICLES.filter((a) => `${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(s)) : ARTICLES;
  }, [q]);

  return (
    <Screen back>
      <Title subtitle="Short, trusted reads. They work without internet.">Health Library</Title>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput accessibilityLabel="Search articles" placeholder="Search articles" placeholderTextColor={Colors.placeholder} value={q} onChangeText={setQ} style={styles.searchInput} />
      </View>
      {ARTICLE_CATEGORIES.map((cat) => {
        const items = shown.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat} style={{ gap: Spacing.md }}>
            <SectionLabel>{cat}</SectionLabel>
            {items.map((a) => (
              <ContentCard key={a.id} icon={a.icon as IconName} title={a.title} summary={a.summary} meta={`${a.minutes} min read`} onPress={() => router.push({ pathname: '/article', params: { id: a.id } })} />
            ))}
          </View>
        );
      })}
      {shown.length === 0 ? <T color={Colors.textMuted}>No articles match “{q.trim()}”.</T> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: MinTap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
  },
  searchInput: { ...Type.body, flex: 1, color: Colors.text, paddingVertical: Spacing.sm, outlineStyle: 'none' } as never,
});
