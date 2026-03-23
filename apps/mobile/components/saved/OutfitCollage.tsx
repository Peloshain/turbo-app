import { View, Image, StyleSheet } from "react-native";

interface Props {
  imageUrls: string[];
  size: number; // Total width/height of the collage
}

export function OutfitCollage({ imageUrls, size }: Props) {
  const images = imageUrls.slice(0, 4); // Max 4 images in the collage
  const count = images.length;
  const half = (size - 2) / 2; // Half size accounting for 2px gap

  // ── Single image — full square
  if (count === 1) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={{ uri: images[0] }}
          style={styles.full}
          resizeMode="cover"
        />
      </View>
    );
  }

  // ── Two images — side by side
  if (count === 2) {
    return (
      <View
        style={[styles.container, styles.row, { width: size, height: size }]}
      >
        <Image
          source={{ uri: images[0] }}
          style={[styles.half, { width: half }]}
          resizeMode="cover"
        />
        <Image
          source={{ uri: images[1] }}
          style={[styles.half, { width: half }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // ── Three images — one large left + two stacked right
  if (count === 3) {
    return (
      <View
        style={[styles.container, styles.row, { width: size, height: size }]}
      >
        <Image
          source={{ uri: images[0] }}
          style={[styles.half, { width: half }]}
          resizeMode="cover"
        />
        <View style={[styles.column, { width: half }]}>
          <Image
            source={{ uri: images[1] }}
            style={[styles.quarter, { height: half }]}
            resizeMode="cover"
          />
          <Image
            source={{ uri: images[2] }}
            style={[styles.quarter, { height: half }]}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // ── Four images — 2x2 grid
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.row, { height: half }]}>
        <Image
          source={{ uri: images[0] }}
          style={[styles.quarter, { width: half }]}
          resizeMode="cover"
        />
        <Image
          source={{ uri: images[1] }}
          style={[styles.quarter, { width: half }]}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.row, { height: half }]}>
        <Image
          source={{ uri: images[2] }}
          style={[styles.quarter, { width: half }]}
          resizeMode="cover"
        />
        <Image
          source={{ uri: images[3] }}
          style={[styles.quarter, { width: half }]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F2F2F7",
    gap: 2,
  },
  row: {
    flexDirection: "row",
    gap: 2,
  },
  column: {
    flexDirection: "column",
    gap: 2,
  },
  full: {
    flex: 1,
  },
  half: {
    flex: 1,
    height: "100%",
  },
  quarter: {
    flex: 1,
  },
});
