import { View, Text, StyleSheet, Pressable } from "react-native";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Something went wrong",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emoji: {
    fontSize: 36,
  },
  message: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 22,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
});
