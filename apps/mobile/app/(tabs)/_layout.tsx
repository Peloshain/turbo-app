import { Tabs } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";
import { IconComponent } from "../../components/ui/Icon";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FAFAF9" },
        headerShadowVisible: false,
        headerTitleStyle: styles.headerTitle,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom }],
        tabBarShowLabel: false,
        // headerRight: () => <LogOutButton />,
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
            <IconComponent
              name="wardrobe"
              color={focused ? "#1C1C1E" : "#8E8E93"}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="outfit"
        options={{
          headerTitle: "Build Outfit",
          tabBarIcon: ({ focused }) => {
            const iconName = aiHelperEnabled ? "generate" : "generate-off";
            return (
              <IconComponent
                name={iconName}
                color={focused ? "#1C1C1E" : "#8E8E93"}
                size={24}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerTitle: "My outfits",
          tabBarIcon: ({ focused }) => (
            <IconComponent
              name="outfits"
              color={focused ? "#1C1C1E" : "#8E8E93"}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <IconComponent
              name="profile"
              color={focused ? "#1C1C1E" : "#8E8E93"}
              size={24}
            />
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
  text: {
    fontSize: 15,
    color: "#e00",
  },
  button: {
    marginRight: 16,
  },
});
