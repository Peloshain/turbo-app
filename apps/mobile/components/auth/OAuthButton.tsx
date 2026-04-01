import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

interface Props {
  provider: "google" | "apple";
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

const PROVIDER_CONFIG = {
  google: { label: "Continue with Google", icon: "🌐" },
  apple: { label: "Continue with Apple", icon: "🍎" },
};

export function OAuthButton({ provider, onPress, loading, style }: Props) {
  const config = PROVIDER_CONFIG[provider];
  const isApple = provider === "apple";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isApple ? styles.appleButton : styles.googleButton,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          color={isApple ? "#FFFFFF" : "#1C1C1E"}
          size="small"
        />
      ) : (
        <>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={[styles.label, isApple && styles.appleLabel]}>
            {config.label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5EA",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  appleLabel: {
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.75,
  },
});
