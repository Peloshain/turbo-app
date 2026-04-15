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
import { authClient } from "../../lib/auth-client";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthErrorBar } from "../../components/auth/AuthErrorBar";
import { AuthDivider } from "../../components/auth/AuthDivider";
import { SocialButtons } from "../../components/auth/SocialButtons";
import { validateEmail, validatePassword } from "../../lib/validators";

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function clearFieldError(field: keyof typeof fieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Email + password sign in ──────────────────────────
  // async function handleSignIn() {
  //   if (!validate()) return;
  //   setLoading(true);
  //   setError(null);

  //   const { data, error } = await authClient.signIn.email({
  //     email,
  //     password,
  //     callbackURL: "/(tabs)",
  //   });

  //   setLoading(false);

  //   if (error) {
  //     setError(error.message ?? "Incorrect email or password");
  //   }
  //   // AuthGate handles redirect on successful session
  // }
  const handleSignIn = async () => {
    try {
      setLoading(true);

      await authClient.signIn.email({
        email,
        password,
      });

      router.replace("/(tabs)");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Magic link ────────────────────────────────────────
  async function handleMagicLink() {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: "Enter your email first to send a magic link" });
      return;
    }
    setMagicLoading(true);
    setError(null);

    // const { error } = await authClient.signIn.magicLink({
    //   email,
    //   callbackURL: "wardrobe://auth/verify",
    // });

    const error = false;

    setMagicLoading(false);

    if (error) {
      setError("Could not send magic link");
    } else {
      router.push({ pathname: "/(auth)/magic-sent", params: { email } });
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand ── */}
        <Text style={styles.brand}>wardrobe</Text>

        {/* ── Heading ── */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Welcome{"\n"}back.</Text>
          <Text style={styles.subheading}>Sign in to your wardrobe</Text>
        </View>

        {/* ── Error bar ── */}
        {error && <AuthErrorBar message={error} />}

        {/* ── Form ── */}
        <AuthInput
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clearFieldError("email");
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
            clearFieldError("password");
          }}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          error={fieldErrors.password}
        />

        {/* ── Forgot password ── */}
        <Pressable
          style={styles.forgotRow}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        {/* ── Primary CTA ── */}
        <Pressable
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FAFAF9" size="small" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Continue</Text>
          )}
        </Pressable>

        <AuthDivider />

        {/* ── Magic link ── */}
        <Pressable
          style={[styles.buttonGhost, magicLoading && styles.buttonDisabled]}
          onPress={handleMagicLink}
          disabled={magicLoading}
        >
          {magicLoading ? (
            <ActivityIndicator color="#8E8E93" size="small" />
          ) : (
            <Text style={styles.buttonGhostText}>Send magic link instead</Text>
          )}
        </Pressable>

        {/* ── Social ── */}
        <View style={{ marginTop: 8 }}>
          <SocialButtons />
        </View>

        {/* ── Footer ── */}
        <Pressable
          style={styles.footer}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.footerText}>
            No account? <Text style={styles.footerLink}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 28,
  },
  content: {
    paddingBottom: 48,
    flexGrow: 1,
  },
  brand: {
    fontSize: 18,
    fontWeight: "500",
    color: "#0A0A0A",
    letterSpacing: -0.5,
  },
  headingBlock: {
    marginTop: 40,
    marginBottom: 36,
    gap: 8,
  },
  heading: {
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 42,
    color: "#0A0A0A",
    letterSpacing: -0.8,
  },
  subheading: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  buttonPrimary: {
    backgroundColor: "#0A0A0A",
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FAFAF9",
    letterSpacing: 0.2,
  },
  buttonGhost: {
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonGhostText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 36,
    paddingBottom: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  footerLink: {
    fontWeight: "500",
    color: "#0A0A0A",
  },
});
