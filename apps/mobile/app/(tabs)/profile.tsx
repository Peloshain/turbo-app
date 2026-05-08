import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { authClient } from "../../lib/auth-client";
import { useCallback } from "react";

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    items,
    outfits,
    stats,
    loading,
    error,
    refetch,
    aiHelperEnabled,
    aiToggleLoading,
    toggleAiHelper,
  } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  async function handleSignOut() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await authClient.signOut();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar + identity */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? "—"}</Text>
        <Text style={styles.email}>{user?.email ?? "—"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <View style={styles.sumarizedStats}>
          <View style={styles.totalRow}>
            <Text style={styles.totalCount}>{items.length}</Text>
            <Text style={styles.totalLabel}>items in wardrobe</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalCount}>{outfits.length}</Text>
            <Text style={styles.totalLabel}>outfits created</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : stats.length > 0 ? (
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCell}>
                <Text style={styles.statCount}>{s.count}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No items yet.</Text>
        )}
      </View>

      {/* ── AI Helper toggle ── */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>AI Helper</Text>
            <Text style={styles.toggleSubtitle}>
              {aiHelperEnabled
                ? "Auto-detects colors & names, generates outfits"
                : "Manual entry only, no AI features"}
            </Text>
          </View>
          {aiToggleLoading ? (
            <ActivityIndicator />
          ) : (
            <Switch
              value={aiHelperEnabled}
              onValueChange={toggleAiHelper}
              trackColor={{ false: "#ddd", true: ACCENT }}
              thumbColor="#fff"
            />
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const ACCENT = "#111";
const RED = "#C0392B";
const MUTED = "#888";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F5" },
  content: { padding: 24, paddingBottom: 48, gap: 24 },
  hero: { alignItems: "center", paddingVertical: 16, gap: 6 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  initials: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  name: { fontSize: 22, fontWeight: "700", color: ACCENT, letterSpacing: -0.3 },
  email: { fontSize: 14, color: MUTED },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sumarizedStats: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 20,
  },
  totalCount: {
    fontSize: 35,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: -1,
  },
  totalLabel: { fontSize: 13, color: MUTED, flexShrink: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCell: {
    backgroundColor: "#F7F7F5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: "44%",
    flex: 1,
  },
  statCount: { fontSize: 24, fontWeight: "700", color: ACCENT },
  statLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyText: { color: MUTED, fontSize: 14, textAlign: "center", marginTop: 8 },
  errorText: { color: RED, fontSize: 14, marginTop: 8 },
  actions: { gap: 12 },
  editButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  editButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  signOutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: RED,
  },
  signOutText: { color: RED, fontSize: 16, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  toggleText: { flex: 1, gap: 4 },
  toggleTitle: { fontSize: 16, fontWeight: "600", color: ACCENT },
  toggleSubtitle: { fontSize: 13, color: MUTED, lineHeight: 18 },
});
