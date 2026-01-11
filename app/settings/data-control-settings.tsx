import React, { useState } from 'react';
import { View, Pressable, ScrollView, Switch } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface DataControlSettingsProps {
  onBack?: () => void;
}

export default function DataControlSettings({ onBack }: DataControlSettingsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [allowLearning, setAllowLearning] = useState(true);

  const renderSection = (
    title: string,
    description: string,
    actionLabel: string,
    onActionPress: () => void,
    showToggle?: boolean,
    toggleValue?: boolean,
    onToggle?: (value: boolean) => void
  ) => (
    <View className="mb-6">
      <View className="mb-3">
        <ThemedText className="text-sm font-medium mb-1">{title}</ThemedText>
        <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
          {description}
        </ThemedText>
      </View>
      {showToggle && toggleValue !== undefined && onToggle ? (
        <View className="flex-row items-center justify-between">
          <ThemedText className="text-xs">Allow learning from chats</ThemedText>
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
            thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
          />
        </View>
      ) : (
        <Pressable
          onPress={onActionPress}
          className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2 self-start"
          style={shadowPresets.small}
        >
          <ThemedText className="text-xs">{actionLabel}</ThemedText>
        </Pressable>
      )}
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

          {/* Chat History */}
          {renderSection(
            'Chat History',
            'Your past conversations help personalize your AI experience.',
            'Clear all chats',
            () => console.log('Clear all chats')
          )}

          {/* Training & Personalization */}
          {renderSection(
            'Training & Personalization',
            "Decide whether your interactions help improve SkyAI's models.",
            'Allow learning from chats',
            () => {},
            true,
            allowLearning,
            setAllowLearning
          )}

          {/* Data Export */}
          {renderSection(
            'Data Export',
            'Download your data, including conversations and preferences.',
            'Request Export',
            () => console.log('Request Export')
          )}

          {/* Delete My Data */}
          {renderSection(
            'Delete My Data',
            'Delete your data from SkyAI. This is permanent.',
            'Delete Everything',
            () => console.log('Delete Everything')
          )}
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

