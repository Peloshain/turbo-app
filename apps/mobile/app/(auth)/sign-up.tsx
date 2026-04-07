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

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUpWithEmail } = useAuth();

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

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    console.log("Signing up with", { name, email, password });

    const result = await signUpWithEmail(email, password, name.trim());

    console.log("Sign up result", result);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
    }
    // On success, useAuth navigates to /(tabs) automatically
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
          <Text style={authStyles.heading}>Build your{"\n"}wardrobe.</Text>
          <Text style={[authStyles.subheading, { marginTop: 8 }]}>
            Create your account to get started
          </Text>
        </View>

        {/* ── Global error ── */}
        {error && (
          <View style={authStyles.errorBar}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        )}

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
        <View style={styles.ctaBlock}>
          <Pressable
            style={({ pressed }) => [
              authStyles.buttonPrimary,
              loading && styles.buttonLoading,
              pressed && !loading && styles.pressed,
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={authStyles.buttonPrimaryText}>Create account</Text>
            )}
          </Pressable>
        </View>

        {/* ── Divider + social ── */}
        <View style={authStyles.dividerRow}>
          <View style={authStyles.dividerLine} />
          <Text style={authStyles.dividerText}>or sign up with</Text>
          <View style={authStyles.dividerLine} />
        </View>

        <SocialButtons />

        {/* ── Terms ── */}
        <Text style={[authStyles.footerText, styles.terms]}>
          By continuing you agree to our{" "}
          <Text style={authStyles.footerLink}>Terms</Text> and{" "}
          <Text style={authStyles.footerLink}>Privacy Policy</Text>
        </Text>

        {/* ── Footer ── */}
        <Pressable style={styles.footer} onPress={() => router.back()}>
          <Text style={authStyles.footerText}>
            Already have an account?{" "}
            <Text style={authStyles.footerLink}>Sign in</Text>
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
  ctaBlock: {
    marginTop: 8,
  },
  terms: {
    fontSize: 12,
    marginTop: 16,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 32,
    paddingBottom: 8,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.75,
  },
});
