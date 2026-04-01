import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@repo/auth-expo";
import { validateEmail, validatePassword } from "@repo/auth-core";
import { AuthInput } from "../../components/auth/AuthInput";
import { OAuthButton } from "../../components/auth/OAuthButton";
import { Divider } from "../../components/auth/Divider";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signInWithOAuth } = useAuth();

  // ── Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<"google" | "apple" | null>(
    null,
  );

  // ── Field errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function validate(): boolean {
    let valid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    }

    const eErr = validateEmail(email);
    if (eErr) {
      setEmailError(eErr);
      valid = false;
    }

    const pErr = validatePassword(password);
    if (pErr) {
      setPasswordError(pErr);
      valid = false;
    }

    if (password !== confirm) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    return valid;
  }

  async function handleSubmit() {
    // Clear all errors before revalidating
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

    if (!validate()) return;

    setLoading(true);
    const result = await signUp({ email, password, name });
    setLoading(false);

    if (!result.ok) {
      // Show the error on the email field — most common cause is duplicate email
      setEmailError(result.error ?? "Could not create account");
    }
    // If ok, AuthProvider updates state → app/index.tsx redirects to (tabs)
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start building your wardrobe</Text>
        </View>

        {/* ── OAuth — show first, it's the easiest path ── */}
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

        <Divider label="or sign up with email" />

        {/* ── Form ── */}
        <View style={styles.form}>
          <AuthInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setNameError(null);
            }}
            autoCapitalize="words"
            error={nameError}
            returnKeyType="next"
          />
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
            returnKeyType="next"
          />
          <AuthInput
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordError(null);
            }}
            isPassword
            error={passwordError}
            returnKeyType="next"
          />
          <AuthInput
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              setConfirmError(null);
            }}
            isPassword
            error={confirmError}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {/* Submit */}
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
              {loading ? "Creating account..." : "Create account"}
            </Text>
          </Pressable>
        </View>

        {/* ── Sign in link ── */}
        <View style={styles.signinRow}>
          <Text style={styles.signinHint}>Already have an account? </Text>
          <Pressable
            onPress={() => router.replace("/(auth)/sign-in")}
            hitSlop={8}
          >
            <Text style={styles.signinLink}>Sign in</Text>
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

  // ── OAuth
  oauth: { gap: 10 },

  // ── Form
  form: { gap: 14 },
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

  // ── Sign in
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinHint: { fontSize: 14, color: "#8E8E93" },
  signinLink: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
});
