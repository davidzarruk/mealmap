import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useThemeColors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { trackEvent } from '../../lib/analytics';
import {
  cancelDailyReminder,
  loadReminderSettings,
  ReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
  scheduleDailyReminder,
} from '../../lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'mealmap/profile';

type ProfileData = { displayName: string; foodPreferences: string };
const DEFAULT_PROFILE: ProfileData = { displayName: '', foodPreferences: '' };

export function ProfileScreen() {
  const theme = useThemeColors();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, hour: 12, minute: 0 });

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => { if (raw) setProfile(JSON.parse(raw) as ProfileData); })
      .catch(() => undefined);
    loadReminderSettings().then(setReminder).catch(() => undefined);
  }, []);

  const onSave = async () => {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    trackEvent('plan_created', { action: 'profile_saved' }).catch(() => undefined);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permission required', 'Enable notifications in your device settings to use reminders.');
        return;
      }
      await scheduleDailyReminder(reminder.hour, reminder.minute);
    } else {
      await cancelDailyReminder();
    }
    const next = { ...reminder, enabled };
    setReminder(next);
    await saveReminderSettings(next);
  };

  const updateReminderTime = async (hour: number, minute: number) => {
    const next = { ...reminder, hour, minute };
    setReminder(next);
    await saveReminderSettings(next);
    if (next.enabled) {
      await scheduleDailyReminder(hour, minute);
    }
  };

  const onSignOut = async () => { await supabase.auth.signOut({ scope: 'global' }); };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out on all devices?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenContainer title="Profile & Settings" subtitle="Manage your account and preferences.">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Display name</Text>
          <TextInput style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]} value={profile.displayName} onChangeText={(v) => setProfile((p) => ({ ...p, displayName: v }))} placeholder="Your name" placeholderTextColor={theme.muted} />

          <Text style={[styles.label, { color: theme.text }]}>Food preferences / allergies</Text>
          <TextInput style={[styles.input, styles.multiline, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]} value={profile.foodPreferences} onChangeText={(v) => setProfile((p) => ({ ...p, foodPreferences: v }))} placeholder="e.g. No seafood, lactose intolerant" placeholderTextColor={theme.muted} multiline numberOfLines={3} />

          <Pressable style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={onSave}>
            <Text style={styles.saveButtonText}>{saved ? '✓ Saved' : 'Save changes'}</Text>
          </Pressable>
        </View>

        {/* Notification reminder */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily reminder</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>Enable daily notification</Text>
            <Switch value={reminder.enabled} onValueChange={toggleReminder} />
          </View>
          {reminder.enabled ? (
            <View style={styles.timeRow}>
              <Text style={[styles.timeLabel, { color: theme.muted }]}>Time:</Text>
              <TextInput style={[styles.timeInput, { borderColor: theme.border, color: theme.text }]} value={String(reminder.hour)} onChangeText={(v) => { const h = Math.min(23, Math.max(0, Number(v) || 0)); updateReminderTime(h, reminder.minute); }} keyboardType="number-pad" maxLength={2} />
              <Text style={[styles.timeSeparator, { color: theme.text }]}>:</Text>
              <TextInput style={[styles.timeInput, { borderColor: theme.border, color: theme.text }]} value={String(reminder.minute).padStart(2, '0')} onChangeText={(v) => { const m = Math.min(59, Math.max(0, Number(v) || 0)); updateReminderTime(reminder.hour, m); }} keyboardType="number-pad" maxLength={2} />
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          <Pressable style={[styles.signOutButton, { borderColor: theme.danger }]} onPress={confirmSignOut}>
            <Text style={[styles.signOutText, { color: theme.danger }]}>Sign out on all devices</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.versionText, { color: theme.muted }]}>Mealmap v{appVersion}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  label: { fontWeight: '600', marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  saveButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: {},
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeLabel: { fontSize: 14 },
  timeInput: { borderWidth: 1, borderRadius: 8, width: 44, textAlign: 'center', paddingVertical: 6 },
  timeSeparator: { fontWeight: '700', fontSize: 16 },
  signOutButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontWeight: '600' },
  versionText: { textAlign: 'center', fontSize: 12 },
});
