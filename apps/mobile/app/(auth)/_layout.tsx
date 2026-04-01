import { Stack } from "expo-router";

// Auth screens share a stack with no visible header —
// each screen manages its own back navigation manually.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    />
  );
}
