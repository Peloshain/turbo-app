import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { AuthProvider } from "@repo/auth-expo";

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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              {/* Auth gate — decides which group to show */}
              <Stack.Screen name="index" />

              {/* Unauthenticated screens */}
              <Stack.Screen name="(auth)" />

              {/* Authenticated screens */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="add-item/index"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="item/[id]"
                options={{
                  headerShown: true,
                  headerTitle: "Item",
                  headerBackTitle: "Back",
                }}
              />
            </Stack>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// const s = StyleSheet.create({
//   errContainer: {
//     flex: 1, alignItems: 'center', justifyContent: 'center',
//     padding: 32, backgroundColor: '#FAFAF9', gap: 12,
//   },
//   errEmoji: { fontSize: 48 },
//   errTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
//   errMsg: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
//   errButton: {
//     marginTop: 8, backgroundColor: '#1C1C1E',
//     paddingHorizontal: 28, paddingVertical: 13, borderRadius: 25,
//   },
//   errButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
// })
