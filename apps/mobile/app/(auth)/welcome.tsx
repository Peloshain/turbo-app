import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "@repo/auth-expo";
import { OAuthButton } from "../../components/auth/OAuthButton";
import { Divider } from "../../components/auth/Divider";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithOAuth } = useAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  async function handleOAuth(provider: "google" | "apple") {
    const setLoading =
      provider === "google" ? setLoadingGoogle : setLoadingApple;
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Branding ── */}
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>👗</Text>
        </View>
        <Text style={styles.appName}>Wardrobe</Text>
        <Text style={styles.tagline}>
          Your AI-powered personal stylist.{"\n"}
          Build outfits from what you already own.
        </Text>
      </View>

      {/* ── Auth options ── */}
      <View style={styles.actions}>
        {/* OAuth — primary options */}
        <OAuthButton
          provider="apple"
          onPress={() => handleOAuth("apple")}
          loading={loadingApple}
        />
        <OAuthButton
          provider="google"
          onPress={() => handleOAuth("google")}
          loading={loadingGoogle}
        />

        <Divider />

        {/* Email options */}
        <Pressable
          style={({ pressed }) => [
            styles.emailButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.emailButtonText}>Create account with email</Text>
        </Pressable>

        {/* Already have account */}
        <View style={styles.signinRow}>
          <Text style={styles.signinHint}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/sign-in")} hitSlop={8}>
            <Text style={styles.signinLink}>Sign in</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Legal ── */}
      <Text style={styles.legal}>
        By continuing, you agree to our{" "}
        <Text style={styles.legalLink}>Terms of Service</Text> and{" "}
        <Text style={styles.legalLink}>Privacy Policy</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#FAFAF9",
    justifyContent: "space-between",
  },

  // ── Hero
  hero: {
    alignItems: "center",
    paddingTop: 48,
    gap: 12,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Actions
  actions: {
    gap: 12,
    paddingVertical: 32,
  },
  emailButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  pressed: {
    opacity: 0.7,
  },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  signinHint: {
    fontSize: 14,
    color: "#8E8E93",
  },
  signinLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  // ── Legal
  legal: {
    fontSize: 12,
    color: "#C7C7CC",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  legalLink: {
    color: "#8E8E93",
    fontWeight: "500",
  },
});
