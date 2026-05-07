// import { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   useOutfitGenerator,
//   Occasion,
//   Weather,
// } from "../../hooks/useOutfitGenerator";
// import { OccasionPicker } from "../../components/outfit/OccasionPicker";
// import { OutfitResult } from "../../components/outfit/OutfitResult";
// import { IconComponent } from "../../components/ui/Icon";

// export default function OutfitScreen() {
//   const insets = useSafeAreaInsets();
//   const [occasion, setOccasion] = useState<Occasion | null>(null);
//   const [weather, setWeather] = useState<Weather | null>(null);

//   const {
//     result,
//     savedId,
//     isGenerating,
//     isSaving,
//     error,
//     generate,
//     save,
//     reset,
//     cancelAnalysis,
//   } = useOutfitGenerator();

//   function handleGenerate() {
//     if (isGenerating) {
//       cancelAnalysis();
//       return;
//     }
//     generate({
//       occasion: occasion ?? undefined,
//       weather: weather ?? undefined,
//     });
//   }

//   function handleSave() {
//     if (!result) return;
//     save({ ...result, occasion: occasion ?? undefined });
//   }

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={[
//         styles.content,
//         { paddingBottom: insets.bottom + 24 },
//       ]}
//       showsVerticalScrollIndicator={false}
//     >
//       {/* ── Filters section — always visible ── */}
//       <View style={styles.filtersSection}>
//         <Text style={styles.sectionTitle}>Build an outfit</Text>
//         <Text style={styles.sectionSubtitle}>
//           Choose a context or leave blank for a surprise
//         </Text>

//         <OccasionPicker
//           occasion={occasion}
//           weather={weather}
//           onOccasionChange={setOccasion}
//           onWeatherChange={setWeather}
//         />

//         {/* Generate button */}
//         <Pressable
//           style={({ pressed }) => [
//             styles.generateButton,
//             isGenerating && styles.generateButtonActive,
//             pressed && styles.generateButtonPressed,
//           ]}
//           onPress={handleGenerate}
//         >
//           {isGenerating ? (
//             <View style={styles.loadingRow}>
//               <ActivityIndicator color="#FFFFFF" size="small" />
//               <Text style={styles.generateButtonText}>Cancel AI styling</Text>
//             </View>
//           ) : (
//             <View style={styles.loadingRow}>
//               {result ? (
//                 <IconComponent name={"refresh"} size={18} color="#ebde2a" />
//               ) : (
//                 <IconComponent name={"sparkles"} size={18} color="#ebde2a" />
//               )}
//               <Text style={styles.generateButtonText}>
//                 {result ? "Regenerate" : "Generate outfit"}
//               </Text>
//             </View>
//           )}
//         </Pressable>
//       </View>

//       {/* ── Error state ── */}
//       {error && (
//         <View style={styles.errorCard}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//         </View>
//       )}

//       {/* ── Generated outfit result ── */}
//       {result && !isGenerating && (
//         <View style={styles.resultSection}>
//           <OutfitResult
//             outfit={result}
//             isSaving={isSaving}
//             savedId={savedId}
//             onSave={handleSave}
//             onRegenerate={handleGenerate}
//           />
//         </View>
//       )}

//       {/* ── Empty state — no result yet ── */}
//       {!result && !isGenerating && !error && (
//         <View style={styles.emptyState}>
//           <IconComponent name={"wand"} size={52} color="#ebde2a" />

//           <Text style={styles.emptyTitle}>AI stylist ready</Text>
//           <Text style={styles.emptySubtitle}>
//             Pick an occasion and weather above, or tap Generate for a surprise
//             outfit from your wardrobe
//           </Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FAFAF9",
//   },
//   content: {
//     padding: 20,
//     gap: 24,
//   },

//   // ── Filters section
//   filtersSection: {
//     gap: 14,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1C1C1E",
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: "#8E8E93",
//     marginTop: -8,
//     lineHeight: 19,
//   },

//   // ── Generate button
//   generateButton: {
//     backgroundColor: "#1C1C1E",
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: "center",
//     marginTop: 4,
//   },
//   generateButtonDisabled: {
//     opacity: 0.7,
//   },
//   generateButtonPressed: {
//     opacity: 0.85,
//   },
//   generateButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   generateButtonActive: {
//     backgroundColor: "#636366", // grey = "in progress, tap to cancel"
//   },
//   loadingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   // ── Error
//   errorCard: {
//     backgroundColor: "#FFF2F2",
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#FFCDD2",
//   },
//   errorText: {
//     fontSize: 14,
//     color: "#DC2626",
//     lineHeight: 19,
//   },

//   // ── Result section
//   resultSection: {
//     gap: 0,
//   },

//   // ── Empty state
//   emptyState: {
//     alignItems: "center",
//     paddingTop: 40,
//     gap: 10,
//     paddingHorizontal: 20,
//   },
//   emptyEmoji: {
//     fontSize: 52,
//     marginBottom: 6,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1C1C1E",
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: "#8E8E93",
//     textAlign: "center",
//     lineHeight: 20,
//   },
// });
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "../../lib/auth-client";
import {
  useOutfitGenerator,
  Occasion,
  Weather,
} from "../../hooks/useOutfitGenerator";
import { useManualOutfit } from "../../hooks/useManualOutfit";
import { OccasionPicker } from "../../components/outfit/OccasionPicker";
import { OutfitResult } from "../../components/outfit/OutfitResult";
import { IconComponent } from "../../components/ui/Icon";

// ─── Manual mode ─────────────────────────────────────────────────────────────

function ManualOutfitScreen() {
  const insets = useSafeAreaInsets();
  const [occasion, setOccasion] = useState<Occasion | null>(null);

  const {
    items,
    isLoadingItems,
    selectedIds,
    selectedItems,
    outfitName,
    setOutfitName,
    toggleItem,
    getItemStatus,
    save,
    isSaving,
    savedId,
    saveError,
    validationError,
    reset,
  } = useManualOutfit();

  const canSave = selectedIds.size >= 2 && !savedId;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Build an outfit</Text>
        <Text style={styles.sectionSubtitle}>
          Pick at least 2 items from your wardrobe
        </Text>

        {/* Outfit name */}
        <TextInput
          style={styles.nameInput}
          placeholder="Outfit name (optional)"
          placeholderTextColor="#AEAEB2"
          value={outfitName}
          onChangeText={setOutfitName}
        />

        {/* Occasion picker — reuse existing component, weather hidden */}
        <OccasionPicker
          occasion={occasion}
          weather={null}
          onOccasionChange={setOccasion}
          onWeatherChange={() => {}}
        />
      </View>

      {/* ── Item picker ── */}
      {isLoadingItems ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <IconComponent name="hanger" size={48} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your wardrobe first
          </Text>
        </View>
      ) : (
        <View style={styles.pickerGrid}>
          {items.map((item) => {
            const status = getItemStatus(item.id);
            const blocked =
              status === "blocked-category" || status === "blocked-limit";
            const blockLabel =
              status === "blocked-category"
                ? `1 ${item.category?.name ?? "category"} max`
                : status === "blocked-limit"
                  ? "10 items max"
                  : null;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.pickerCell,
                  status === "selected" && styles.pickerCellSelected,
                  blocked && styles.pickerCellBlocked,
                ]}
                onPress={() => toggleItem(item.id)}
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[
                      styles.pickerImage,
                      blocked && styles.pickerImageDim,
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.pickerImagePlaceholder,
                      blocked && styles.pickerImageDim,
                    ]}
                  >
                    <Text style={styles.pickerImagePlaceholderText}>
                      {item.category?.icon ?? "👕"}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.pickerItemName,
                    blocked && styles.pickerItemNameDim,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {/* Selected checkmark */}
                {status === "selected" && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}

                {/* Blocked reason overlay */}
                {blockLabel && (
                  <View style={styles.blockBadge}>
                    <Text style={styles.blockBadgeText}>{blockLabel}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Validation error ── */}
      {validationError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {validationError}</Text>
        </View>
      )}

      {/* ── Selection summary ── */}
      {selectedIds.size > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
          </Text>
          <Pressable onPress={reset}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>
      )}

      {/* ── Save error ── */}
      {saveError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {saveError}</Text>
        </View>
      )}

      {/* ── Saved confirmation ── */}
      {savedId && (
        <View style={styles.successCard}>
          <Text style={styles.successText}>✓ Outfit saved!</Text>
          <Pressable onPress={reset}>
            <Text style={styles.clearText}>Build another</Text>
          </Pressable>
        </View>
      )}

      {/* ── Save button ── */}
      {!savedId && (
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            !canSave && styles.generateButtonDisabled,
            pressed && canSave && styles.generateButtonPressed,
          ]}
          onPress={() => save({ occasion: occasion ?? undefined })}
          disabled={!canSave || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.loadingRow}>
              <IconComponent name="save" size={18} color="#ebde2a" />
              <Text style={styles.generateButtonText}>Save outfit</Text>
            </View>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── AI mode (unchanged logic, aiGenerated: true on save) ────────────────────

function AIOutfitScreen() {
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
    save({ ...result, occasion: occasion ?? undefined, aiGenerated: true });
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
              <IconComponent
                name={result ? "refresh" : "sparkles"}
                size={18}
                color="#ebde2a"
              />
              <Text style={styles.generateButtonText}>
                {result ? "Regenerate" : "Generate outfit"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

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

      {!result && !isGenerating && !error && (
        <View style={styles.emptyState}>
          <IconComponent name="wand" size={52} color="#ebde2a" />
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

// ─── Root screen — switches based on aiHelperEnabled ─────────────────────────

export default function OutfitScreen() {
  const { data: session } = authClient.useSession();
  const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;

  return aiHelperEnabled ? <AIOutfitScreen /> : <ManualOutfitScreen />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  content: { padding: 20, gap: 24 },

  filtersSection: { gap: 14 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#1C1C1E" },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: -8,
    lineHeight: 19,
  },

  nameInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1C1C1E",
    backgroundColor: "#fff",
  },

  generateButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  generateButtonDisabled: { opacity: 0.4 },
  generateButtonPressed: { opacity: 0.85 },
  generateButtonActive: { backgroundColor: "#636366" },
  generateButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  // Item picker grid
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pickerCell: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  pickerCellSelected: {
    borderColor: "#1C1C1E",
  },
  pickerImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F2F2F7",
  },
  pickerImagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerImagePlaceholderText: { fontSize: 36 },
  pickerItemName: {
    fontSize: 12,
    color: "#1C1C1E",
    padding: 8,
    fontWeight: "500",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Blocked cell
  pickerCellBlocked: {
    borderColor: "transparent",
    opacity: 0.45,
  },
  pickerImageDim: {
    opacity: 0.5,
  },
  pickerItemNameDim: {
    color: "#AEAEB2",
  },
  blockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  blockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Summary
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 14,
  },
  summaryText: { fontSize: 14, color: "#1C1C1E", fontWeight: "500" },
  clearText: { fontSize: 14, color: "#636366", fontWeight: "500" },

  // Feedback
  errorCard: {
    backgroundColor: "#FFF2F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: { fontSize: 14, color: "#DC2626", lineHeight: 19 },
  successCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successText: { fontSize: 14, color: "#16A34A", fontWeight: "500" },

  resultSection: { gap: 0 },

  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
