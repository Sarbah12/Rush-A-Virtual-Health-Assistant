import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { T, type IconName } from '@/components/ui';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';

/** Figma library/recipe card: square thumbnail, title, short summary. */
export function ContentCard({ icon, title, summary, meta, onPress }: { icon: IconName; title: string; summary: string; meta: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${summary}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && { backgroundColor: Colors.overlay }]}>
      <View style={styles.thumb}>
        <Ionicons name={icon} size={30} color={Colors.ink} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyBold">{title}</T>
        <T variant="small" color={Colors.textMuted} numberOfLines={2}>
          {summary}
        </T>
        <T variant="label" color={Colors.textMuted}>
          {meta.toUpperCase()}
        </T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  thumb: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: Colors.background, borderWidth: Stroke, borderColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
});
