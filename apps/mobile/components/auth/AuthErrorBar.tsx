import { View, Text, StyleSheet } from "react-native";

interface Props {
  message: string;
}

export function AuthErrorBar({ message }: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#FFF2F2",
    borderLeftWidth: 2,
    borderLeftColor: "#DC2626",
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  text: {
    fontSize: 13,
    color: "#DC2626",
    lineHeight: 18,
  },
});
