import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { IconComponent } from "../ui/Icon";

export function EmptyOutfits() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <IconComponent name={"folderClosed"} size={50} color={"#ebde2a"} />
      <Text style={styles.title}>No saved outfits yet</Text>
      <Text style={styles.subtitle}>
        Generate an outfit with AI and save it here to build your collection
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/outfit")}
      >
        <Text style={styles.buttonText}>
          <IconComponent name={"sparkles"} size={15} color="#ebde2a" />
          Generate my first outfit
        </Text>
      </Pressable>
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
    gap: 10,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
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
