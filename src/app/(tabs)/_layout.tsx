import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/components/ui';
import { Colors, Stroke } from '@/constants/theme';

// Figma bottom bar: Home, Chat, Files (medical records), Settings. Icons
// only, filled when active.
function icon(active: IconName, inactive: IconName) {
  return ({ focused, size }: { focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : inactive} size={size + 2} color={focused ? Colors.ink : Colors.textMuted} />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.ink,
          borderTopWidth: Stroke,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
        },
        sceneStyle: { backgroundColor: Colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarAccessibilityLabel: 'Chat with Rush', tabBarIcon: icon('chatbubble-ellipses', 'chatbubble-ellipses-outline') }} />
      <Tabs.Screen name="records" options={{ title: 'Records', tabBarAccessibilityLabel: 'Medical records', tabBarIcon: icon('folder', 'folder-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarAccessibilityLabel: 'Settings', tabBarIcon: icon('settings', 'settings-outline') }} />
    </Tabs>
  );
}
