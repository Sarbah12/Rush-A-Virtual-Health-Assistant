import { useId } from 'react';
import Svg, { Defs, G, Mask, Path, Polygon, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

/**
 * The RUSH hourglass mark from the Figma, redrawn as a vector (two teardrop
 * lobes cut by a tapering slash). The slash is a mask, so it works on any
 * background. Replace with the exported Figma logo when it arrives.
 */
export function RushMark({ height = 64, color = Colors.ink }: { height?: number; color?: string }) {
  const id = `rush-mark-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={(height * 100) / 120} height={height} viewBox="0 0 100 120">
      <Defs>
        <Mask id={id} x="0" y="0" width="100" height="120" maskUnits="userSpaceOnUse">
          <Rect x="0" y="0" width="100" height="120" fill="white" />
          <Polygon points="35,-2 48,-2 88,104" fill="black" />
        </Mask>
      </Defs>
      <G mask={`url(#${id})`} fill={color}>
        <Path d="M50 57 C 38 50, 15 40, 15 24 C 15 9, 30 2, 50 2 C 70 2, 85 9, 85 24 C 85 40, 62 50, 50 57 Z" />
        <Path d="M50 59 C 66 66, 96 78, 96 96 C 96 112, 75 119, 50 119 C 25 119, 4 112, 4 96 C 4 78, 34 66, 50 59 Z" />
      </G>
    </Svg>
  );
}
