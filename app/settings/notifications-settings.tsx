import React, { useState } from 'react';
import { View, Pressable, ScrollView, Switch } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationsSettingsProps {
  onBack?: () => void;
}

export default function NotificationsSettings({ onBack }: NotificationsSettingsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [deepResearch, setDeepResearch] = useState(false);
  const [financeDigest, setFinanceDigest] = useState(false);

  const renderNotificationItem = (
    title: string,
    description: string,
    enabled: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <ThemedText className="text-sm font-medium mb-1">{title}</ThemedText>
          <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
            {description}
          </ThemedText>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
          thumbColor={enabled ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

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

          {/* Notification Items */}
          <View className="mb-6">
            {renderNotificationItem(
              'Deep research',
              'Updates when the research is complete',
              deepResearch,
              setDeepResearch
            )}
            {renderNotificationItem(
              'Finance digest',
              'After market news personalized to you',
              financeDigest,
              setFinanceDigest
            )}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

