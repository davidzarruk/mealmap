import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, type TextInput as TextInputType } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useThemeColors } from '../../theme/colors';
import { AuthStackParamList } from '../../types/navigation';
import { supabase } from '../../lib/supabase';
import { measureAsync } from '../../lib/perf';
import { logAppError } from '../../lib/errors';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function normalizeEmail(value: string) { return value.trim().toLowerCase(); }

function toUserFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('over_email_send_rate_limit')) return 'Too many sign-up attempts in a short period. Wait a moment and try again.';
  if (normalized.includes('network')) return 'Network issue detected. Check your internet connection and retry.';
  return message;
}

export function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const passwordRef = useRef<TextInputType>(null);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const canSubmit = EMAIL_REGEX.test(normalizedEmail) && password.length >= 8 && !isLoading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const { error: signUpError } = await measureAsync('auth.signUp', () => supabase.auth.signUp({ email: normalizedEmail, password }));
      if (signUpError) { setError(toUserFriendlyAuthError(signUpError.message)); } else { setSuccessMsg('Account created. Check your inbox if email confirmation is enabled.'); }
    } catch (submitError) {
      await logAppError('auth.signUp.submit', submitError);
      setError('Unexpected issue during sign-up. Please retry in a few seconds.');
    } finally { setIsLoading(false); }
  };

  return (
    <ScreenContainer title="Create your account" subtitle="Get started with secure email and password access.">
      <TextInput style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" placeholder="Email" placeholderTextColor={theme.muted} accessibilityLabel="Email address" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} autoFocus blurOnSubmit={false} />
      <TextInput ref={passwordRef} style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" placeholder="Password" placeholderTextColor={theme.muted} accessibilityLabel="Password" returnKeyType="go" onSubmitEditing={() => { Keyboard.dismiss(); onSubmit(); }} />

      <Text style={[styles.helper, { color: theme.muted }]}>Password must be at least 8 characters.</Text>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
      {successMsg ? <Text style={[styles.success, { color: theme.success }]}>{successMsg}</Text> : null}

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }, !canSubmit && styles.buttonDisabled]} onPress={onSubmit} disabled={!canSubmit}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign up</Text>}
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back to sign in</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10 },
  helper: { marginBottom: 8 },
  error: { marginBottom: 10 },
  success: { marginBottom: 10 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10, minHeight: 50, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '500' },
});
