import React from 'react';
import { View, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { usePreferences } from '@novu/react-native';
import { NovuSafeProvider, novuConfigured } from '../../components/NovuWrapper';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationsSettingsProps {
  onBack?: () => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'In-App',
  chat: 'Chat',
  push: 'Push',
};

/** Inner content that calls the Novu usePreferences hook. */
function NovuPreferencesContent() {
  const colors = useThemeColors();
  const { preferences, isLoading, error } = usePreferences();

  return (
    <>
      {/* Loading state */}
      {isLoading && (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <View className="py-8 items-center">
          <ThemedText className="text-sm text-red-500">
            Failed to load preferences. Please try again.
          </ThemedText>
        </View>
      )}

      {/* Preferences list */}
      {!isLoading && preferences && preferences.length > 0 && (
        <View className="mb-6">
          {preferences.map((pref, index) => {
            const channels = pref.channels || {};
            const channelEntries = Object.entries(channels).filter(
              ([, value]) => value !== undefined
            );

            if (channelEntries.length === 0) return null;

            const workflowName = pref.workflow?.name || (pref.level === 'global' ? 'Global Preferences' : `Workflow ${index + 1}`);
            const isCritical = pref.workflow?.critical ?? false;

            return (
              <View
                key={pref.workflow?.id || `pref-${index}`}
                className="mb-5 pb-4 border-b border-border dark:border-darkBorder last:border-b-0"
              >
                <View className="mb-2">
                  <ThemedText className="text-base font-medium">
                    {workflowName}
                  </ThemedText>
                  {isCritical && (
                    <ThemedText className="text-xs text-orange-500 mt-0.5">
                      Critical — cannot be disabled
                    </ThemedText>
                  )}
                </View>
                {channelEntries.map(([channelType, enabled]) => (
                  <View key={channelType} className="flex-row items-center justify-between py-2">
                    <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                      {CHANNEL_LABELS[channelType] || channelType}
                    </ThemedText>
                    <Switch
                      value={Boolean(enabled)}
                      disabled={isCritical}
                      onValueChange={(value) => {
                        pref.update({
                          channels: { [channelType]: value },
                        });
                      }}
                      trackColor={{ false: colors.muted, true: colors.primary }}
                      thumbColor={enabled ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}

      {/* Empty state */}
      {!isLoading && (!preferences || preferences.length === 0) && !error && (
        <View className="py-12 items-center">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
            No notification preferences available yet.
          </ThemedText>
        </View>
      )}
    </>
  );
}

export default function NotificationsSettings({ onBack }: NotificationsSettingsProps) {
  const { user } = useAuth();

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={onBack}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-4">
            <ThemedText className="text-2xl font-semibold">Notifications</ThemedText>
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mt-1">
              Manage how and when you receive notifications for each workflow.
            </ThemedText>
            <View className="h-px bg-muted dark:bg-darkMuted mt-4" />
          </View>

          {novuConfigured ? (
            <NovuSafeProvider>
              <NovuPreferencesContent />
            </NovuSafeProvider>
          ) : (
            <View className="py-12 items-center">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                Notification preferences are not available yet. Configure the
                Novu application identifier to enable this feature.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedView>
  );
}
