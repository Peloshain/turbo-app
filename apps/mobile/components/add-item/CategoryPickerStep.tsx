import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ImagePickerAsset } from "expo-image-picker";
import { useQuery } from "@tanstack/react-query";
import { env } from "@repo/env/native";
import { authClient } from "../../lib/auth-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Props {
  image: ImagePickerAsset;
  loading: boolean;
  onSelectCategory: (category: Category) => void;
  onCancelAnalysis: () => void;
}

//Useful for Android emulator
const API_URL = env.EXPO_PUBLIC_SERVER_URL;

// Fetch categories from the API
function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      return data.categories;
    },
  });
}

export function CategoryPickerStep({
  image,
  loading,
  onSelectCategory,
  onCancelAnalysis,
}: Props) {
  const { data: session } = authClient.useSession();
  const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;
  const { data: categories, isLoading: loadingCategories } = useCategories();
  if (loadingCategories) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1C1C1E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preview of selected image */}
      <View style={styles.imagePreviewContainer}>
        <Image
          source={{ uri: image.uri }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
        {/* Overlay shown while AI is analyzing */}
        {loading && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text style={styles.analyzingText}>
              AI is analyzing your item...
            </Text>
          </View>
        )}
      </View>
      {loading && (
        <View style={styles.cancelAnalysisButton}>
          <Pressable onPress={() => onCancelAnalysis()}>
            <Text style={styles.cancelAnalysis}>Cancel AI analysis</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.title}>What type of item is this?</Text>
      <Text style={styles.subtitle}>
        {aiHelperEnabled
          ? "Select a category to help the AI understand your item"
          : "Select a category for your item"}
      </Text>
      {/* Category grid */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.categoryRow}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.categoryButton,
              pressed && styles.categoryButtonPressed,
              loading && styles.categoryButtonDisabled,
            ]}
            onPress={() => !loading && onSelectCategory(item)}
            disabled={loading}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={styles.categoryName}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Image preview
  imagePreviewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#F2F2F7",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  analyzingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Text
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 20,
    lineHeight: 18,
  },

  // ── Category grid
  categoryRow: {
    gap: 10,
    marginBottom: 10,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryButtonPressed: {
    backgroundColor: "#E5E5EA",
    borderColor: "#1C1C1E",
  },
  categoryButtonDisabled: {
    opacity: 0.4,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1C1C1E",
    textAlign: "center",
  },
  cancelAnalysisButton: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "#FFF2F2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  cancelAnalysis: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
    paddingVertical: 10,
  },
});
