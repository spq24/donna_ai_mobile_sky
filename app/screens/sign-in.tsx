import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import ThemedText from '@/components/shared/ThemedText';
import useThemeColors from '@/contexts/ThemeColors';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { login, loginWithOAuth, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to convert technical errors to user-friendly messages
  const getUserFriendlyErrorMessage = (error: any): string => {
    // Check for 401 unauthorized (wrong credentials)
    if (error.response?.status === 401) {
      return 'The email or password you entered is incorrect. Please try again.';
    }

    // Check for network errors
    if (error.message?.includes('Network') || error.code === 'ECONNREFUSED' || error.message?.includes('timeout')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Check for specific API error messages
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string' && !detail.includes('token') && !detail.includes('Token')) {
        return detail;
      }
    }

    // Generic fallback message
    return 'There was a problem signing you in. Please try again.';
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      try {
        await login(email, password);
        // Navigation is handled by AuthContext
      } catch (error: any) {
        setIsLoading(false);
        console.error('Login error:', error);
        const errorMessage = getUserFriendlyErrorMessage(error);
        Alert.alert('Sign In Failed', errorMessage);
      }
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    try {
      await loginWithOAuth(provider);
      // Navigation is handled by AuthContext
    } catch (error: any) {
      setIsLoading(false);
      console.error(`${provider} login error:`, error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  if (authLoading || isAuthenticated) {
    return null;
  }

  return (
    <View className="flex-1 bg-background dark:bg-darkBackground">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-12">
            <ThemedText className="text-4xl font-bold mb-2">Donna AI.</ThemedText>
            <ThemedText className="text-2xl font-semibold mb-1">Welcome back</ThemedText>
            <ThemedText className="text-muted-foreground dark:text-darkMutedForeground">
              Sign in to your account
            </ThemedText>
          </View>

          <View className="mb-8">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              error={passwordError}
              isPassword={true}
              autoCapitalize="none"
            />

            <View className="flex-row justify-end -mt-2">
              <Pressable onPress={() => Alert.alert('Forgot Password', 'Forgot password flow is out of scope.')}>
                <ThemedText className="text-sm font-medium underline">
                  Forgot Password?
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={isLoading}
            size="large"
            className="mb-8"
          />

          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-px bg-muted dark:bg-darkMuted" />
            <ThemedText className="mx-4 text-sm text-muted-foreground dark:text-darkMutedForeground">
              or continue with
            </ThemedText>
            <View className="flex-1 h-px bg-muted dark:bg-darkMuted" />
          </View>

          <View className="flex-row gap-3">
            <Button
              variant="outline"
              title="Google"
              className="flex-1"
              onPress={() => handleOAuthLogin('google')}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              title="Microsoft"
              className="flex-1"
              onPress={() => handleOAuthLogin('azure')}
              disabled={isLoading}
            />
          </View>

          <View className="mt-auto pt-8 flex-row justify-center">
            <ThemedText className="text-muted-foreground dark:text-darkMutedForeground">
              Don't have an account?{' '}
            </ThemedText>
            <Pressable onPress={() => Alert.alert('Sign Up', 'Sign up flow is out of scope.')}>
              <ThemedText className="font-semibold underline">
                Sign up
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

