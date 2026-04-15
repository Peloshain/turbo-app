import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "expo-router";

export function SocialButtons() {
  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  async function handleGoogle() {
    setLoadingGoogle(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(tabs)",
    });
    setLoadingGoogle(false);
    if (error) console.error("[SocialButtons] Google error:", error.message);
  }

  async function handleApple() {
    setLoadingApple(true);
    const { error } = await authClient.signIn.social({
      provider: "apple",
      callbackURL: "/(tabs)",
    });
    setLoadingApple(false);
    if (error) console.error("[SocialButtons] Apple error:", error.message);
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleGoogle}
        disabled={loadingGoogle}
      >
        {loadingGoogle ? (
          <ActivityIndicator color="#8E8E93" size="small" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleApple}
        disabled={loadingApple}
      >
        {loadingApple ? (
          <ActivityIndicator color="#8E8E93" size="small" />
        ) : (
          <Text style={styles.buttonText}>Continue with Apple</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    borderWidth: 0.5,
    borderColor: "#E5E5EA",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  pressed: {
    opacity: 0.7,
  },
});
