import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import { Chip } from '@/components/shared/Chip';
import { SchedulingTaskCardProps, CardMode } from '@/types/generative-ui';

// Scheduling status colors
const schedulingStatusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300', icon: 'Clock' },
  calling: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300', icon: 'Phone' },
  in_progress: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-600 dark:text-cyan-300', icon: 'Loader' },
  scheduled: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300', icon: 'CheckCircle' },
  failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300', icon: 'XCircle' },
};

function formatSchedulingStatus(status?: string): string {
  if (!status) return 'Pending';
  const statusMap: Record<string, string> = {
    pending: 'Waiting to Call',
    calling: 'Calling...',
    in_progress: 'In Progress',
    scheduled: 'Scheduled',
    failed: 'Failed',
  };
  return statusMap[status.toLowerCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * SchedulingTaskCard - Displays scheduling tasks with vendor and call information
 */
export function SchedulingTaskCard({
  id,
  title,
  description,
  status = 'pending',
  priority = 'high',
  due_date,
  scheduling_task,
  mode = 'view',
  onModeChange,
  onPress,
}: SchedulingTaskCardProps) {
  const schedulingStatus = scheduling_task?.status?.toLowerCase() || 'pending';
  const statusStyle = schedulingStatusColors[schedulingStatus] || schedulingStatusColors.pending;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // View Mode - Compact scheduling card
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4 border-l-4 border-purple-500"
      >
        {/* Header with AI badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center">
              <Icon name="Bot" size={14} color="#fff" />
            </View>
            <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
              AI Scheduling Task
            </ThemedText>
          </View>
          <View className={`rounded-full px-2 py-0.5 flex-row items-center gap-1 ${statusStyle.bg}`}>
            <Icon name={statusStyle.icon} size={12} color={statusStyle.text.includes('600') ? '#047857' : '#34d399'} />
            <ThemedText className={`text-xs ${statusStyle.text}`}>
              {formatSchedulingStatus(scheduling_task?.status)}
            </ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText className="text-base font-semibold mb-1" numberOfLines={1}>
          {title}
        </ThemedText>

        {/* Vendor info */}
        {scheduling_task?.vendor_name && (
          <View className="flex-row items-center gap-2 mb-2">
            <Icon name="Building" size={14} />
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              {scheduling_task.vendor_name}
            </ThemedText>
            {scheduling_task.vendor_category && (
              <Chip label={scheduling_task.vendor_category} size="xs" />
            )}
          </View>
        )}

        {/* Service and timing */}
        <View className="flex-row items-center gap-4">
          {scheduling_task?.requested_service && (
            <View className="flex-row items-center gap-1">
              <Icon name="FileText" size={14} />
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                {scheduling_task.requested_service}
              </ThemedText>
            </View>
          )}
          {scheduling_task?.timing_preferences && (
            <View className="flex-row items-center gap-1">
              <Icon name="Clock" size={14} />
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                {scheduling_task.timing_preferences}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Detail Mode - Expanded scheduling card
  if (mode === 'detail') {
    return (
      <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4 border-l-4 border-purple-500">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center">
              <Icon name="Bot" size={18} color="#fff" />
            </View>
            <View>
              <ThemedText className="text-sm font-medium">AI Scheduling</ThemedText>
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                Task #{id}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => onModeChange?.('view')}>
            <Icon name="X" size={20} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <ThemedText className="text-lg font-bold mb-3">{title}</ThemedText>

        {/* Status */}
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
            Call Status
          </ThemedText>
          <View className={`rounded-full px-3 py-1 flex-row items-center gap-1 ${statusStyle.bg}`}>
            <Icon name={statusStyle.icon} size={14} />
            <ThemedText className={`text-sm ${statusStyle.text}`}>
              {formatSchedulingStatus(scheduling_task?.status)}
            </ThemedText>
          </View>
        </View>

        {/* Vendor info */}
        {scheduling_task?.vendor_name && (
          <>
            <View className="flex-row items-center gap-2 mb-3">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
                Vendor
              </ThemedText>
              <View className="flex-row items-center gap-2">
                <Icon name="Building" size={16} />
                <ThemedText className="text-sm">{scheduling_task.vendor_name}</ThemedText>
              </View>
            </View>

            {scheduling_task.vendor_phone && (
              <View className="flex-row items-center gap-2 mb-3">
                <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
                  Phone
                </ThemedText>
                <View className="flex-row items-center gap-2">
                  <Icon name="Phone" size={16} />
                  <ThemedText className="text-sm">{scheduling_task.vendor_phone}</ThemedText>
                </View>
              </View>
            )}

            {scheduling_task.vendor_category && (
              <View className="flex-row items-center gap-2 mb-3">
                <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
                  Category
                </ThemedText>
                <Chip label={scheduling_task.vendor_category} size="sm" />
              </View>
            )}
          </>
        )}

        {/* Service */}
        {scheduling_task?.requested_service && (
          <View className="flex-row items-center gap-2 mb-3">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
              Service
            </ThemedText>
            <ThemedText className="text-sm">{scheduling_task.requested_service}</ThemedText>
          </View>
        )}

        {/* Timing preferences */}
        {scheduling_task?.timing_preferences && (
          <View className="flex-row items-center gap-2 mb-3">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-24">
              Preferred Time
            </ThemedText>
            <ThemedText className="text-sm">{scheduling_task.timing_preferences}</ThemedText>
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
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity className="flex-1 bg-purple-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Phone" size={16} color="#fff" />
            <ThemedText className="text-sm font-medium text-white">Call Now</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Calendar" size={16} />
            <ThemedText className="text-sm font-medium">Reschedule</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Form mode not typical for scheduling cards, fallback to detail
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      <ThemedText>Scheduling Task #{id}</ThemedText>
    </View>
  );
}

export default SchedulingTaskCard;
