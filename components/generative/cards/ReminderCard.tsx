import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import { ReminderCardProps, CardMode } from '@/types/generative-ui';

// Status colors
const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  active: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300', icon: 'Bell' },
  snoozed: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300', icon: 'BellOff' },
  triggered: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600 dark:text-orange-300', icon: 'BellRing' },
  completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300', icon: 'CheckCircle' },
};

// Recurrence display
const recurrenceLabels: Record<string, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

function formatReminderTime(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ` at ${timeStr}`;
  }
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) return 'Overdue';
  if (diffMins < 60) return `in ${diffMins} min`;
  if (diffHours < 24) return `in ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Tomorrow';
  return `in ${diffDays} days`;
}

/**
 * ReminderCard - Displays reminder with snooze/dismiss actions
 */
export function ReminderCard({
  id,
  title,
  description,
  remind_at,
  status = 'active',
  recurrence_type,
  mode = 'view',
  onModeChange,
  onPress,
}: ReminderCardProps) {
  const statusStyle = statusColors[status.toLowerCase()] || statusColors.active;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // View Mode - Compact reminder card
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4"
      >
        <View className="flex-row items-start gap-3">
          {/* Bell icon */}
          <View className={`w-10 h-10 rounded-xl items-center justify-center ${statusStyle.bg}`}>
            <Icon name={statusStyle.icon} size={20} />
          </View>

          <View className="flex-1">
            {/* Title */}
            <ThemedText className="text-base font-semibold mb-1" numberOfLines={1}>
              {title}
            </ThemedText>

            {/* Time info */}
            <View className="flex-row items-center gap-2">
              <Icon name="Clock" size={14} />
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                {formatReminderTime(remind_at)}
              </ThemedText>
              {remind_at && (
                <View className="bg-background dark:bg-darkBackground rounded-full px-2 py-0.5">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                    {formatRelativeTime(remind_at)}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Recurrence */}
            {recurrence_type && recurrence_type !== 'none' && (
              <View className="flex-row items-center gap-1 mt-1">
                <Icon name="Repeat" size={12} />
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {recurrenceLabels[recurrence_type] || recurrence_type}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Status badge */}
          <View className={`rounded-full px-2 py-0.5 ${statusStyle.bg}`}>
            <ThemedText className={`text-xs ${statusStyle.text}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Detail Mode - Expanded reminder with actions
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className={`w-8 h-8 rounded-lg items-center justify-center ${statusStyle.bg}`}>
            <Icon name={statusStyle.icon} size={16} />
          </View>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
            Reminder
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <ThemedText className="text-lg font-bold mb-3">{title}</ThemedText>

      {/* Status */}
      <View className="flex-row items-center gap-2 mb-3">
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
          Status
        </ThemedText>
        <View className={`rounded-full px-3 py-1 ${statusStyle.bg}`}>
          <ThemedText className={`text-sm ${statusStyle.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* Remind at */}
      <View className="flex-row items-center gap-2 mb-3">
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
          Time
        </ThemedText>
        <View className="flex-row items-center gap-2">
          <Icon name="Clock" size={16} />
          <ThemedText className="text-sm">{formatReminderTime(remind_at)}</ThemedText>
        </View>
      </View>

      {/* Recurrence */}
      {recurrence_type && (
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
            Repeats
          </ThemedText>
          <View className="flex-row items-center gap-2">
            <Icon name="Repeat" size={16} />
            <ThemedText className="text-sm">
              {recurrenceLabels[recurrence_type] || recurrence_type}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Description */}
      {description && (
        <View className="mb-4">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
            Notes
          </ThemedText>
          <ThemedText className="text-sm">{description}</ThemedText>
        </View>
      )}

      {/* Action buttons */}
      {status !== 'completed' && (
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity className="flex-1 bg-yellow-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Clock" size={16} color="#fff" />
            <ThemedText className="text-sm font-medium text-white">Snooze</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Check" size={16} color="#fff" />
            <ThemedText className="text-sm font-medium text-white">Dismiss</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit/Delete buttons */}
      <View className="flex-row gap-3 mt-3">
        <TouchableOpacity className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-3 flex-row items-center justify-center gap-2">
          <Icon name="Edit" size={16} />
          <ThemedText className="text-sm font-medium">Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-100 dark:bg-red-900 rounded-xl py-3 flex-row items-center justify-center gap-2">
          <Icon name="Trash2" size={16} />
          <ThemedText className="text-sm font-medium text-red-600 dark:text-red-300">Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ReminderCard;
