import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage your account and personal settings here.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxWidth: 480,
    paddingHorizontal: 24,
  },
  subtitle: {
    marginTop: 12,
  },
});

