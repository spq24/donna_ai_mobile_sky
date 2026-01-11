import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import ChatScreen from './screens/chat-screen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-primary dark:bg-dark-primary">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // GuardContext handles the redirection if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <ChatScreen />;
}
