import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useDeleteItem } from "../../hooks/useWardrobe";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deleteItem = useDeleteItem();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () =>
      fetch(`${API_URL}/items/${id}`)
        .then((r) => r.json())
        .then((d) => d.item),
  });

  function handleDelete() {
    Alert.alert(
      "Remove item",
      "This will permanently remove it from your wardrobe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteItem.mutateAsync(id);
            router.back();
          },
        },
      ],
    );
  }

  if (isLoading || !item) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Full image */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Details card */}
      <View style={styles.card}>
        <Text style={styles.itemName}>{item.name}</Text>

        <View style={styles.row}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {item.category.icon} {item.category.name}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Color</Text>
            <View style={styles.colorRow}>
              {item.colorHex && (
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: item.colorHex },
                  ]}
                />
              )}
              <Text style={styles.detailValue} numberOfLines={2}>
                {item.colorDesc}
              </Text>
            </View>
          </View>
        </View>

        {/* AI badge */}
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✨ Analyzed by AI</Text>
        </View>
      </View>

      {/* Delete button */}
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Remove from wardrobe</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 380,
    backgroundColor: "#F2F2F7",
  },
  card: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
    gap: 16,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  row: {
    flexDirection: "row",
    gap: 20,
  },
  detail: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
    lineHeight: 20,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  aiBadgeText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#FFF2F2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
});
