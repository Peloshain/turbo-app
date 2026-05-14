import { View, StyleSheet, Dimensions } from "react-native";
import { Skeleton } from "./Skeleton";

const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 10) / 2;

export function SkeletonCard() {
  return (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      {/* Image placeholder */}
      <Skeleton width={100} height={CARD_WIDTH * 1.2} borderRadius={0} />
      <View style={styles.info}>
        {/* Category badge placeholder */}
        <Skeleton width={40} height={24} borderRadius={8} />
        {/* Name placeholder — two lines */}
        <Skeleton width={90} height={13} borderRadius={4} />
        <Skeleton width={60} height={11} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
  },
  info: {
    padding: 10,
    gap: 6,
  },
});
