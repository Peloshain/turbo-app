import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { IconComponent } from "../ui/Icon";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: Props) {
  return (
    <View style={styles.container}>
      <IconComponent name={"search"} size={16} color="#8E8E93" />
      <TextInput
        style={styles.input}
        placeholder="Search by name or color..."
        placeholderTextColor="#C7C7CC"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        clearButtonMode="never" // We handle clear manually for Android compat
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton} hitSlop={8}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    paddingVertical: 0, // Remove default Android padding
  },
  clearButton: {
    padding: 2,
  },
  clearText: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
