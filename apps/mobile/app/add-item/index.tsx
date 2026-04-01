import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddItem } from "../../hooks/useAddItem";
import { ImagePickerStep } from "../../components/add-item/ImagePickerStep";
import { CategoryPickerStep } from "../../components/add-item/CategoryPickerStep";
import { ConfirmStep } from "../../components/add-item/ConfirmStep";

import { useSession } from "@repo/auth-expo";

// Temporary hardcoded user — replace with real auth later
const TEMP_USER_ID = "7a761c35-bc8f-4743-a36a-9b0500906504";

const { user } = useSession();

console.log("Current user:", user);

export default function AddItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    image,
    analysis,
    loading,
    step,
    pickImage,
    analyzeWithCategory,
    saveItem,
    reset,
  } = useAddItem();

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);

  // Step labels shown in the top progress bar
  const STEPS = ["Photo", "Category", "Confirm"];
  const stepIndex = step === "pick" ? 0 : step === "category" ? 1 : 2;

  function handleClose() {
    reset();
    router.back();
  }

  async function handleCategorySelect(category: {
    id: string;
    name: string;
    icon: string;
  }) {
    setSelectedCategory(category);
    await analyzeWithCategory(category.name, category.id);
  }

  async function handleSave() {
    if (!selectedCategory) return;
    await saveItem(selectedCategory.id, TEMP_USER_ID);
    Alert.alert("Done!", "Item added to your wardrobe.", [
      { text: "Add another", onPress: reset },
      { text: "Done", onPress: handleClose },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add item</Text>
        <View style={styles.closeButton} />
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressContainer}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressStep}>
            {/* Step circle */}
            <View
              style={[
                styles.progressCircle,
                i < stepIndex && styles.progressCircleDone,
                i === stepIndex && styles.progressCircleActive,
              ]}
            >
              {i < stepIndex ? (
                <Text style={styles.progressCheckmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.progressNumber,
                    i === stepIndex && styles.progressNumberActive,
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            {/* Step label */}
            <Text
              style={[
                styles.progressLabel,
                i === stepIndex && styles.progressLabelActive,
              ]}
            >
              {label}
            </Text>
            {/* Connector line between steps */}
            {i < STEPS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  i < stepIndex && styles.progressLineDone,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* ── Step content ── */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === "pick" && <ImagePickerStep onPickImage={pickImage} />}

        {step === "category" && image && (
          <CategoryPickerStep
            image={image}
            onSelectCategory={handleCategorySelect}
            loading={loading}
          />
        )}

        {step === "confirm" && image && analysis && (
          <ConfirmStep
            image={image}
            analysis={analysis}
            categoryName={selectedCategory?.name ?? ""}
            categoryIcon={selectedCategory?.icon ?? ""}
            onSave={handleSave}
            onBack={reset}
            loading={loading}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: 15,
    color: "#8E8E93",
  },

  // ── Progress bar
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    gap: 0,
  },
  progressStep: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  progressCircleActive: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
  },
  progressCircleDone: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  progressNumberActive: {
    color: "#FFFFFF",
  },
  progressCheckmark: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  progressLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  progressLabelActive: {
    color: "#1C1C1E",
    fontWeight: "600",
  },
  progressLine: {
    width: 36,
    height: 1.5,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 4,
  },
  progressLineDone: {
    backgroundColor: "#34C759",
  },

  // ── Content area
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
