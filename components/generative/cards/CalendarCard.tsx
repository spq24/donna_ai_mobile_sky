import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import { CalendarCardProps, CalendarEvent, CardMode } from '@/types/generative-ui';

// Event colors by index for variety
const eventColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateHeader(dateString: string): { day: string; date: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    date: date.toLocaleDateString('en-US', { month: 'short' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
  };
}

function getEventColor(index: number): string {
  return eventColors[index % eventColors.length];
}

/**
 * CalendarCard - Displays calendar events in day or week view
 */
export function CalendarCard({
  calendar_name,
  start_date,
  end_date,
  events = [],
  events_by_date,
  event_count = 0,
  single_event = false,
  mode = 'view',
  onModeChange,
  onPress,
}: CalendarCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // Render a single event item
  const renderEventItem = (event: CalendarEvent, index: number) => (
    <View
      key={event.id}
      className="flex-row items-start gap-3 py-2"
    >
      <View className={`w-1 self-stretch rounded-full ${getEventColor(index)}`} />
      <View className="flex-1">
        <ThemedText className="text-sm font-medium" numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
          {formatTime(event.start)} - {formatTime(event.end)}
        </ThemedText>
        {event.location && (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Icon name="MapPin" size={10} />
            <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground" numberOfLines={1}>
              {event.location}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );

  // View Mode - Compact day view
  if (mode === 'view') {
    const dateInfo = start_date ? formatDateHeader(start_date) : null;
    const displayEvents = events.slice(0, 4);
    const remainingCount = events.length - 4;

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4"
      >
        {/* Header with date */}
        <View className="flex-row items-start justify-between mb-3">
          {dateInfo ? (
            <View className="flex-row items-center gap-3">
              <View className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 items-center">
                <ThemedText className="text-lg font-bold">{dateInfo.day}</ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {dateInfo.weekday}
                </ThemedText>
              </View>
              <View>
                <ThemedText className="text-base font-semibold">
                  {dateInfo.date}
                </ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {event_count} event{event_count !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="Calendar" size={18} />
              <ThemedText className="text-base font-semibold">
                {calendar_name || 'Calendar'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Events list */}
        {displayEvents.length > 0 ? (
          <View className="gap-1">
            {displayEvents.map((event, idx) => renderEventItem(event, idx))}
            {remainingCount > 0 && (
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mt-1">
                +{remainingCount} more event{remainingCount !== 1 ? 's' : ''}
              </ThemedText>
            )}
          </View>
        ) : (
          <View className="py-4 items-center">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              No events scheduled
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Detail Mode - Full event details or single event
  if (mode === 'detail' && single_event && events.length === 1) {
    const event = events[0];
    return (
      <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className={`w-3 h-3 rounded-full ${getEventColor(0)}`} />
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              Calendar Event
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => onModeChange?.('view')}>
            <Icon name="X" size={20} />
          </TouchableOpacity>
        </View>

        {/* Event title */}
        <ThemedText className="text-lg font-bold mb-3">{event.title}</ThemedText>

        {/* Time */}
        <View className="flex-row items-center gap-2 mb-3">
          <Icon name="Clock" size={16} />
          <ThemedText className="text-sm">
            {formatTime(event.start)} - {formatTime(event.end)}
          </ThemedText>
        </View>

        {/* Date */}
        <View className="flex-row items-center gap-2 mb-3">
          <Icon name="Calendar" size={16} />
          <ThemedText className="text-sm">
            {new Date(event.start).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </ThemedText>
        </View>

        {/* Location */}
        {event.location && (
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name="MapPin" size={16} />
            <ThemedText className="text-sm">{event.location}</ThemedText>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View className="mb-4">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
              Description
            </ThemedText>
            <ThemedText className="text-sm">{event.description}</ThemedText>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Edit" size={16} />
            <ThemedText className="text-sm font-medium">Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Trash2" size={16} color="#fff" />
            <ThemedText className="text-sm font-medium text-white">Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Detail Mode - Multiple events by date
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Icon name="Calendar" size={20} />
          <ThemedText className="text-base font-semibold">
            {calendar_name || 'Calendar Events'}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Events grouped by date */}
      {events_by_date ? (
        Object.entries(events_by_date).map(([date, dateEvents]) => (
          <View key={date} className="mb-4">
            <ThemedText className="text-sm font-medium text-muted-foreground dark:text-darkMutedForeground mb-2">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </ThemedText>
            {dateEvents.map((event, idx) => renderEventItem(event, idx))}
          </View>
        ))
      ) : (
        <View className="gap-2">
          {events.map((event, idx) => renderEventItem(event, idx))}
        </View>
      )}

      {events.length === 0 && (
        <View className="py-8 items-center">
          <Icon name="CalendarX" size={32} />
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mt-2">
            No events in this period
          </ThemedText>
        </View>
      )}
    </View>
  );
}

export default CalendarCard;
