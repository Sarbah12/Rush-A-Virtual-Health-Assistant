import { Platform, Share } from 'react-native';

/** Shares text through the phone's share sheet, or downloads it on the web. */
export async function shareText(title: string, text: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ title, message: text });
}
