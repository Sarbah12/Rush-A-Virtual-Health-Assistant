import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Card, Screen, T, Title, type IconName } from '@/components/ui';
import { ARTICLES } from '@/constants/library';
import { Colors, Spacing } from '@/constants/theme';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const a = ARTICLES.find((x) => x.id === id);

  if (!a) {
    return (
      <Screen back>
        <Title>Article not found</Title>
      </Screen>
    );
  }

  return (
    <Screen back>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <Ionicons name={a.icon as IconName} size={22} color={Colors.ink} />
        <T variant="label" color={Colors.textMuted}>
          {a.category.toUpperCase()} · {a.minutes} MIN READ
        </T>
      </View>
      <Title subtitle={a.summary}>{a.title}</Title>
      {a.sections.map((s, i) => (
        <View key={i} style={{ gap: Spacing.sm }}>
          {s.heading ? <T variant="heading">{s.heading}</T> : null}
          {s.body.length > 1 ? (
            s.body.map((p) => (
              <View key={p} style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <T>•</T>
                <T style={{ flex: 1 }}>{p}</T>
              </View>
            ))
          ) : (
            <T>{s.body[0]}</T>
          )}
        </View>
      ))}
      <Card tone="soft">
        <T variant="small" color={Colors.textMuted}>
          Source: {a.source}. General information only. See a health worker about your own situation.
        </T>
      </Card>
    </Screen>
  );
}
