// Rush design tokens, taken from the Figma file (page "ui"):
// warm cream background, black ink, black 1.5px outlines and black buttons,
// Montserrat type. Red is reserved for emergencies.

export const Colors = {
  background: '#F8F5EC',
  surface: '#FFFDF8',
  ink: '#111111',
  text: '#111111',
  textMuted: '#5E5B53',
  placeholder: '#9A968C',
  border: '#111111',
  hairline: '#E4DFD2',
  primary: '#111111',
  primaryPressed: '#333333',
  onPrimary: '#FFFFFF',
  link: '#3B6FD8',
  avatar: '#6C5CE7',
  danger: '#C62828',
  dangerPressed: '#A31F1F',
  dangerSoft: '#FBE7E4',
  warning: '#9A5B00',
  // Pastel chips used on the profile screen.
  peach: '#F2D3C4',
  sky: '#C9DAF2',
  mint: '#D3EBC9',
  overlay: 'rgba(17,17,17,0.04)',
} as const;

export const Fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extrabold: 'Montserrat_800ExtraBold',
} as const;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const Radius = { sm: 8, md: 10, lg: 14, xl: 22, pill: 999 } as const;

/** The Figma outline weight. */
export const Stroke = 1.5;

// Custom fonts carry their own weight, so no fontWeight here (it would make
// Android pick a fallback font).
export const Type = {
  display: { fontFamily: Fonts.extrabold, fontSize: 30, lineHeight: 36 },
  title: { fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 23 },
  bodyBold: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  smallBold: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: Fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
} as const;

/** Keeps content phone-width on tablets and wide browser windows. */
export const MaxContentWidth = 560;

/** Smallest comfortable tap target. */
export const MinTap = 48;
