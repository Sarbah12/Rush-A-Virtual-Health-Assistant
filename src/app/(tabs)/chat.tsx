import { StyleSheet, View } from 'react-native';

import { Art, Button, Card, Pill, Screen, T } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

// Figma "Go to Chat": doctor illustration, introduction, start button.
// The conversation itself arrives in Phase 3.
export default function ChatIntro() {
  return (
    <Screen>
      <View style={styles.art}>
        <Art icon="person-outline" size={180} />
      </View>
      <Card>
        <T variant="heading">Meet Rush, your health assistant</T>
        <T color={Colors.textMuted}>
          Describe how you feel in your own words. Rush helps you understand it and decide whether to rest at home,
          see a pharmacist or visit a clinic. It is general guidance, not a diagnosis, and your conversations stay on
          this phone.
        </T>
      </Card>
      <Button label="Start a chat" icon="chatbubble-ellipses-outline" onPress={() => {}} disabled />
      <Pill label="Coming in the next update" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', paddingVertical: Spacing.xl },
});
