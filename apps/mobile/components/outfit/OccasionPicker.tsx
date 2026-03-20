import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Occasion, Weather } from "../../hooks/useOutfitGenerator";

// ── Occasion options
const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: "casual", label: "Casual", emoji: "😎" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "formal", label: "Formal", emoji: "🎩" },
  { value: "sport", label: "Sport", emoji: "🏃" },
];

// ── Weather options
const WEATHER_OPTIONS: { value: Weather; label: string; emoji: string }[] = [
  { value: "hot", label: "Hot", emoji: "☀️" },
  { value: "mild", label: "Mild", emoji: "🌤️" },
  { value: "cold", label: "Cold", emoji: "🧊" },
];

interface Props {
  occasion: Occasion | null;
  weather: Weather | null;
  onOccasionChange: (v: Occasion | null) => void;
  onWeatherChange: (v: Weather | null) => void;
}

export function OccasionPicker({
  occasion,
  weather,
  onOccasionChange,
  onWeatherChange,
}: Props) {
  return (
    <View style={styles.container}>
      {/* ── Occasion row ── */}
      <Text style={styles.sectionLabel}>Occasion</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* "Any" option deselects */}
        <Pressable
          style={[styles.chip, occasion === null && styles.chipActive]}
          onPress={() => onOccasionChange(null)}
        >
          <Text style={styles.chipEmoji}>✨</Text>
          <Text
            style={[
              styles.chipLabel,
              occasion === null && styles.chipLabelActive,
            ]}
          >
            Any
          </Text>
        </Pressable>

        {OCCASIONS.map((o) => (
          <Pressable
            key={o.value}
            style={[styles.chip, occasion === o.value && styles.chipActive]}
            onPress={() =>
              onOccasionChange(occasion === o.value ? null : o.value)
            }
          >
            <Text style={styles.chipEmoji}>{o.emoji}</Text>
            <Text
              style={[
                styles.chipLabel,
                occasion === o.value && styles.chipLabelActive,
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Weather row ── */}
      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Weather</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Pressable
          style={[styles.chip, weather === null && styles.chipActive]}
          onPress={() => onWeatherChange(null)}
        >
          <Text style={styles.chipEmoji}>🌈</Text>
          <Text
            style={[
              styles.chipLabel,
              weather === null && styles.chipLabelActive,
            ]}
          >
            Any
          </Text>
        </Pressable>

        {WEATHER_OPTIONS.map((w) => (
          <Pressable
            key={w.value}
            style={[styles.chip, weather === w.value && styles.chipActive]}
            onPress={() =>
              onWeatherChange(weather === w.value ? null : w.value)
            }
          >
            <Text style={styles.chipEmoji}>{w.emoji}</Text>
            <Text
              style={[
                styles.chipLabel,
                weather === w.value && styles.chipLabelActive,
              ]}
            >
              {w.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },
  chipLabelActive: {
    color: "#FFFFFF",
  },
});
