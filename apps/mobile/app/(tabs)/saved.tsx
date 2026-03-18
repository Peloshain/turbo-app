import { View, Text, StyleSheet } from "react-native";

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>Sin outfits guardados</Text>
      <Text style={styles.hint}>Los outfits que guardes aparecerán aquí</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF9",
  },
  empty: { fontSize: 16, fontWeight: "600", color: "#1C1C1E" },
  hint: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
