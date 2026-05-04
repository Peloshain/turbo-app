import { View, Text, StyleSheet, Pressable } from "react-native";
import { IconComponent } from "../ui/Icon";

interface Props {
  onPickImage: (source: "camera" | "gallery") => void;
}

export function ImagePickerStep({ onPickImage }: Props) {
  return (
    <View style={styles.container}>
      {/* Illustration placeholder */}
      <View style={styles.illustration}>
        <IconComponent name={"shirt"} size={50} color="#000000" />
      </View>

      <Text style={styles.title}>Add a clothing item</Text>
      <Text style={styles.subtitle}>
        Take a photo or choose from your gallery. The AI will detect the color
        automatically.
      </Text>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            pressed && styles.pressed,
          ]}
          onPress={() => onPickImage("camera")}
        >
          <IconComponent name={"camera"} size={50} color="#fffefe" />
          <Text style={styles.buttonPrimaryText}>Take a photo</Text>
          <Text style={styles.buttonHint}>Use your camera</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.pressed,
          ]}
          onPress={() => onPickImage("gallery")}
        >
          <IconComponent name={"image"} size={50} color="#1C1C1E" />
          <Text style={styles.buttonSecondaryText}>Choose from gallery</Text>
          <Text style={styles.buttonHintDark}>Pick an existing photo</Text>
        </Pressable>
      </View>

      {/* AI notice */}
      <View style={styles.aiNotice}>
        <Text style={styles.aiNoticeText}>
          <IconComponent name={"sparkles"} size={15} color="#ebde2a" />
          AI will automatically detect color and generate a name for your item
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
  },

  // ── Illustration
  illustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  illustrationEmoji: {
    fontSize: 48,
  },

  // ── Text
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  // ── Buttons
  buttons: {
    width: "100%",
    gap: 12,
  },
  button: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  buttonPrimary: {
    backgroundColor: "#1C1C1E",
  },
  buttonSecondary: {
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  buttonIconLarge: {
    fontSize: 28,
    marginBottom: 4,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  buttonHint: {
    fontSize: 12,
    color: "#8E8E93",
  },
  buttonHintDark: {
    fontSize: 12,
    color: "#8E8E93",
  },
  pressed: {
    opacity: 0.8,
  },

  // ── AI notice
  aiNotice: {
    marginTop: 32,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  aiNoticeText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
  },
});
