import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#FFFFFF',
  surface: '#F5F6F8',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  accent: '#1F3864',
  accentBg: '#E8ECF3',
  success: '#1E8E5A',
  successBg: '#E5F5EC',
  border: '#E5E7EB',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const globalStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: spacing.md,
  },
});