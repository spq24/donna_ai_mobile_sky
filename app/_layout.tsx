import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GuardProvider } from '@/contexts/GuardContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { CommentProvider } from '@/contexts/CommentContext';
import { TagProvider } from '@/contexts/TagContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  useEffect(() => {
    // Call maybeCompleteAuthSession when app starts or receives a URL
    // This helps handle OAuth redirects on some platforms
    WebBrowser.maybeCompleteAuthSession();

    // Also call it when app receives a deep link
    const subscription = Linking.addEventListener('url', (event) => {
      WebBrowser.maybeCompleteAuthSession();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className={`bg-background dark:bg-darkBackground ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`} style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <CommentProvider>
                <TagProvider>
                  <GuardProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="screens/sign-in"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="screens/tasks-screen"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="screens/notifications-screen"
                    options={{ headerShown: false }}
                  />
                </Stack>
                  </GuardProvider>
                </TagProvider>
              </CommentProvider>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
