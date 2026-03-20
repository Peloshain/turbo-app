import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  // True when the empty state is caused by filters, not a truly empty wardrobe
  isFiltered: boolean;
}

export function EmptyState({ isFiltered }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isFiltered ? "🔍" : "👗"}</Text>
      <Text style={styles.title}>
        {isFiltered ? "No items found" : "Your wardrobe is empty"}
      </Text>
      <Text style={styles.subtitle}>
        {isFiltered
          ? "Try a different category or clear your search"
          : "Start by adding your first clothing item"}
      </Text>
      {!isFiltered && (
        <Pressable
          style={styles.button}
          onPress={() => router.push("/add-item")}
        >
          <Text style={styles.buttonText}>+ Add first item</Text>
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
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 25,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
