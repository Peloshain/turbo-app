import { View, Text, StyleSheet } from "react-native";

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#E5E5EA",
  },
  label: {
    fontSize: 13,
    color: "#C7C7CC",
    fontWeight: "500",
  },
});
