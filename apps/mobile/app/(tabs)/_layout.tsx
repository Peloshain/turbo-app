import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Simple icons with emojis (temp)
function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {emoji}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FAFAF9" },
        headerShadowVisible: false,
        headerTitleStyle: styles.headerTitle,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom }],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "My wardrobe",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/add-item")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👕" label="Clothing" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfit"
        options={{
          headerTitle: "Build Outfit",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" label="Outfit" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerTitle: "My outfits",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗂️" label="Saved" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  addButton: {
    marginRight: 16,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    backgroundColor: "#FAFAF9",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    height: 60,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: "center",
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.4,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: "#8E8E93",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#1C1C1E",
    fontWeight: "600",
  },
});
