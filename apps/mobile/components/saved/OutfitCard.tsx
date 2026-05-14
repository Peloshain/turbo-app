import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { SavedOutfit } from "../../hooks/useSavedOutfits";
import { useDeleteOutfit } from "../../hooks/useSavedOutfits";
import { OutfitCollage } from "./OutfitCollage";
import { IconComponent } from "../ui/Icon";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32; // Full width with 16px margin each side
const COLLAGE_SIZE = CARD_WIDTH - 32; // Collage inside card padding

// Map occasion slug to readable label + emoji
const OCCASION_LABELS: Record<string, { label: string; icon: string }> = {
  casual: { label: "Casual", icon: "casual" },
  work: { label: "Work", icon: "work" },
  formal: { label: "Formal", icon: "formal" },
  sport: { label: "Sport", icon: "sport" },
};

interface Props {
  outfit: SavedOutfit;
}

export function OutfitCard({ outfit }: Props) {
  const deleteOutfit = useDeleteOutfit();

  const imageUrls = outfit.items.map((oi) => oi.item.imageUrl);
  const occasion = outfit.occasion ? OCCASION_LABELS[outfit.occasion] : null;

  // Color palette extracted from outfit items
  const colorHexes = outfit.items
    .map((oi) => oi.item.colorHex)
    .filter((h): h is string => !!h)
    .slice(0, 5);

  function handleDelete() {
    Alert.alert(
      "Remove outfit",
      `Remove "${outfit.name ?? "this outfit"}" from your saved outfits?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteOutfit.mutate(outfit.id),
        },
      ],
    );
  }

  return (
    <View style={styles.card}>
      {/* ── Top row: name + delete button ── */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {outfit.aiGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>
                {" "}
                <IconComponent name={"sparkles"} size={12} color="#ebde2a" />
                AI
              </Text>
            </View>
          )}
          <Text style={styles.outfitName} numberOfLines={1}>
            {outfit.name ?? "Untitled outfit"}
          </Text>
        </View>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          hitSlop={8}
        >
          <IconComponent name={"trash"} size={20} color="#e44646" />
        </Pressable>
      </View>

      {/* ── Collage ── */}
      <OutfitCollage imageUrls={imageUrls} size={COLLAGE_SIZE} />

      {/* ── Footer: pieces count + occasion + color palette ── */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          {/* Piece count */}
          <Text style={styles.pieceCount}>
            {outfit.items.length}{" "}
            {outfit.items.length === 1 ? "piece" : "pieces"}
          </Text>

          {/* Occasion badge */}
          {occasion && (
            <View style={styles.occasionBadge}>
              <IconComponent name={occasion.icon} size={12} color={"#1C1C1E"} />
              <Text style={styles.occasionText}>{occasion.label}</Text>
            </View>
          )}
        </View>

        {/* Color palette dots */}
        <View style={styles.palette}>
          {colorHexes.map((hex, i) => (
            <View
              key={`${hex}-${i}`}
              style={[styles.paletteDot, { backgroundColor: hex }]}
            />
          ))}
        </View>
      </View>

      {/* ── Item names list ── */}
      <View style={styles.itemList}>
        {outfit.items.map((oi) => (
          <View key={oi.id} style={styles.itemRow}>
            <Text style={styles.itemIcon}>{oi.item.category.icon}</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {oi.item.name}
            </Text>
            {oi.item.colorHex && (
              <View
                style={[
                  styles.itemColorDot,
                  { backgroundColor: oi.item.colorHex },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
    gap: 14,
  },

  // ── Header
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  aiBadge: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  outfitName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.5,
  },

  // ── Footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pieceCount: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  occasionBadge: {
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  occasionText: {
    fontSize: 12,
    color: "#1C1C1E",
    fontWeight: "500",
  },

  // ── Color palette
  palette: {
    flexDirection: "row",
    gap: 5,
  },
  paletteDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  // ── Item list
  itemList: {
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#F2F2F7",
    paddingTop: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemIcon: {
    fontSize: 14,
    width: 22,
  },
  itemName: {
    fontSize: 13,
    color: "#1C1C1E",
    flex: 1,
    fontWeight: "400",
  },
  itemColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
});
