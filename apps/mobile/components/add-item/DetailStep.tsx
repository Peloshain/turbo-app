import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";

// A curated palette of common clothing colors
const PRESET_COLORS: { label: string; hex: string }[] = [
  { label: "White", hex: "#FFFFFF" },
  { label: "Cream", hex: "#FFFDD0" },
  { label: "Light Gray", hex: "#D1D1D6" },
  { label: "Gray", hex: "#8E8E93" },
  { label: "Dark Gray", hex: "#48484A" },
  { label: "Black", hex: "#1C1C1E" },
  { label: "Beige", hex: "#D4B896" },
  { label: "Tan", hex: "#C4A882" },
  { label: "Brown", hex: "#7C5C3E" },
  { label: "Chocolate", hex: "#4A2C1A" },
  { label: "Red", hex: "#FF3B30" },
  { label: "Burgundy", hex: "#7B1C2A" },
  { label: "Pink", hex: "#FF6B9D" },
  { label: "Rose", hex: "#E8A0A0" },
  { label: "Orange", hex: "#FF9500" },
  { label: "Peach", hex: "#FFCBA4" },
  { label: "Yellow", hex: "#FFCC00" },
  { label: "Olive", hex: "#6B7C3A" },
  { label: "Green", hex: "#34C759" },
  { label: "Forest", hex: "#1A4A2E" },
  { label: "Mint", hex: "#A8E6CF" },
  { label: "Sky Blue", hex: "#AED6F1" },
  { label: "Blue", hex: "#007AFF" },
  { label: "Navy", hex: "#1C2E5E" },
  { label: "Denim", hex: "#4A6FA5" },
  { label: "Purple", hex: "#AF52DE" },
  { label: "Lavender", hex: "#D4A8E8" },
  { label: "Mauve", hex: "#B07090" },
];

interface Props {
  name: string;
  colorDesc: string;
  colorHex: string;
  onNameChange: (v: string) => void;
  onColorDescChange: (v: string) => void;
  onColorHexChange: (v: string) => void;
  onNext: () => void;
}

export function DetailsStep({
  name,
  colorDesc,
  colorHex,
  onNameChange,
  onColorDescChange,
  onColorHexChange,
  onNext,
}: Props) {
  const canProceed = name.trim().length > 0 && colorDesc.trim().length > 0;

  // Sanitize hex input — ensure it always starts with #
  function handleHexInput(raw: string) {
    let val = raw.trim();
    if (val && !val.startsWith("#")) val = `#${val}`;
    onColorHexChange(val.slice(0, 7).toUpperCase());
  }

  const previewColor = colorHex.match(/^#[0-9A-Fa-f]{6}$/)
    ? colorHex
    : "#E5E5EA";

  return (
    <View style={styles.container}>
      {/* ── Name ── */}
      <View style={styles.field}>
        <Text style={styles.label}>Item name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. White Oxford Shirt"
          placeholderTextColor="#AEAEB2"
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      {/* ── Color label ── */}
      <View style={styles.field}>
        <Text style={styles.label}>Color description</Text>
        <TextInput
          style={styles.input}
          value={colorDesc}
          onChangeText={onColorDescChange}
          placeholder="e.g. Navy Blue"
          placeholderTextColor="#AEAEB2"
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      {/* ── Hex input + live preview ── */}
      <View style={styles.field}>
        <Text style={styles.label}>Color (hex)</Text>
        <View style={styles.hexRow}>
          <View
            style={[styles.colorPreview, { backgroundColor: previewColor }]}
          />
          <TextInput
            style={[styles.input, styles.hexInput]}
            value={colorHex}
            onChangeText={handleHexInput}
            placeholder="#000000"
            placeholderTextColor="#AEAEB2"
            autoCapitalize="characters"
            maxLength={7}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* ── Preset palette ── */}
      <View style={styles.field}>
        <Text style={styles.label}>Quick pick</Text>
        <View style={styles.palette}>
          {PRESET_COLORS.map((c) => {
            const active = colorHex.toUpperCase() === c.hex.toUpperCase();
            return (
              <Pressable
                key={c.hex}
                onPress={() => {
                  onColorHexChange(c.hex);
                  onColorDescChange(c.label);
                }}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex },
                  c.hex === "#FFFFFF" && styles.swatchBorder,
                  active && styles.swatchActive,
                ]}
              >
                {active && (
                  <Text style={styles.swatchCheck}>
                    {c.hex === "#FFFFFF" ||
                    c.hex === "#FFFDD0" ||
                    c.hex === "#D1D1D6"
                      ? "✓"
                      : "✓"}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Next ── */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          !canProceed && styles.nextButtonDisabled,
          pressed && canProceed && { opacity: 0.85 },
        ]}
        onPress={onNext}
        disabled={!canProceed}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24, paddingTop: 24 },

  field: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1C1C1E",
    backgroundColor: "#fff",
  },

  // Hex row
  hexRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorPreview: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  hexInput: { flex: 1 },

  // Palette
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  swatchActive: {
    borderWidth: 2.5,
    borderColor: "#1C1C1E",
  },
  swatchCheck: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
  },

  // Next button
  nextButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  nextButtonDisabled: { opacity: 0.35 },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
