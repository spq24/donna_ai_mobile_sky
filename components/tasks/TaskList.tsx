import React from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Task } from '@/contexts/TaskContext';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { MentionDisplay } from '@/components/mentions';
import { format } from 'date-fns';

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
  },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  queued: 'Queued',
  in_progress: 'In Progress',
  waiting_input: 'Waiting Input',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  active: 'Active',
  success: 'Success',
  failed_no_contact: 'No Contact',
  failed_no_slot: 'No Slot',
  failed_other: 'Failed',
};

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function TaskListItem({ task, onPress }: { task: Task; onPress: () => void }) {
  const priorityStyle = priorityColors[task.priority.toLowerCase()] || priorityColors.medium;
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'completed' &&
    task.status !== 'success';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4 mb-3"
    >
      {/* Priority & Status Row */}
      <View className="flex-row items-center gap-2 mb-2">
        <View className={`rounded-full px-2 py-0.5 ${priorityStyle.bg}`}>
          <ThemedText className={`text-xs font-medium ${priorityStyle.text}`}>
            {task.priority.toUpperCase()}
          </ThemedText>
        </View>
        {task.assignee_type === 'ai_agent' && (
          <View className="flex-row items-center gap-1 bg-purple-100 dark:bg-purple-900/30 rounded-full px-2 py-0.5">
            <Icon name="Bot" size={12} className="text-purple-600 dark:text-purple-400" />
            <ThemedText className="text-xs text-purple-600 dark:text-purple-400">
              AI Agent
            </ThemedText>
          </View>
        )}
        {task.assignee_type === 'user' && (
          <View className="flex-row items-center gap-1 bg-blue-100 dark:bg-blue-900/30 rounded-full px-2 py-0.5">
            <Icon name="User" size={12} className="text-blue-600 dark:text-blue-400" />
            <ThemedText className="text-xs text-blue-600 dark:text-blue-400">User</ThemedText>
          </View>
        )}
      </View>

      {/* Title */}
      <ThemedText className="text-base font-semibold mb-1" numberOfLines={2}>
        {task.title}
      </ThemedText>

      {/* Description */}
      {task.description && (
        <View className="mb-3">
          <MentionDisplay
            content={task.description}
            numberOfLines={2}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      )}

      {/* Bottom Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* Assignee Avatar */}
          {task.assignee_type === 'ai_agent' ? (
            <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center">
              <Icon name="Bot" size={14} color="#fff" />
            </View>
          ) : (
            <Avatar size="xxs" name="U" />
          )}

          {/* Status */}
          <View className="bg-light-primary dark:bg-dark-primary rounded-full px-2 py-0.5">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              {statusLabels[task.status] || task.status}
            </ThemedText>
          </View>
        </View>

        {/* Due Date */}
        {task.due_date && (
          <View className="flex-row items-center gap-1">
            <Icon
              name="Calendar"
              size={14}
              className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}
            />
            <ThemedText
              className={`text-xs ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-light-subtext dark:text-dark-subtext'
              }`}
            >
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Overdue Badge */}
      {isOverdue && (
        <View className="mt-2 bg-red-100 dark:bg-red-900/30 rounded-lg px-2 py-1">
          <ThemedText className="text-xs text-red-600 dark:text-red-400 font-medium">
            Overdue
          </ThemedText>
        </View>
      )}

      {/* Intent Badge */}
      {task.intent && (
        <View className="mt-2">
          <View className="bg-light-primary dark:bg-dark-primary rounded-lg px-2 py-1 self-start">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              {task.intent}
            </ThemedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TaskList({ tasks, onTaskPress, isRefreshing = false, onRefresh }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center mb-4">
          <Icon name="CheckSquare" size={40} className="text-light-subtext dark:text-dark-subtext" />
        </View>
        <ThemedText className="text-lg font-semibold mb-2">No tasks found</ThemedText>
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext text-center">
          Try adjusting your filters or create a new task to get started
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <TaskListItem task={item} onPress={() => onTaskPress(item)} />}
      contentContainerClassName="p-4"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}
