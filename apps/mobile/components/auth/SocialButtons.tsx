import { View, Text, Pressable, StyleSheet } from "react-native";
import { authStyles, colors, fonts } from "../../src/lib/theme";
import { useAuth } from "../../src/auth/useAuth";

export function SocialButtons() {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          authStyles.buttonGhost,
          pressed && styles.pressed,
        ]}
        onPress={signInWithGoogle}
      >
        <Text style={authStyles.buttonGhostText}>Continue with Google</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          authStyles.buttonGhost,
          styles.appleButton,
          pressed && styles.pressed,
        ]}
        onPress={signInWithApple}
      >
        <Text style={authStyles.buttonGhostText}>Continue with Apple</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  appleButton: {
    marginTop: 0,
  },
  pressed: {
    opacity: 0.7,
  },
});
