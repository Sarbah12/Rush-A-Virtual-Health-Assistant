import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Card, Screen, T, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

// Figma "Languages". Only English exists today; the others are listed so
// people can see what is planned, but cannot be switched on yet.
const LANGUAGES = ['English', 'Twi', 'Ga', 'Ewe', 'Hausa', 'French'];

export default function Languages() {
  return (
    <Screen back>
      <Title subtitle="More languages are on the way.">Languages</Title>
      <Card style={{ gap: 0, paddingVertical: Spacing.sm }}>
        {LANGUAGES.map((lang, i) => {
          const active = i === 0;
          return (
            <View
              key={lang}
              style={[styles.row, i > 0 && styles.divider]}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: !active }}
              accessibilityLabel={active ? lang : `${lang}, coming soon`}>
              <T variant="bodyBold" color={active ? Colors.ink : Colors.textMuted} style={{ flex: 1 }}>
                {lang}
              </T>
              {active ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.ink} />
              ) : (
                <T variant="small" color={Colors.textMuted}>
                  Coming soon
                </T>
              )}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.hairline },
});
