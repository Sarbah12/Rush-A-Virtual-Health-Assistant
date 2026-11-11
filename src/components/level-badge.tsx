import { View } from 'react-native';

import { T } from '@/components/ui';
import { Colors, Radius, Spacing, Stroke } from '@/constants/theme';
import type { Level } from '@/lib/health-log';

const PALETTE: Record<Level, { bg: string; fg: string }> = {
  ok: { bg: Colors.mint, fg: Colors.ink },
  watch: { bg: '#FBE9C4', fg: Colors.ink },
  low: { bg: Colors.sky, fg: Colors.ink },
  high: { bg: Colors.peach, fg: Colors.ink },
  urgent: { bg: Colors.danger, fg: Colors.onPrimary },
};

export function LevelBadge({ level, label }: { level: Level; label: string }) {
  const p = PALETTE[level];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: p.bg, borderRadius: Radius.pill, borderWidth: Stroke, borderColor: level === 'urgent' ? Colors.danger : Colors.ink, paddingHorizontal: Spacing.sm, paddingVertical: 2 }}>
      <T variant="smallBold" color={p.fg}>
        {label}
      </T>
    </View>
  );
}
