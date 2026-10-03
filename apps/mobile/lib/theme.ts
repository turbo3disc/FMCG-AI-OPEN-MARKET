// Bright friendly theme — StyleSheet-friendly constants.
// Palette: primary #00A651, dark #00703A, accent #FFB800, info #00A8E8,
// danger/coral #FF6B4A, background #FFFDF6.
import { StyleSheet } from 'react-native';

export const palette = {
  primary: '#00A651',
  primaryDark: '#00703A',
  accent: '#FFB800',
  info: '#00A8E8',
  danger: '#FF6B4A',
  background: '#FFFDF6',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#EAE3D3',
  success: '#00A651',
  warning: '#FFB800',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 6, md: 10, lg: 16 } as const;
export const fontSize = { caption: 12, body: 14, title: 18, display: 24 } as const;

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background, padding: spacing.lg },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.title, fontWeight: '700', color: palette.text },
  body: { fontSize: fontSize.body, color: palette.text },
  muted: { fontSize: fontSize.caption, color: palette.muted },
  btn: {
    backgroundColor: palette.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.body },
  btnSecondary: {
    backgroundColor: palette.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: fontSize.body,
  },
});
