import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useEffect } from "react";
import { authClient } from "../lib/auth-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once before showing error — avoids flashing errors on slow connections
      retry: 1,
      // Keep data fresh for 2 minutes before background refetch
      staleTime: 2 * 60 * 1000,
    },
  },
});

// Simple class-based error boundary — hooks can't catch render errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={boundaryStyles.container}>
          <Text style={boundaryStyles.emoji}>😵</Text>
          <Text style={boundaryStyles.title}>Something went wrong</Text>
          <Text style={boundaryStyles.message}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <Pressable
            style={boundaryStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={boundaryStyles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const boundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FAFAF9",
    gap: 12,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: "700", color: "#1C1C1E" },
  message: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 25,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return; // wait until session is resolved

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Not signed in → go to sign-in
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      // Signed in but still on auth screens → go to app
      router.replace("/(tabs)");
    }
  }, [session, isPending, segments]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-item/index"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="edit-profile/index"
              options={{
                headerTitle: "Edit Profile",
                headerBackTitle: "Profile",
              }}
            />
            <Stack.Screen
              name="item/[id]"
              options={{ headerTitle: "Item", headerBackTitle: "Back" }}
            />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
