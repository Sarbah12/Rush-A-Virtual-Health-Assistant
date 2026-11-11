import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Fonts, MaxContentWidth, MinTap, Radius, Spacing, Stroke, Type } from '@/constants/theme';
import { initials } from '@/lib/medical-id';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Variant = keyof typeof Type;

export function T({
  variant = 'body',
  color = Colors.text,
  style,
  ...props
}: TextProps & { variant?: Variant; color?: string }) {
  return <Text {...props} style={[Type[variant], { color }, style]} />;
}

/** Cream page with a centred phone-width column, like every Figma frame. */
export function Screen({
  children,
  back,
  edges = ['top'],
  scroll = true,
  footer,
}: {
  children: ReactNode;
  /** Shows the Figma "< Back" link above the content. */
  back?: boolean;
  edges?: Edge[];
  scroll?: boolean;
  /** Pinned below the scroll area, e.g. a Save button. */
  footer?: ReactNode;
}) {
  const inner = (
    <View style={styles.column}>
      {back ? <BackLink /> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1 }]}>{inner}</View>
      )}
      {footer ? (
        <View style={styles.footer}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function BackLink({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={styles.back}>
      <Ionicons name="chevron-back" size={18} color={Colors.ink} />
      <T variant="body">Back</T>
    </Pressable>
  );
}

export function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      <T variant="title" accessibilityRole="header">
        {children}
      </T>
      {subtitle ? <T color={Colors.textMuted}>{subtitle}</T> : null}
    </View>
  );
}

export function Card({
  children,
  style,
  tone = 'plain',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'plain' | 'danger' | 'soft';
}) {
  return <View style={[styles.card, tone !== 'plain' && toneStyles[tone], style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <T variant="label" color={Colors.textMuted} style={{ marginTop: Spacing.sm, marginBottom: -Spacing.xs }}>
      {children.toUpperCase()}
    </T>
  );
}

export function Button({
  label,
  onPress,
  icon,
  kind = 'primary',
  disabled,
  accessibilityHint,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  kind?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const p = buttonPalette[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? p.pressed : p.bg, borderColor: p.border },
        disabled && { opacity: 0.45 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={p.fg} /> : null}
      <T variant="bodyBold" color={p.fg}>
        {label}
      </T>
    </Pressable>
  );
}

/** Outlined text box with an optional icon on the right, as in the Figma forms. */
export function Field({
  label,
  error,
  icon,
  multiline,
  hideLabel,
  ...props
}: TextInputProps & { label: string; error?: string; icon?: IconName; hideLabel?: boolean }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      {hideLabel ? null : <T variant="smallBold">{label}</T>}
      <View style={[styles.inputWrap, multiline && styles.multiline, error ? styles.inputError : null]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          multiline={multiline}
          placeholderTextColor={Colors.placeholder}
          style={[styles.input, multiline && { textAlignVertical: 'top', minHeight: 80 }]}
        />
        {icon ? <Ionicons name={icon} size={18} color={Colors.textMuted} /> : null}
      </View>
      {error ? (
        <T variant="small" color={Colors.danger} accessibilityLiveRegion="polite">
          {error}
        </T>
      ) : null}
    </View>
  );
}

/** Single-choice pill row (blood group, sex, genotype). */
export function Choice<V extends string>({
  label,
  options,
  value,
  onChange,
  noneLabel,
}: {
  label: string;
  options: readonly V[];
  value: V | '';
  onChange: (v: V | '') => void;
  /** Adds a first pill meaning "not sure / not given". */
  noneLabel?: string;
}) {
  const all: (V | '')[] = noneLabel ? ['', ...options] : [...options];
  return (
    <View style={{ gap: Spacing.sm }}>
      <T variant="smallBold">{label}</T>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {all.map((o) => {
          const selected = value === o;
          return (
            <Pressable
              key={o || 'none'}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(o)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <T variant="smallBold" color={selected ? Colors.onPrimary : Colors.ink}>
                {o || noneLabel}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Outlined settings-style row with a leading icon and a chevron. */
export function ListRow({
  icon,
  label,
  detail,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? Colors.danger : Colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, danger && { borderColor: Colors.danger }, pressed && { backgroundColor: Colors.overlay }]}>
      <Ionicons name={icon} size={18} color={color} />
      <View style={{ flex: 1 }}>
        <T variant="bodyBold" color={color}>
          {label}
        </T>
        {detail ? (
          <T variant="small" color={Colors.textMuted}>
            {detail}
          </T>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={color} />
    </Pressable>
  );
}

/** Stand-in for the Figma RUSH mark until the exported logo is added. */
export function Logo({ size = 64, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: Spacing.sm }} accessible accessibilityLabel="Rush">
      <View style={[styles.logoMark, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Ionicons name="hourglass" size={size * 0.6} color={Colors.onPrimary} />
      </View>
      {wordmark ? (
        <Text style={{ fontFamily: Fonts.extrabold, fontSize: size * 0.34, letterSpacing: 1.5, color: Colors.ink }}>
          RUSH
        </Text>
      ) : null}
    </View>
  );
}

/** Purple rounded-square avatar from the Figma, showing initials. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const text = initials(name);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.28 }]}>
      {text ? (
        <Text style={{ fontFamily: Fonts.bold, fontSize: size * 0.38, color: Colors.onPrimary }}>{text}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={Colors.onPrimary} />
      )}
    </View>
  );
}

/** Placeholder for the Figma's 3D doctor illustrations. */
export function Art({ icon, size = 72, tint = Colors.ink }: { icon: IconName; size?: number; tint?: string }) {
  return (
    <View style={[styles.art, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={icon} size={size * 0.48} color={tint} />
    </View>
  );
}

export function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <T variant="label">{label}</T>
    </View>
  );
}

const buttonPalette = {
  primary: { bg: Colors.primary, pressed: Colors.primaryPressed, fg: Colors.onPrimary, border: Colors.primary },
  secondary: { bg: 'transparent', pressed: Colors.overlay, fg: Colors.ink, border: Colors.border },
  danger: { bg: Colors.danger, pressed: Colors.dangerPressed, fg: Colors.onPrimary, border: Colors.danger },
} as const;

const toneStyles = StyleSheet.create({
  danger: { backgroundColor: Colors.dangerSoft, borderColor: Colors.danger },
  soft: { backgroundColor: Colors.background, borderColor: Colors.hairline },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.lg },
  footer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.background },
  footerInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.sm },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 36 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    minHeight: MinTap,
    borderRadius: Radius.sm,
    borderWidth: Stroke,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  inputWrap: {
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
  multiline: { alignItems: 'flex-start', paddingVertical: Spacing.sm },
  input: { ...Type.body, flex: 1, color: Colors.text, paddingVertical: Spacing.sm, outlineStyle: 'none' } as never,
  inputError: { borderColor: Colors.danger },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    minHeight: 40,
    minWidth: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: Stroke,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: Colors.ink },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  logoMark: { backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatar: { backgroundColor: Colors.avatar, alignItems: 'center', justifyContent: 'center', borderWidth: Stroke, borderColor: Colors.ink },
  art: { backgroundColor: Colors.surface, borderWidth: Stroke, borderColor: Colors.hairline, alignItems: 'center', justifyContent: 'center' },
  pill: {
    alignSelf: 'center',
    borderWidth: Stroke,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
