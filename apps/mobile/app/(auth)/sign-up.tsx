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

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  function clearFieldError(field: keyof typeof fieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) errors.name = "Name is required";
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (error) setError(error.message ?? "Sign-up failed.");
      // On success, session updates and _layout redirects to (tabs).
    } catch (e: any) {
      setError(e?.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.heading}>Build your{"\n"}wardrobe.</Text>
          <Text style={styles.subheading}>
            Create your account to get started
          </Text>
        </View>

        {/* ── Error bar ── */}
        {error && <AuthErrorBar message={error} />}

        {/* ── Form ── */}
        <AuthInput
          label="Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            clearFieldError("name");
          }}
          autoCapitalize="words"
          returnKeyType="next"
          error={fieldErrors.name}
          autoFocus
        />
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
          onSubmitEditing={handleSignUp}
          error={fieldErrors.password}
        />

        {/* ── Primary CTA ── */}
        <View style={{ marginTop: 8 }}>
          <Pressable
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FAFAF9" size="small" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <AuthDivider label="or sign up with" />

        <SocialButtons />

        {/* ── Terms ── */}
        <Text style={styles.terms}>
          By continuing you agree to our{" "}
          <Text style={styles.termsLink}>Terms</Text> and{" "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        {/* ── Footer ── */}
        <Pressable style={styles.footer} onPress={() => router.back()}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.footerLink}>Sign in</Text>
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
  buttonDisabled: {
    opacity: 0.6,
  },
  terms: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "500",
    color: "#0A0A0A",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 32,
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
