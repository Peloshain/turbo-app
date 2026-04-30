import { ScrollView, Pressable, Text, StyleSheet, View } from "react-native";
import { Category } from "../../hooks/useCategories";

interface Props {
  categories: Category[];
  selected: string | null; // category slug or null for "All"
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {/* "All" pill — always first */}
      <Pressable
        style={[styles.pill, selected === null && styles.pillActive]}
        onPress={() => onSelect(null)}
      >
        <Text
          style={[styles.pillText, selected === null && styles.pillTextActive]}
        >
          All
        </Text>
      </Pressable>

      {categories.map((cat) => (
        <Pressable
          key={cat.slug}
          style={[styles.pill, selected === cat.slug && styles.pillActive]}
          onPress={() => onSelect(cat.slug)}
        >
          <Text style={styles.pillIcon}>{cat.icon}</Text>
          <Text
            style={[
              styles.pillText,
              selected === cat.slug && styles.pillTextActive,
            ]}
          >
            {cat.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
    height: 52,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    borderWidth: 1.5,
    borderColor: "transparent",
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
  },
  pillIcon: {
    fontSize: 13,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
});
