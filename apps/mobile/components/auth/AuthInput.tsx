import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { useState } from "react";

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  isPassword?: boolean;
}

export function AuthInput({ label, error, isPassword, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#C7C7CC"
          secureTextEntry={isPassword && !visible}
          autoCorrect={false}
          autoCapitalize="none"
          {...rest}
        />
        {/* Toggle password visibility */}
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Text style={styles.eyeIcon}>{visible ? "🙈" : "👁️"}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    height: 50,
  },
  inputRowError: {
    borderColor: "#DC2626",
    backgroundColor: "#FFF2F2",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
});
