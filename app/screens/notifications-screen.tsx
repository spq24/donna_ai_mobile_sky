import React from 'react';
import { View, Pressable, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '@novu/react-native';
import { NovuSafeProvider, novuConfigured } from '../../components/NovuWrapper';
import AnimatedView from '../../components/shared/AnimatedView';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import useThemeColors from '@/contexts/ThemeColors';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/** Inner list that uses the Novu useNotifications hook. */
function NovuNotificationsList() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { notifications, isLoading, hasMore, fetchMore, refetch } =
    useNotifications();

  const renderNotification = ({ item }: { item: any }) => {
    const isUnread = !item.isRead;

    return (
      <Pressable
        onPress={() => {
          if (!item.isRead) {
            item.read();
          }
        }}
        className={`px-4 py-3 border-b border-border dark:border-darkBorder ${
          isUnread ? 'bg-accent/30 dark:bg-darkAccent/30' : ''
        }`}
      >
        <View className="flex-row items-start gap-3">
          <View className="mt-2">
            {isUnread ? (
              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
            ) : (
              <View className="w-2.5 h-2.5 rounded-full bg-transparent" />
            )}
          </View>
          <View className="flex-1">
            {item.subject && (
              <ThemedText
                className={`text-sm mb-0.5 ${
                  isUnread ? 'font-semibold' : 'font-medium'
                }`}
              >
                {item.subject}
              </ThemedText>
            )}
            {item.body && (
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground leading-relaxed">
                {item.body}
              </ThemedText>
            )}
            <ThemedText className="text-[10px] text-muted-foreground dark:text-darkMutedForeground mt-1">
              {formatTimeAgo(new Date(item.createdAt))}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Icon name="BellOff" size={48} color={colors.mutedForeground} />
        <ThemedText className="text-base font-medium mt-4">
          No notifications yet
        </ThemedText>
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mt-1 text-center px-8">
          When you receive notifications, they will appear here.
        </ThemedText>
      </View>
    );
  };

  if (isLoading && (!notifications || notifications.length === 0)) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      onEndReached={hasMore ? fetchMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 20,
      }}
    />
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-border dark:border-darkBorder"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-10 h-10 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
        >
          <Icon name="ArrowLeft" size={20} />
        </Pressable>
        <ThemedText className="text-lg font-semibold ml-3 flex-1">
          Notifications
        </ThemedText>
      </View>

      {novuConfigured ? (
        <NovuSafeProvider>
          <NovuNotificationsList />
        </NovuSafeProvider>
      ) : (
        <View className="flex-1 items-center justify-center py-20">
          <Icon name="BellOff" size={48} />
          <ThemedText className="text-base font-medium mt-4">
            Notifications not configured
          </ThemedText>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mt-1 text-center px-8">
            Set up your Novu application identifier to enable notifications.
          </ThemedText>
        </View>
      )}
    </AnimatedView>
  );
}
