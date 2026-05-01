import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useOutfitGenerator,
  Occasion,
  Weather,
} from "../../hooks/useOutfitGenerator";
import { OccasionPicker } from "../../components/outfit/OccasionPicker";
import { OutfitResult } from "../../components/outfit/OutfitResult";
import { IconComponent } from "../../components/ui/Icon";

export default function OutfitScreen() {
  const insets = useSafeAreaInsets();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  const {
    result,
    savedId,
    isGenerating,
    isSaving,
    error,
    generate,
    save,
    reset,
    cancelAnalysis,
  } = useOutfitGenerator();

  function handleGenerate() {
    if (isGenerating) {
      cancelAnalysis();
      return;
    }
    generate({
      occasion: occasion ?? undefined,
      weather: weather ?? undefined,
    });
  }

  function handleSave() {
    if (!result) return;
    save({ ...result, occasion: occasion ?? undefined });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Filters section — always visible ── */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Build an outfit</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a context or leave blank for a surprise
        </Text>

        <OccasionPicker
          occasion={occasion}
          weather={weather}
          onOccasionChange={setOccasion}
          onWeatherChange={setWeather}
        />

        {/* Generate button */}
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            isGenerating && styles.generateButtonActive,
            pressed && styles.generateButtonPressed,
          ]}
          onPress={handleGenerate}
        >
          {isGenerating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.generateButtonText}>Cancel AI styling</Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              {result ? (
                <IconComponent name={"refresh"} size={18} color="#ebde2a" />
              ) : (
                <IconComponent name={"sparkles"} size={18} color="#ebde2a" />
              )}
              <Text style={styles.generateButtonText}>
                {result ? "Regenerate" : "Generate outfit"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Error state ── */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* ── Generated outfit result ── */}
      {result && !isGenerating && (
        <View style={styles.resultSection}>
          <OutfitResult
            outfit={result}
            isSaving={isSaving}
            savedId={savedId}
            onSave={handleSave}
            onRegenerate={handleGenerate}
          />
        </View>
      )}

      {/* ── Empty state — no result yet ── */}
      {!result && !isGenerating && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🪄</Text>
          <Text style={styles.emptyTitle}>AI stylist ready</Text>
          <Text style={styles.emptySubtitle}>
            Pick an occasion and weather above, or tap Generate for a surprise
            outfit from your wardrobe
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  content: {
    padding: 20,
    gap: 24,
  },

  // ── Filters section
  filtersSection: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: -8,
    lineHeight: 19,
  },

  // ── Generate button
  generateButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonPressed: {
    opacity: 0.85,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButtonActive: {
    backgroundColor: "#636366", // grey = "in progress, tap to cancel"
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // ── Error
  errorCard: {
    backgroundColor: "#FFF2F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 19,
  },

  // ── Result section
  resultSection: {
    gap: 0,
  },

  // ── Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
