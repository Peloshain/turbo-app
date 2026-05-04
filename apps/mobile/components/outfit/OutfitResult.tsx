import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { GeneratedOutfit } from "../../hooks/useOutfitGenerator";
import { IconComponent } from "../ui/Icon";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Props {
  outfit: GeneratedOutfit;
  isSaving: boolean;
  savedId: string | null;
  onSave: () => void;
  onRegenerate: () => void;
}

export function OutfitResult({
  outfit,
  isSaving,
  savedId,
  onSave,
  onRegenerate,
}: Props) {
  const alreadySaved = !!savedId;

  return (
    <View style={styles.container}>
      {/* ── Outfit name + reason ── */}
      <View style={styles.header}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>
            <IconComponent name={"sparkles"} size={15} color="#ebde2a" />
            AI suggestion
          </Text>
        </View>
        <Text style={styles.outfitName}>{outfit.outfitName}</Text>
        <Text style={styles.reason}>{outfit.reason}</Text>
      </View>

      {/* ── Item photos horizontal scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsRow}
        snapToInterval={ITEM_WIDTH + 12}
        decelerationRate="fast"
      >
        {outfit.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            {/* Color dot overlay */}
            {item.colorHex && (
              <View
                style={[styles.colorDot, { backgroundColor: item.colorHex }]}
              />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemCategory}>
                {item.category.icon} {item.category.name}
              </Text>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemColor} numberOfLines={1}>
                {item.colorDesc}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── Style note ── */}
      <View style={styles.styleNoteCard}>
        <Text style={styles.styleNoteTitle}>💡 Style tip</Text>
        <Text style={styles.styleNoteText}>{outfit.styleNote}</Text>
      </View>

      {/* ── Color palette from items ── */}
      <View style={styles.paletteRow}>
        <Text style={styles.paletteLabel}>Color palette</Text>
        <View style={styles.palette}>
          {outfit.items
            .filter((i) => i.colorHex)
            .map((item) => (
              <View
                key={item.id}
                style={[styles.paletteDot, { backgroundColor: item.colorHex! }]}
              />
            ))}
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        {/* Save / Saved button */}
        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            alreadySaved && styles.savedButton,
          ]}
          onPress={onSave}
          disabled={isSaving || alreadySaved}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {alreadySaved ? "✓ Saved to my outfits" : "Save outfit"}
            </Text>
          )}
        </Pressable>

        {/* Try again */}
        <Pressable
          style={[styles.button, styles.retryButton]}
          onPress={onRegenerate}
          disabled={isSaving}
        >
          <Text style={styles.retryButtonText}>🔄 Try another</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ITEM_WIDTH = SCREEN_WIDTH * 0.52;

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 40,
  },

  // ── Header
  header: {
    gap: 6,
  },
  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  outfitName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1E",
    lineHeight: 32,
  },
  reason: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },

  // ── Items horizontal scroll
  itemsRow: {
    paddingRight: 16,
    gap: 12,
  },
  itemCard: {
    width: ITEM_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
  },
  itemImage: {
    width: "100%",
    height: ITEM_WIDTH * 1.15,
    backgroundColor: "#F2F2F7",
  },
  colorDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  itemInfo: {
    padding: 12,
    gap: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
    lineHeight: 18,
  },
  itemColor: {
    fontSize: 11,
    color: "#8E8E93",
  },

  // ── Style note
  styleNoteCard: {
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  styleNoteTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  styleNoteText: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 19,
  },

  // ── Color palette
  paletteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paletteLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  palette: {
    flexDirection: "row",
    gap: 6,
  },
  paletteDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  // ── Action buttons
  actions: {
    gap: 10,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#1C1C1E",
  },
  savedButton: {
    backgroundColor: "#34C759",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#F2F2F7",
  },
  retryButtonText: {
    color: "#1C1C1E",
    fontSize: 15,
    fontWeight: "500",
  },
});
