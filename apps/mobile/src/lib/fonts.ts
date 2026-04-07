import { useFonts } from "expo-font";
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from "@expo-google-fonts/dm-serif-display";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";

// Load all custom fonts used across the auth screens and the app.
// Call this once in _layout.tsx and gate rendering behind fontsLoaded.
export function useAppFonts() {
  return useFonts({
    "DMSerif-Regular": DMSerifDisplay_400Regular,
    "DMSerif-Italic": DMSerifDisplay_400Regular_Italic,
    "DMSans-Light": DMSans_300Light,
    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Medium": DMSans_500Medium,
  });
}
