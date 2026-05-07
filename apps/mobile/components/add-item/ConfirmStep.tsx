import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { ImagePickerAsset } from "expo-image-picker";
import { AnalysisResult } from "../../hooks/useAddItem";
import { IconComponent } from "../ui/Icon";
import { authClient } from "../../lib/auth-client";

interface Props {
  image: ImagePickerAsset;
  analysis: AnalysisResult;
  categoryName: string;
  categoryIcon: string;
  loading: boolean;
  onSave: () => void;
  onBack: () => void;
}

export function ConfirmStep({
  image,
  analysis,
  categoryName,
  categoryIcon,
  loading,
  onSave,
  onBack,
}: Props) {
  const { data: session } = authClient.useSession();
  const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looks good?</Text>
      <Text style={styles.subtitle}>
        Review what the {aiHelperEnabled ? "AI" : "manual"} detected. You can
        always edit this later.
      </Text>

      {/* Image + color swatch side by side */}
      <View style={styles.previewRow}>
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Detected info card */}
        <View style={styles.infoCard}>
          {/* AI badge */}
          <View style={styles.aiBadge}>
            {aiHelperEnabled && (
              <IconComponent name={"sparkles"} size={16} color="#e7d804" />
            )}
            <Text style={styles.aiBadgeText}>
              {aiHelperEnabled ? "AI detected" : "Manual"}
            </Text>
          </View>

          {/* Item name */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{analysis.name}</Text>
          </View>

          {/* Category */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>
              {categoryIcon} {categoryName}
            </Text>
          </View>

          {/* Color with hex swatch */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Color</Text>
            <View style={styles.colorRow}>
              {analysis.colorHex && (
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: analysis.colorHex },
                  ]}
                />
              )}
              <Text style={styles.infoValue} numberOfLines={2}>
                {analysis.colorDesc}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.saveButton,
            pressed && styles.pressed,
          ]}
          onPress={onSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Add to wardrobe</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Start over</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },

  // ── Text
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 24,
    lineHeight: 18,
  },

  // ── Image + info row
  previewRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 32,
  },
  image: {
    width: 140,
    height: 180,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    justifyContent: "center",
  },
  aiBadge: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: "#1C1C1E",
    fontWeight: "500",
    lineHeight: 19,
  },

  // ── Color swatch
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

  // ── Buttons
  buttons: {
    gap: 10,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#1C1C1E",
  },
  backButton: {
    backgroundColor: "#F2F2F7",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonText: {
    color: "#1C1C1E",
    fontSize: 16,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.75,
  },
});
