import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect } from 'react';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const accentColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonPadding = useResponsiveValue({ mobile: 16, tablet: 18, desktop: 20 });
  const fontSize = useResponsiveValue({ mobile: 16, tablet: 17, desktop: 18 });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ResponsiveContainer style={styles.content}>
          <ThemedText type="title" style={styles.title}>Profile</ThemedText>
          
          <ThemedView style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={accentColor} />
            </View>
            
            <ThemedText type="subtitle" style={styles.name}>
              {user?.name || 'User'}
            </ThemedText>
            
            <ThemedText style={styles.email}>
              {user?.email}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[styles.logoutButton, { 
              backgroundColor: accentColor, 
              paddingVertical: buttonPadding 
            }]}
            onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={backgroundColor} style={styles.logoutIcon} />
            <ThemedText
              style={[styles.logoutButtonText, { fontSize: fontSize! + 1 }]}
              lightColor={backgroundColor}
              darkColor={backgroundColor}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </ResponsiveContainer>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
  },
  content: {
    maxWidth: 480,
    width: '100%',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#2c2f38',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F6E34C20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    opacity: 0.7,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 4,
  },
  logoutButtonText: {
    fontWeight: '600',
  },
});

