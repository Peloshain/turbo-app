import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { authStyles, colors, fonts } from "../../src/lib/theme";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={authStyles.label}>{label}</Text>
      <TextInput
        style={[
          authStyles.inputBase,
          focused && authStyles.inputFocused,
          error && authStyles.inputError,
          style,
        ]}
        placeholderTextColor={colors.gray400}
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
  fieldError: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
  },
});
