import { Stack } from "expo-router";

// Auth screens share no header — each screen manages its own top area.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
