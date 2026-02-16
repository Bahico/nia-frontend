import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isMobile } = useResponsive();
  
  const accentColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const inputPadding = useResponsiveValue({ mobile: 14, tablet: 16, desktop: 18 });
  const buttonPadding = useResponsiveValue({ mobile: 16, tablet: 18, desktop: 20 });
  const fontSize = useResponsiveValue({ mobile: 16, tablet: 17, desktop: 18 });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed'), error.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ResponsiveContainer style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              {t('auth.welcomeBack')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('auth.signInContinue')}
            </ThemedText>

            <ThemedView style={styles.form}>
              <ThemedView style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={textColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { padding: inputPadding, fontSize, color: textColor }]}
                  placeholder={t('auth.username')}
                  placeholderTextColor={textColor + '80'}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={textColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { padding: inputPadding, fontSize, color: textColor }]}
                  placeholder={t('auth.password')}
                  placeholderTextColor={textColor + '80'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={textColor}
                  />
                </TouchableOpacity>
              </ThemedView>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: accentColor, paddingVertical: buttonPadding }]}
                onPress={handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={backgroundColor} />
                ) : (
                  <ThemedText
                    style={[styles.buttonText, { fontSize: fontSize! + 1 }]}
                    lightColor={backgroundColor}
                    darkColor={backgroundColor}>
                    {t('auth.signIn')}
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/register')}
                style={styles.linkContainer}
                disabled={isLoading}>
                <ThemedText style={styles.linkText}>
                  {t('auth.dontHaveAccount')}{' '}
                  <ThemedText style={[styles.linkText, { color: accentColor }]}>
                    {t('auth.signUp')}
                  </ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F6E34C40',
    borderRadius: 12,
    backgroundColor: '#2c2f38',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingLeft: 12,
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
