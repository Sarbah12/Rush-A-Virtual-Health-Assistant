import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { T } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';

type Point = { t: number; y: number; y2?: number };

/**
 * Minimal line chart in the Figma ink style. Draws a second dashed line for
 * y2 (diastolic blood pressure) when present.
 */
export function LineChart({ points, height = 180, decimals = 0, label }: { points: Point[]; height?: number; decimals?: number; label: string }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // The measuring wrapper is always mounted, so the width is known before
  // the readings finish loading.
  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      {points.length === 0 ? (
        <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
          <T color={Colors.textMuted}>No readings in this period yet.</T>
        </View>
      ) : (
        <Chart points={points} height={height} decimals={decimals} label={label} width={width} />
      )}
    </View>
  );
}

function Chart({ points, height, decimals, label, width }: { points: Point[]; height: number; decimals: number; label: string; width: number }) {

  const pad = { l: 36, r: 12, t: 12, b: 22 };
  const ys = points.flatMap((p) => (p.y2 != null ? [p.y, p.y2] : [p.y]));
  let lo = Math.min(...ys);
  let hi = Math.max(...ys);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  lo -= span * 0.1;
  hi += span * 0.1;
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const w = Math.max(width - pad.l - pad.r, 1);
  const h = height - pad.t - pad.b;
  const x = (t: number) => pad.l + (t1 === t0 ? w / 2 : ((t - t0) / (t1 - t0)) * w);
  const y = (v: number) => pad.t + h - ((v - lo) / (hi - lo)) * h;
  const line = (key: 'y' | 'y2') =>
    points.filter((p) => p[key] != null).map((p) => `${x(p.t)},${y(p[key] as number)}`).join(' ');
  const ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15];
  const fmtDay = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const hasY2 = points.some((p) => p.y2 != null);

  return (
    <View accessible accessibilityLabel={`${label} chart with ${points.length} readings`}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {ticks.map((v) => (
            <Line key={v} x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} stroke={Colors.hairline} strokeWidth={1} />
          ))}
          {ticks.map((v) => (
            <SvgText key={`l${v}`} x={pad.l - 6} y={y(v) + 4} fontSize={10} fontFamily={Fonts.regular} fill={Colors.textMuted} textAnchor="end">
              {v.toFixed(decimals)}
            </SvgText>
          ))}
          <SvgText x={pad.l} y={height - 6} fontSize={10} fontFamily={Fonts.regular} fill={Colors.textMuted}>
            {fmtDay(t0)}
          </SvgText>
          {t1 !== t0 ? (
            <SvgText x={width - pad.r} y={height - 6} fontSize={10} fontFamily={Fonts.regular} fill={Colors.textMuted} textAnchor="end">
              {fmtDay(t1)}
            </SvgText>
          ) : null}
          {points.length > 1 ? <Polyline points={line('y')} fill="none" stroke={Colors.ink} strokeWidth={2} /> : null}
          {hasY2 && points.length > 1 ? (
            <Polyline points={line('y2')} fill="none" stroke={Colors.ink} strokeWidth={1.5} strokeDasharray="4 4" />
          ) : null}
          {points.map((p) => (
            <Circle key={`a${p.t}`} cx={x(p.t)} cy={y(p.y)} r={3.5} fill={Colors.surface} stroke={Colors.ink} strokeWidth={1.5} />
          ))}
          {points.filter((p) => p.y2 != null).map((p) => (
            <Circle key={`b${p.t}`} cx={x(p.t)} cy={y(p.y2 as number)} r={3} fill={Colors.ink} />
          ))}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}
