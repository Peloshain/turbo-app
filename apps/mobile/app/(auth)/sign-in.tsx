import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@repo/auth-expo";
import {
  validateEmail,
  validatePassword,
  validateMagicLinkEmail,
} from "@repo/auth-core";
import { AuthInput } from "../../components/auth/AuthInput";
import { OAuthButton } from "../../components/auth/OAuthButton";
import { Divider } from "../../components/auth/Divider";

type Mode = "password" | "magic-link";

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signInWithOAuth } = useAuth();

  // ── Form state
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<"google" | "apple" | null>(
    null,
  );

  // ── Field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ── Validate and submit
  async function handleSubmit() {
    // Clear previous errors
    setEmailError(null);
    setPasswordError(null);

    if (mode === "password") {
      const eErr = validateEmail(email);
      const pErr = validatePassword(password);
      if (eErr) {
        setEmailError(eErr);
        return;
      }
      if (pErr) {
        setPasswordError(pErr);
        return;
      }

      setLoading(true);
      const result = await signIn({ type: "email", email, password });
      setLoading(false);

      if (!result.ok) {
        setEmailError(result.error ?? "Invalid email or password");
      }
      // If ok, AuthProvider updates state → app/index.tsx redirects to (tabs)
    }

    if (mode === "magic-link") {
      const eErr = validateMagicLinkEmail(email);
      if (eErr) {
        setEmailError(eErr);
        return;
      }

      setLoading(true);
      const result = await signIn({ type: "magic-link", email });
      setLoading(false);

      if (result.pendingVerification) {
        Alert.alert(
          "Check your inbox ✉️",
          `We sent a magic link to ${email}. Tap it to sign in.`,
          [{ text: "OK" }],
        );
      } else if (!result.ok) {
        setEmailError(result.error ?? "Could not send magic link");
      }
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoadingOAuth(provider);
    await signInWithOAuth(provider);
    setLoadingOAuth(null);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back button ── */}
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your wardrobe</Text>
        </View>

        {/* ── Mode switcher ── */}
        <View style={styles.modeSwitcher}>
          <Pressable
            style={[
              styles.modeTab,
              mode === "password" && styles.modeTabActive,
            ]}
            onPress={() => {
              setMode("password");
              setEmailError(null);
            }}
          >
            <Text
              style={[
                styles.modeLabel,
                mode === "password" && styles.modeLabelActive,
              ]}
            >
              Password
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeTab,
              mode === "magic-link" && styles.modeTabActive,
            ]}
            onPress={() => {
              setMode("magic-link");
              setEmailError(null);
            }}
          >
            <Text
              style={[
                styles.modeLabel,
                mode === "magic-link" && styles.modeLabelActive,
              ]}
            >
              Magic link ✨
            </Text>
          </Pressable>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <AuthInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setEmailError(null);
            }}
            keyboardType="email-address"
            error={emailError}
            returnKeyType={mode === "password" ? "next" : "done"}
            onSubmitEditing={mode === "magic-link" ? handleSubmit : undefined}
          />

          {mode === "password" && (
            <AuthInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setPasswordError(null);
              }}
              isPassword
              error={passwordError}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          )}

          {/* Forgot password — only in password mode */}
          {mode === "password" && (
            <Pressable style={styles.forgotButton} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          )}

          {/* Magic link hint */}
          {mode === "magic-link" && (
            <View style={styles.magicHint}>
              <Text style={styles.magicHintText}>
                ✉️ We'll send a one-tap sign-in link to your email. No password
                needed.
              </Text>
            </View>
          )}

          {/* Submit button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              loading && styles.submitButtonDisabled,
              pressed && !loading && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading
                ? mode === "magic-link"
                  ? "Sending..."
                  : "Signing in..."
                : mode === "magic-link"
                  ? "Send magic link"
                  : "Sign in"}
            </Text>
          </Pressable>
        </View>

        <Divider />

        {/* ── OAuth ── */}
        <View style={styles.oauth}>
          <OAuthButton
            provider="apple"
            onPress={() => handleOAuth("apple")}
            loading={loadingOAuth === "apple"}
          />
          <OAuthButton
            provider="google"
            onPress={() => handleOAuth("google")}
            loading={loadingOAuth === "google"}
          />
        </View>

        {/* ── Sign up link ── */}
        <View style={styles.signupRow}>
          <Text style={styles.signupHint}>Don't have an account? </Text>
          <Pressable
            onPress={() => router.replace("/(auth)/sign-up")}
            hitSlop={8}
          >
            <Text style={styles.signupLink}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FAFAF9" },
  container: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },

  // ── Navigation
  backButton: { alignSelf: "flex-start" },
  backText: { fontSize: 15, color: "#8E8E93", fontWeight: "500" },

  // ── Header
  header: { gap: 4 },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: "#8E8E93" },

  // ── Mode switcher
  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },
  modeLabelActive: {
    color: "#1C1C1E",
    fontWeight: "600",
  },

  // ── Form
  form: { gap: 14 },
  forgotButton: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
  magicHint: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 12,
  },
  magicHintText: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },

  // ── Submit
  submitButton: {
    height: 52,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  pressed: { opacity: 0.8 },

  // ── OAuth
  oauth: { gap: 10 },

  // ── Sign up
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupHint: { fontSize: 14, color: "#8E8E93" },
  signupLink: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
});
