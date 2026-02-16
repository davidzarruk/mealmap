import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, useThemeColors } from '../theme/colors';

type ScreenContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshControl?: React.ReactElement<any>;
}>;

export function ScreenContainer({ title, subtitle, children, refreshControl }: ScreenContainerProps) {
  const theme = useThemeColors();
  const content = (
    <>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {refreshControl ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} refreshControl={refreshControl}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.container}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  body: {
    marginTop: 12,
    flex: 1,
  },
});
