import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategories } from "../../hooks/useCategories";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newName, setNewName] = useState("");

  const {
    categories,
    isLoading,
    add,
    isAdding,
    addError,
    remove,
    isRemoving,
    removeError,
    resetAddError,
    resetRemoveError,
  } = useCategories();

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    resetAddError();
    add(trimmed, {
      onSuccess: () => setNewName(""),
    });
  }

  function handleDelete(id: string, name: string) {
    resetRemoveError();
    Alert.alert(`Delete "${name}"?`, "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          remove(id, {
            onError: (e) => {
              // Surface the server block message in an alert for clarity
              Alert.alert("Cannot delete", e.message);
            },
          }),
      },
    ]);
  }

  const canAdd =
    newName.trim().length > 0 &&
    !categories.some(
      (c) =>
        c.slug === slugify(newName) ||
        c.name.toLowerCase() === newName.trim().toLowerCase(),
    );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <Pressable onPress={() => router.back()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Add new category ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>New Category</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Accessories"
              placeholderTextColor="#AEAEB2"
              value={newName}
              onChangeText={(v) => {
                setNewName(v);
                resetAddError();
              }}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <Pressable
              style={[
                styles.addButton,
                (!canAdd || isAdding) && styles.addButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!canAdd || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add</Text>
              )}
            </Pressable>
          </View>

          {/* Slug preview */}
          {newName.trim().length > 0 && (
            <Text style={styles.slugPreview}>slug: {slugify(newName)}</Text>
          )}

          {/* Duplicate warning */}
          {newName.trim().length > 0 && !canAdd && (
            <Text style={styles.errorText}>
              A category with this name already exists.
            </Text>
          )}

          {addError && <Text style={styles.errorText}>⚠️ {addError}</Text>}
        </View>

        {/* ── Category list ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            {categories.length}{" "}
            {categories.length === 1 ? "Category" : "Categories"}
          </Text>

          {isLoading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : addError ? (
            <Text style={styles.errorText}>⚠️ {addError}</Text>
          ) : categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories yet.</Text>
          ) : (
            <View style={styles.list}>
              {categories.map((cat, i) => (
                <View
                  key={cat.id}
                  style={[
                    styles.row,
                    i < categories.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categorySlug}>{cat.slug}</Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => handleDelete(cat.id, cat.name)}
                    disabled={isRemoving}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const ACCENT = "#1C1C1E";
const RED = "#C0392B";
const MUTED = "#8E8E93";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F5" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#F7F7F5",
  },
  headerSpacer: { width: 50 },
  headerTitle: { fontSize: 16, fontWeight: "600", color: ACCENT },
  doneButton: { width: 50, alignItems: "flex-end" },
  doneText: { fontSize: 16, fontWeight: "600", color: ACCENT },

  scroll: { flex: 1 },
  content: { padding: 20, gap: 16 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // Add row
  addRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: ACCENT,
    backgroundColor: "#FAFAF9",
  },
  addButton: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 64,
  },
  addButtonDisabled: { opacity: 0.35 },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  slugPreview: { fontSize: 12, color: MUTED, marginTop: -4 },
  errorText: { fontSize: 13, color: RED },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    paddingVertical: 12,
  },

  // List
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  rowLeft: { gap: 2, flex: 1 },
  categoryName: { fontSize: 15, fontWeight: "500", color: ACCENT },
  categorySlug: { fontSize: 12, color: MUTED },

  deleteButton: { paddingHorizontal: 4, paddingVertical: 4 },
  deleteText: { fontSize: 14, fontWeight: "500", color: RED },
});
