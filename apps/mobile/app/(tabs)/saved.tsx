import { View, Text, StyleSheet } from "react-native";

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>No saved outfits</Text>
      <Text style={styles.hint}>The outfits you save will appear here</Text>
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
