import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSession } from "@repo/auth-expo";

// ─── Auth gate ────────────────────────────────────────────
// Reads the current session and redirects to the right group.
// Shows a spinner while the session is being restored from
// secure storage on device — avoids a flash of the wrong screen.
export default function Index() {
  const { isAuthenticated, isLoading } = useSession();

  // Wait for session restore before deciding where to go
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1C1C1E" />
      </View>
    );
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF9",
  },
});
