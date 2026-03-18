import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Iconos simples con texto/emoji para el MVP
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
          headerTitle: "Mi guardarropa",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/add-item")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Agregar</Text>
            </Pressable>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👕" label="Ropa" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfit"
        options={{
          headerTitle: "Armar outfit",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" label="Outfit" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerTitle: "Mis outfits",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗂️" label="Guardados" focused={focused} />
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
