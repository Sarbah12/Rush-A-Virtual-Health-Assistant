import { Alert, Linking, Platform } from 'react-native';

/** Opens the phone dialler with the number filled in. */
export async function callNumber(dial: string): Promise<void> {
  const url = `tel:${dial}`;
  try {
    await Linking.openURL(url);
  } catch {
    const message = `Please dial ${dial} on your phone.`;
    if (Platform.OS === 'web') {
      globalThis.alert?.(message);
    } else {
      Alert.alert('Could not open the dialler', message);
    }
  }
}
