import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { WardrobeItem } from "../../hooks/useWardrobe";

// Two columns with consistent gutters
const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 10) / 2;

interface Props {
  item: WardrobeItem;
}

export function ItemCard({ item }: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {/* Item photo */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Color dot + category badge row */}
      <View style={styles.badgeRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{item.category.icon}</Text>
        </View>
        {item.colorHex && (
          <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
        )}
      </View>

      {/* Item name */}
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>

      {/* Color description */}
      <Text style={styles.colorDesc} numberOfLines={1}>
        {item.colorDesc}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // ── Image
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.2, // Slightly taller than wide — clothing looks better
    backgroundColor: "#F2F2F7",
  },

  // ── Badges
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  categoryBadge: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryIcon: {
    fontSize: 13,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  // ── Text
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
    paddingHorizontal: 10,
    paddingTop: 6,
    lineHeight: 18,
  },
  colorDesc: {
    fontSize: 11,
    color: "#8E8E93",
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 10,
  },
});
