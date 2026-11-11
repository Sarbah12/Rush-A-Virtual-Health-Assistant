import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Art, Avatar, Screen, T, type IconName } from '@/components/ui';
import { Colors, MinTap, Radius, Spacing, Stroke, Type } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';
import { firstName } from '@/lib/medical-id';

type Feature = {
  key: string;
  title: string;
  body: string;
  icon: IconName;
  href: Href;
  danger?: boolean;
};

// Figma "Home" cards, plus Medicines and Emergency SOS.
const FEATURES: Feature[] = [
  { key: 'history', title: 'Medical History', body: 'Your medical ID and health details.', icon: 'document-text-outline', href: '/records' },
  { key: 'symptoms', title: 'Symptoms Checker', body: 'Describe how you feel and learn where to go next.', icon: 'medkit-outline', href: '/symptoms' },
  { key: 'library', title: 'Health Library', body: 'Trusted articles on everyday health topics.', icon: 'library-outline', href: '/library' },
  { key: 'recipes', title: 'Healthy Recipes', body: 'Nourishing local meals for a healthier you.', icon: 'nutrition-outline', href: '/recipes' },
  { key: 'meds', title: 'Medicines', body: 'Reminders so you never miss a dose.', icon: 'alarm-outline', href: '/meds' },
  { key: 'sos', title: 'Emergency SOS', body: 'Call 112 or an ambulance in one tap.', icon: 'call-outline', href: '/sos', danger: true },
];

export default function Home() {
  const { medicalId } = useAppState();
  const [query, setQuery] = useState('');
  const name = firstName(medicalId);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURES;
    return FEATURES.filter((f) => `${f.title} ${f.body}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <Screen>
      <View style={styles.header}>
        <T variant="title" accessibilityRole="header" style={{ flex: 1 }}>
          {name ? `Welcome,\n${name}` : 'Welcome'}
        </T>
        <Pressable accessibilityRole="button" accessibilityLabel="Your profile" onPress={() => router.push('/profile')}>
          <Avatar name={medicalId.name} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            accessibilityLabel="Search Rush"
            placeholder="Search"
            placeholderTextColor={Colors.placeholder}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Emergency SOS"
          onPress={() => router.push('/sos')}
          style={({ pressed }) => [styles.sos, pressed && { backgroundColor: Colors.dangerPressed }]}>
          <T variant="smallBold" color={Colors.onPrimary}>
            SOS
          </T>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {shown.map((f) => (
          <FeatureCard key={f.key} feature={f} />
        ))}
        {shown.length === 0 ? (
          <T color={Colors.textMuted} style={{ textAlign: 'center', width: '100%' }}>
            Nothing matches “{query.trim()}”.
          </T>
        ) : null}
      </View>
    </Screen>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const tint = feature.danger ? Colors.danger : Colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${feature.title}. ${feature.body}`}
      onPress={() => router.push(feature.href)}
      style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.8 }]}>
      <View style={styles.cardArt}>
        <Art icon={feature.icon} size={76} tint={tint} />
      </View>
      <View style={[styles.cardBody, feature.danger && { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft }]}>
        <T variant="smallBold" color={tint}>
          {feature.title}
        </T>
        <T variant="small" color={Colors.textMuted} numberOfLines={3}>
          {feature.body}
        </T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingTop: Spacing.sm },
  searchRow: { flexDirection: 'row', gap: Spacing.md },
  search: {
    flex: 1,
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
  sos: {
    width: MinTap + 8,
    minHeight: MinTap,
    borderRadius: Radius.sm,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.lg },
  cardWrap: { width: '48%' },
  cardArt: { alignItems: 'center', marginBottom: -Spacing.md, zIndex: 1 },
  cardBody: {
    flexGrow: 1,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    gap: 2,
    minHeight: 110,
  },
});
