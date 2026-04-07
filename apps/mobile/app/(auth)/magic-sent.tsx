import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "../../src/auth/useAuth";
import { authStyles, colors, fonts } from "../../src/lib/theme";

export default function MagicSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithMagicLink } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    await signInWithMagicLink(email);
    setResending(false);
    setResent(true);
    // Reset the "resent" badge after 4 seconds
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
      {/* ── Brand ── */}
      <Text style={authStyles.brand}>
        ward<Text style={authStyles.brandItalic}>robe</Text>
      </Text>

      {/* ── Main content — centered ── */}
      <View style={styles.center}>
        {/* Large envelope indicator */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>✉</Text>
        </View>

        <Text style={[authStyles.heading, { textAlign: "center" }]}>
          Check your{"\n"}email.
        </Text>

        <Text style={[authStyles.subheading, styles.desc]}>
          We sent a sign-in link to{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <Text style={styles.expiry}>Expires in 15 minutes</Text>
      </View>

      {/* ── Bottom actions ── */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        {/* Resend button */}
        <Pressable
          style={({ pressed }) => [
            authStyles.buttonGhost,
            pressed && styles.pressed,
          ]}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={colors.gray600} size="small" />
          ) : (
            <Text
              style={[
                authStyles.buttonGhostText,
                resent && { color: colors.black },
              ]}
            >
              {resent ? "Link resent" : "Didn't get it? Resend"}
            </Text>
          )}
        </Pressable>

        {/* Back to sign in */}
        <Pressable
          style={styles.backRow}
          onPress={() => router.replace("/(auth)/sign-in")}
        >
          <Text style={authStyles.footerText}>
            Back to <Text style={authStyles.footerLink}>sign in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 28,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 32,
  },
  desc: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: -4,
  },
  emailText: {
    fontFamily: fonts.medium,
    color: colors.black,
  },
  expiry: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: colors.gray400,
    letterSpacing: 0.3,
  },
  bottom: {
    gap: 16,
    paddingBottom: 24,
  },
  backRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
