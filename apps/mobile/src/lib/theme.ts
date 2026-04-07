import { StyleSheet } from "react-native";

// ── Palette ───────────────────────────────────────────────
export const colors = {
  black: "#0A0A0A",
  white: "#FAFAF9",
  gray100: "#F2F2F7",
  gray200: "#E5E5EA",
  gray400: "#C7C7CC",
  gray600: "#8E8E93",
  error: "#DC2626",
  errorLight: "#FFF2F2",
  errorBorder: "#FFCDD2",
};

// ── Typography ────────────────────────────────────────────
export const fonts = {
  serif: "DMSerif-Regular",
  serifItalic: "DMSerif-Italic",
  light: "DMSans-Light",
  regular: "DMSans-Regular",
  medium: "DMSans-Medium",
};

// ── Shared auth screen styles ─────────────────────────────
// Imported by every auth screen to keep them visually consistent.
export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 28,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.black,
    letterSpacing: -0.5,
  },
  brandItalic: {
    fontFamily: fonts.serifItalic,
    color: colors.gray600,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    color: colors.black,
    letterSpacing: -0.8,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.gray600,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputBase: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.black,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: "transparent",
  },
  inputFocused: {
    borderBottomColor: colors.black,
  },
  inputError: {
    borderBottomColor: colors.error,
  },
  buttonPrimary: {
    backgroundColor: colors.black,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center" as const,
  },
  buttonPrimaryText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
    letterSpacing: 0.2,
  },
  buttonGhost: {
    borderWidth: 0.5,
    borderColor: colors.gray200,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  buttonGhostText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.gray600,
  },
  dividerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.gray400,
  },
  errorBar: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 2,
    borderLeftColor: colors.error,
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.gray600,
    textAlign: "center" as const,
  },
  footerLink: {
    fontFamily: fonts.medium,
    color: colors.black,
  },
});
