import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme as useRNColorScheme } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'nativewind';

type AppearanceMode = 'light' | 'dark' | 'system';

interface AppearanceSettingsProps {
  onBack?: () => void;
}

export default function AppearanceSettings({ onBack }: AppearanceSettingsProps) {
  const { user } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useRNColorScheme();
  const [selectedMode, setSelectedMode] = useState<AppearanceMode>('system');

  // Initialize selected mode based on current colorScheme
  useEffect(() => {
    if (colorScheme === 'light') {
      setSelectedMode('light');
    } else if (colorScheme === 'dark') {
      setSelectedMode('dark');
    } else {
      setSelectedMode('system');
    }
  }, [colorScheme]);

  const handleSelectMode = (mode: AppearanceMode) => {
    setSelectedMode(mode);
    if (mode === 'system') {
      // Use system preference
      setColorScheme(systemColorScheme || 'dark');
    } else {
      setColorScheme(mode);
    }
  };

  const renderAppearanceOption = (mode: AppearanceMode, label: string) => {
    const isSelected = selectedMode === mode;
    return (
      <Pressable
        onPress={() => handleSelectMode(mode)}
        className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-2 bg-light-secondary dark:bg-dark-secondary"
      >
        <ThemedText className="text-sm">{label}</ThemedText>
        {isSelected ? (
          <Icon name="Check" size={16} />
        ) : (
          <View style={{ width: 16, height: 16 }} />
        )}
      </Pressable>
    );
  };

  return (
    <AnimatedView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={onBack}
        userName={user?.full_name || 'User'}
        userAvatar={undefined}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-4">
            <ThemedText className="text-2xl font-semibold">Appearance</ThemedText>
          </View>

          {/* Appearance Options */}
          <View className="mb-6">
            {renderAppearanceOption('light', 'Light mode')}
            {renderAppearanceOption('dark', 'Dark mode')}
            {renderAppearanceOption('system', 'System Default')}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

