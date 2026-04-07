import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/useAuth";
import { AuthInput } from "../../components/auth/AuthInput";
import { SocialButtons } from "../../components/auth/SocialButtons";
import { authStyles, colors, fonts } from "../../src/lib/theme";
import { validateEmail, validatePassword } from "@repo/auth";

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signInWithMagicLink } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // ── Validate fields before submitting ─────────────────
  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Email + password sign in ───────────────────────────
  async function handleSignIn() {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    const result = await signInWithEmail(email, password);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    // Navigation is handled inside useAuth after successful sign in
  }

  // ── Magic link ─────────────────────────────────────────
  async function handleMagicLink() {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: "Enter your email first to send a magic link" });
      return;
    }
    setMagicLoading(true);
    setError(null);
    const result = await signInWithMagicLink(email);
    setMagicLoading(false);

    if (result.ok) {
      router.push({ pathname: "/(auth)/magic-sent", params: { email } });
    } else {
      setError(result.error ?? "Could not send magic link");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={authStyles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand ── */}
        <Text style={authStyles.brand}>
          ward<Text style={authStyles.brandItalic}>robe</Text>
        </Text>

        {/* ── Heading ── */}
        <View style={styles.headingBlock}>
          <Text style={authStyles.heading}>Welcome{"\n"}back.</Text>
          <Text style={[authStyles.subheading, { marginTop: 8 }]}>
            Sign in to your wardrobe
          </Text>
        </View>

        {/* ── Global error bar ── */}
        {error && (
          <View style={authStyles.errorBar}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Form ── */}
        <AuthInput
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setFieldErrors((e) => ({ ...e, email: undefined }));
          }}
          keyboardType="email-address"
          returnKeyType="next"
          error={fieldErrors.email}
          autoFocus
        />
        <AuthInput
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setFieldErrors((e) => ({ ...e, password: undefined }));
          }}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          error={fieldErrors.password}
        />

        {/* Forgot password link */}
        <Pressable
          style={styles.forgotRow}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        {/* ── Primary CTA ── */}
        <Pressable
          style={({ pressed }) => [
            authStyles.buttonPrimary,
            loading && styles.buttonLoading,
            pressed && !loading && styles.pressed,
          ]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={authStyles.buttonPrimaryText}>Continue</Text>
          )}
        </Pressable>

        {/* ── Divider ── */}
        <View style={authStyles.dividerRow}>
          <View style={authStyles.dividerLine} />
          <Text style={authStyles.dividerText}>or</Text>
          <View style={authStyles.dividerLine} />
        </View>

        {/* ── Magic link button ── */}
        <Pressable
          style={({ pressed }) => [
            authStyles.buttonGhost,
            pressed && styles.pressed,
          ]}
          onPress={handleMagicLink}
          disabled={magicLoading}
        >
          {magicLoading ? (
            <ActivityIndicator color={colors.gray600} size="small" />
          ) : (
            <Text style={authStyles.buttonGhostText}>
              Send magic link instead
            </Text>
          )}
        </Pressable>

        {/* ── Social providers ── */}
        <View style={styles.socialBlock}>
          <SocialButtons />
        </View>

        {/* ── Footer ── */}
        <Pressable
          style={styles.footer}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={authStyles.footerText}>
            No account? <Text style={authStyles.footerLink}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
    flexGrow: 1,
  },
  headingBlock: {
    marginTop: 40,
    marginBottom: 36,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.gray600,
  },
  socialBlock: {
    marginTop: 8,
    gap: 8,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 36,
    paddingBottom: 8,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.75,
  },
});
