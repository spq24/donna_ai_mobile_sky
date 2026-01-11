import React, { useState } from 'react';
import { View, Pressable, ScrollView, Switch, TextInput } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface SecuritySettingsProps {
  onBack?: () => void;
}

export default function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [apiKey] = useState('sk-jXekW9pEQHGsj9w9R0Jl0BlbkFJUKfBVMv9YZeW8c6jTr56');

  const handleCopyApiKey = () => {
    // Copy to clipboard logic
    console.log('Copy API key');
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
            <ThemedText className="text-2xl font-semibold">Header</ThemedText>
            <View className="h-px bg-light-secondary dark:bg-dark-secondary mt-4" />
          </View>

          {/* Password */}
          <View className="mb-6">
            <View className="mb-3">
              <ThemedText className="text-sm font-medium mb-1">Password</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Keep your password strong and updated.
              </ThemedText>
            </View>
            <Pressable
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2 self-start"
              style={shadowPresets.small}
            >
              <ThemedText className="text-xs">Update Password</ThemedText>
            </Pressable>
          </View>

          {/* Two-factor authentication */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <ThemedText className="text-sm font-medium mb-1">Two-factor authentication</ThemedText>
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  Add an extra step for stronger protection.
                </ThemedText>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                thumbColor={twoFactorEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Active Sessions */}
          <View className="mb-6">
            <View className="mb-3">
              <ThemedText className="text-sm font-medium mb-1">Active Sessions</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Manage and sign out from active devices.
              </ThemedText>
            </View>
            <Pressable
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2 self-start"
              style={shadowPresets.small}
            >
              <ThemedText className="text-xs">Sign out from all devices</ThemedText>
            </Pressable>
          </View>

          {/* API & Access Keys */}
          <View className="mb-6">
            <View className="mb-3">
              <ThemedText className="text-sm font-medium mb-1">API & Access Keys</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Control and secure your access keys.
              </ThemedText>
            </View>
            <View className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-3 mb-3">
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-xs flex-1" numberOfLines={1}>
                  {apiKey}
                </ThemedText>
                <Pressable
                  onPress={handleCopyApiKey}
                  className="flex-row items-center gap-1 bg-light-primary dark:bg-dark-primary rounded-lg px-2 py-1 ml-2"
                >
                  <Icon name="Copy" size={14} />
                  <ThemedText className="text-xs">Copy</ThemedText>
                </Pressable>
              </View>
            </View>
            <Pressable
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2 self-start"
              style={shadowPresets.small}
            >
              <ThemedText className="text-xs">Generate New Key</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

