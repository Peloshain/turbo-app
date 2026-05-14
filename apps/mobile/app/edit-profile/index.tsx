import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";

// ─── Inline feedback ──────────────────────────────────────────────────────────
function Feedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (success) return <Text style={styles.success}>{success}</Text>;
  return null;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  // Name
  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  // Email
  // NOTE: requires `user.changeEmail.enabled: true` in your server auth config.
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // ── Save name ──────────────────────────────────────────────────────────────
  async function handleSaveName() {
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    setNameError(null);
    setNameSuccess(null);
    setNameLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) {
        setNameError(error.message ?? "Failed to update name.");
      } else {
        await refetch();
        setNameSuccess("Name updated.");
      }
    } catch (e: any) {
      setNameError(e?.message ?? "An unexpected error occurred.");
    } finally {
      setNameLoading(false);
    }
  }

  // ── Save email ─────────────────────────────────────────────────────────────
  async function handleSaveEmail() {
    if (!email.trim()) {
      setEmailError("Email cannot be empty.");
      return;
    }
    if (email.trim() === user?.email) {
      setEmailError("This is already your current email.");
      return;
    }
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: email.trim(),
        callbackURL: "/", // deep-link or URL opened after email verification
      });
      if (error) {
        setEmailError(error.message ?? "Failed to request email change.");
      } else {
        setEmailSuccess(
          "Verification email sent. Check your inbox to confirm.",
        );
      }
    } catch (e: any) {
      setEmailError(e?.message ?? "An unexpected error occurred.");
    } finally {
      setEmailLoading(false);
    }
  }

  // ── Save password ──────────────────────────────────────────────────────────
  async function handleSavePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        setPasswordError(error.message ?? "Failed to change password.");
      } else {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e: any) {
      setPasswordError(e?.message ?? "An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Name ── */}
      <Section title="Display Name">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setNameError(null);
            setNameSuccess(null);
          }}
          autoCapitalize="words"
          placeholder="Your name"
        />
        <Feedback error={nameError} success={nameSuccess} />
        <TouchableOpacity
          style={[styles.button, nameLoading && styles.buttonDisabled]}
          onPress={handleSaveName}
          disabled={nameLoading}
        >
          {nameLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Name</Text>
          )}
        </TouchableOpacity>
      </Section>

      {/* ── Email ── */}
      <Section title="Email Address">
        <Text style={styles.hint}>
          A verification link will be sent to your new address before the change
          takes effect.
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setEmailError(null);
            setEmailSuccess(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Feedback error={emailError} success={emailSuccess} />
        <TouchableOpacity
          style={[styles.button, emailLoading && styles.buttonDisabled]}
          onPress={handleSaveEmail}
          disabled={emailLoading}
        >
          {emailLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Request Email Change</Text>
          )}
        </TouchableOpacity>
      </Section>

      {/* ── Password ── */}
      <Section title="Change Password">
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={(v) => {
            setCurrentPassword(v);
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
          secureTextEntry
          placeholder="Current password"
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={(v) => {
            setNewPassword(v);
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
          secureTextEntry
          placeholder="New password"
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
          secureTextEntry
          placeholder="Confirm new password"
        />
        <Feedback error={passwordError} success={passwordSuccess} />
        <TouchableOpacity
          style={[styles.button, passwordLoading && styles.buttonDisabled]}
          onPress={handleSavePassword}
          disabled={passwordLoading}
        >
          {passwordLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </Section>
    </ScrollView>
  );
}

const ACCENT = "#111";
const MUTED = "#888";
const RED = "#C0392B";
const GREEN = "#1a7a4a";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F5" },
  content: { padding: 24, paddingBottom: 60, gap: 24 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },

  button: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  error: { color: RED, fontSize: 13 },
  success: { color: GREEN, fontSize: 13 },
});
