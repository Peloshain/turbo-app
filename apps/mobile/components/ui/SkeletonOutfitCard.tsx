import { View, StyleSheet, Dimensions } from "react-native";
import { Skeleton } from "./Skeleton";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export function SkeletonOutfitCard() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={40} height={22} borderRadius={20} />
        <Skeleton width={140} height={18} borderRadius={6} />
      </View>
      {/* Collage placeholder */}
      <Skeleton
        width={CARD_WIDTH - 32}
        height={CARD_WIDTH - 32}
        borderRadius={14}
      />
      {/* Footer */}
      <View style={styles.footer}>
        <Skeleton width={80} height={14} borderRadius={4} />
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={18} height={18} borderRadius={9} />
          ))}
        </View>
      </View>
      {/* Item rows */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.itemRow}>
          <Skeleton width={22} height={14} borderRadius={4} />
          <Skeleton width={60 + i * 10} height={13} borderRadius={4} />
        </View>
      ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    gap: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
