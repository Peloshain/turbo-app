import { Fragment, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddItem } from "../../hooks/useAddItem";
import { ImagePickerStep } from "../../components/add-item/ImagePickerStep";
import { CategoryPickerStep } from "../../components/add-item/CategoryPickerStep";
import { DetailsStep } from "../../components/add-item/DetailStep";
import { ConfirmStep } from "../../components/add-item/ConfirmStep";
import { authClient } from "../../lib/auth-client";

export default function AddItemScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    image,
    analysis,
    loading,
    step,
    aiHelperEnabled,
    manualName,
    manualColorDesc,
    manualColorHex,
    setManualName,
    setManualColorDesc,
    setManualColorHex,
    pickImage,
    analyzeWithCategory,
    confirmManualDetails,
    saveItem,
    reset,
    cancelAnalysis,
  } = useAddItem();

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);

  // AI mode: Photo → Category → Confirm (3 steps)
  // Manual mode: Photo → Category → Details → Confirm (4 steps)
  const STEPS = aiHelperEnabled
    ? ["Photo", "Category", "Confirm"]
    : ["Photo", "Category", "Details", "Confirm"];

  const stepIndex =
    step === "pick"
      ? 0
      : step === "category"
        ? 1
        : step === "details"
          ? 2
          : aiHelperEnabled
            ? 2 // confirm in AI mode
            : 3; // confirm in manual mode

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
    if (!session) {
      Alert.alert("Not signed in", "Please sign in to save items.");
      return;
    }
    await saveItem(selectedCategory.id, session.user.id);
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
          <Fragment key={label}>
            <View style={styles.stepWrapper}>
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

              <Text
                numberOfLines={1}
                style={[
                  styles.progressLabel,
                  i === stepIndex && styles.progressLabelActive,
                ]}
              >
                {label}
              </Text>
            </View>

            {i < STEPS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  i < stepIndex && styles.progressLineDone,
                ]}
              />
            )}
          </Fragment>
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
            onCancelAnalysis={cancelAnalysis}
            loading={loading}
          />
        )}

        {/* Manual details step — only shown when aiHelperEnabled is false */}
        {step === "details" && (
          <DetailsStep
            name={manualName}
            colorDesc={manualColorDesc}
            colorHex={manualColorHex}
            onNameChange={setManualName}
            onColorDescChange={setManualColorDesc}
            onColorHexChange={setManualColorHex}
            onNext={confirmManualDetails}
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  stepWrapper: {
    alignItems: "center",
    width: 52,
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
    marginTop: 6,
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    textAlign: "center",
  },

  progressLabelActive: {
    color: "#1C1C1E",
    fontWeight: "600",
  },

  progressLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E5EA",
    marginTop: 14,
    marginHorizontal: 6,
  },

  progressLineDone: {
    backgroundColor: "#34C759",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
