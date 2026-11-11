import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, T, Title } from '@/components/ui';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';
import { useAppState } from '@/lib/app-state';

// Figma "terms": Confirm you're ready. The medical disclaimer is part of
// what people agree to, because it is the most important thing to know.
const DECLARATIONS = [
  'Rush gives general health guidance. It cannot examine you, diagnose you or prescribe medicine.',
  'I will see a pharmacist, nurse or doctor for anything serious or that keeps going, and I will not stop or change medicine because of the app.',
  'In an emergency I will call 112 or the ambulance on 193, or go to the nearest hospital.',
];

export default function Consent() {
  const { acceptConsent } = useAppState();
  const [agreed, setAgreed] = useState(false);

  async function proceed() {
    await acceptConsent();
    router.push('/register');
  }

  return (
    <Screen back edges={['top', 'bottom']} footer={<Button label="Proceed" onPress={proceed} disabled={!agreed} />}>
      <Title subtitle="Please read and confirm the following before you start. You can read this again any time in Settings.">
        Confirm you’re ready
      </Title>

      <Card>
        {DECLARATIONS.map((d) => (
          <View key={d} style={styles.point}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.ink} style={{ marginTop: 2 }} />
            <T style={{ flex: 1 }}>{d}</T>
          </View>
        ))}
      </Card>

      <Card tone="soft">
        <View style={styles.point}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.ink} style={{ marginTop: 2 }} />
          <T style={{ flex: 1 }}>
            Your medical information is saved only on this phone. Rush has no account and keeps no copy.
          </T>
        </View>
      </Card>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => setAgreed((a) => !a)}
        style={styles.checkRow}>
        <View style={[styles.box, agreed && styles.boxOn]}>
          {agreed ? <Ionicons name="checkmark" size={16} color={Colors.onPrimary} /> : null}
        </View>
        <T style={{ flex: 1 }}>
          I agree to the points above and confirm that I am at least 16 years old.
        </T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  point: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  checkRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', minHeight: 48 },
  box: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm - 2,
    borderWidth: Stroke,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: Colors.ink },
});
