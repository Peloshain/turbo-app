import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#C7C7CC"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#8E8E93",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: "#0A0A0A",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "transparent",
  },
  inputFocused: {
    borderBottomColor: "#0A0A0A",
  },
  inputError: {
    borderBottomColor: "#DC2626",
  },
  fieldError: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 5,
  },
});
