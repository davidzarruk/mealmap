import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, type TextInput as TextInputType } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, useThemeColors } from '../../theme/colors';
import { AuthStackParamList } from '../../types/navigation';
import { supabase } from '../../lib/supabase';
import { measureAsync } from '../../lib/perf';
import { logAppError } from '../../lib/errors';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function toUserFriendlyAuthError(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (message.toLowerCase().includes('network')) {
    return 'Network issue detected. Check your internet connection and retry.';
  }

  return message;
}

export function SignInScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useThemeColors();
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInputType>(null);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const canSubmit = EMAIL_REGEX.test(normalizedEmail) && password.length >= 8 && !isLoading;

  const onSubmit = async () => {
    if (!canSubmit) return;

    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await measureAsync('auth.signInWithPassword', () =>
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        }),
      );

      if (signInError) {
        setError(toUserFriendlyAuthError(signInError.message));
      }
    } catch (submitError) {
      await logAppError('auth.signIn.submit', submitError);
      setError('Unexpected issue during sign-in. Please retry in a few seconds.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer title="Welcome back" subtitle="Sign in to continue planning your week.">
      <TextInput
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="Email"
        placeholderTextColor={theme.muted}
        accessibilityLabel="Email address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        autoFocus
        blurOnSubmit={false}
      />
      <TextInput
        ref={passwordRef}
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        placeholder="Password"
        placeholderTextColor={theme.muted}
        accessibilityLabel="Password"
        returnKeyType="go"
        onSubmitEditing={() => { Keyboard.dismiss(); onSubmit(); }}
      />

      <Text style={[styles.helper, { color: theme.muted }]}>Use at least 8 characters for your password.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]} onPress={onSubmit} disabled={!canSubmit} accessibilityRole="button" accessibilityLabel="Sign in" accessibilityState={{ disabled: !canSubmit }}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('SignUp')} accessibilityRole="button" accessibilityLabel="Create account">
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Create account</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  helper: {
    color: colors.muted,
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
