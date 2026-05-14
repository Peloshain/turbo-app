import { View, Text, StyleSheet } from "react-native";

interface Props {
  label?: string;
}

export function AuthDivider({ label = "or" }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#E5E5EA",
  },
  text: {
    fontSize: 12,
    color: "#C7C7CC",
  },
});
