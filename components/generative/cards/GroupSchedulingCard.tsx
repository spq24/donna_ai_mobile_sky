import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { Chip } from '@/components/shared/Chip';
import { GroupSchedulingCardProps, CardMode } from '@/types/generative-ui';

// Status colors
const groupStatusColors: Record<string, { bg: string; text: string }> = {
  voting: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
  confirmed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * GroupSchedulingCard - Displays group scheduling with participants and voting
 */
export function GroupSchedulingCard({
  id,
  title,
  description,
  participants = [],
  proposed_dates = [],
  status = 'voting',
  time_range_start,
  time_range_end,
  mode = 'view',
  onModeChange,
  onPress,
}: GroupSchedulingCardProps) {
  const statusStyle = groupStatusColors[status] || groupStatusColors.voting;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // View Mode
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Icon name="Users" size={16} />
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              Group Scheduling
            </ThemedText>
          </View>
          <View className={`rounded-full px-2 py-0.5 ${statusStyle.bg}`}>
            <ThemedText className={`text-xs ${statusStyle.text}`}>
              {status === 'voting' ? 'Voting in Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText className="text-base font-semibold mb-2">{title}</ThemedText>

        {/* Participants */}
        {participants.length > 0 && (
          <View className="flex-row items-center gap-2 mb-2">
            <View className="flex-row">
              {participants.slice(0, 4).map((p, idx) => (
                <View key={p.id} style={{ marginLeft: idx > 0 ? -8 : 0 }}>
                  <Avatar size="xxs" src={p.avatar_url} name={p.name} />
                </View>
              ))}
            </View>
            {participants.length > 4 && (
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                +{participants.length - 4} more
              </ThemedText>
            )}
          </View>
        )}

        {/* Top voted date */}
        {proposed_dates.length > 0 && (
          <View className="flex-row items-center gap-2">
            <Icon name="Calendar" size={14} />
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
              {formatDate(proposed_dates[0].date)}
            </ThemedText>
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              ({proposed_dates[0].vote_count} votes)
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Detail Mode
  return (
    <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Icon name="Users" size={20} />
          <ThemedText className="text-sm font-medium">Group Scheduling</ThemedText>
        </View>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <ThemedText className="text-lg font-bold mb-2">{title}</ThemedText>

      {/* Status */}
      <View className={`self-start rounded-full px-3 py-1 mb-4 ${statusStyle.bg}`}>
        <ThemedText className={`text-sm ${statusStyle.text}`}>
          {status === 'voting' ? 'Voting in Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
        </ThemedText>
      </View>

      {/* Description */}
      {description && (
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-4">
          {description}
        </ThemedText>
      )}

      {/* Participants section */}
      <View className="mb-4">
        <ThemedText className="text-sm font-medium mb-2">
          Participants ({participants.length})
        </ThemedText>
        <View className="gap-2">
          {participants.map((p) => (
            <View key={p.id} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Avatar size="xs" src={p.avatar_url} name={p.name} />
                <ThemedText className="text-sm">{p.name}</ThemedText>
              </View>
              <View className={`rounded-full px-2 py-0.5 ${
                p.vote_status === 'voted' ? 'bg-green-100 dark:bg-green-900' :
                p.vote_status === 'declined' ? 'bg-red-100 dark:bg-red-900' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                <ThemedText className={`text-xs ${
                  p.vote_status === 'voted' ? 'text-green-600 dark:text-green-300' :
                  p.vote_status === 'declined' ? 'text-red-600 dark:text-red-300' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {p.vote_status === 'voted' ? 'Voted' :
                   p.vote_status === 'declined' ? 'Declined' : 'Pending'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Proposed dates section */}
      {proposed_dates.length > 0 && (
        <View className="mb-4">
          <ThemedText className="text-sm font-medium mb-2">Proposed Dates</ThemedText>
          <View className="gap-2">
            {proposed_dates.map((d, idx) => (
              <TouchableOpacity
                key={idx}
                className={`flex-row items-center justify-between p-3 rounded-xl ${
                  d.is_selected ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500' :
                  'bg-light-primary dark:bg-dark-primary'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="Calendar" size={16} />
                  <ThemedText className="text-sm">{formatDate(d.date)}</ThemedText>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                    <Icon name="ThumbsUp" size={12} />
                    <ThemedText className="text-xs">{d.vote_count}</ThemedText>
                  </View>
                  {d.is_selected && (
                    <Icon name="CheckCircle" size={16} color="#3b82f6" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Time constraints */}
      {(time_range_start || time_range_end) && (
        <View className="flex-row items-center gap-2 mb-4">
          <Icon name="Clock" size={16} />
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
            {time_range_start} - {time_range_end}
          </ThemedText>
        </View>
      )}

      {/* Actions */}
      {status === 'voting' && (
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-3 items-center">
            <ThemedText className="text-sm font-medium text-white">Vote</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-light-primary dark:bg-dark-primary rounded-xl py-3 items-center">
            <ThemedText className="text-sm font-medium">Decline</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default GroupSchedulingCard;
