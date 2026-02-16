import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ResponsiveContainer } from '@/components/responsive-container';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { isMobile } = useResponsive();
  
  const accentColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const inputPadding = useResponsiveValue({ mobile: 14, tablet: 16, desktop: 18 });
  const buttonPadding = useResponsiveValue({ mobile: 16, tablet: 18, desktop: 20 });
  const fontSize = useResponsiveValue({ mobile: 16, tablet: 17, desktop: 18 });

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
    } catch (error: any) {
      Alert.alert(t('auth.registrationFailed'), error.message || t('auth.registrationError'));
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
              {t('auth.createAccount')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('auth.signUpToStart')}
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
                  placeholder={t('auth.nameOptional')}
                  placeholderTextColor={textColor + '80'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={textColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { padding: inputPadding, fontSize, color: textColor }]}
                  placeholder={t('auth.email')}
                  placeholderTextColor={textColor + '80'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
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

              <ThemedView style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={textColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { padding: inputPadding, fontSize, color: textColor }]}
                  placeholder={t('auth.confirmPassword')}
                  placeholderTextColor={textColor + '80'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={textColor}
                  />
                </TouchableOpacity>
              </ThemedView>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: accentColor, paddingVertical: buttonPadding }]}
                onPress={handleRegister}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={backgroundColor} />
                ) : (
                  <ThemedText
                    style={[styles.buttonText, { fontSize: fontSize! + 1 }]}
                    lightColor={backgroundColor}
                    darkColor={backgroundColor}>
                    {t('auth.signUp')}
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/login')}
                style={styles.linkContainer}
                disabled={isLoading}>
                <ThemedText style={styles.linkText}>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <ThemedText style={[styles.linkText, { color: accentColor }]}>
                    {t('auth.signIn')}
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
