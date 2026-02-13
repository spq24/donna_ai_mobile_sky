import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTask, Task, TaskStatus, TaskPriority, AssigneeType } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import ChatHeader from '@/components/ChatHeader';
import AnimatedSidebar from '@/components/AnimatedSidebar';
import AnimatedView from '@/components/shared/AnimatedView';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';

export default function TasksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchTasks, isLoading, getFilteredTasks, filters, setFilters, setSelectedTask, selectedTask } = useTask();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setFormModalVisible(true);
  };

  const handleEditTask = () => {
    setEditingTask(selectedTask);
    setDetailModalVisible(false);
    setFormModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTask(null);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setEditingTask(null);
  };

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const sidebarMenuItems = [
    { label: 'Home', icon: 'Home', onPress: () => router.push('/') },
    { label: 'Chat History', icon: 'MessageCircle', onPress: () => router.push('/screens/chat-history-screen') },
    { label: 'Tasks', icon: 'CheckSquare', active: true },
    { label: 'Media', icon: 'Image', onPress: () => router.push('/screens/media-screen') },
    { label: 'Settings', icon: 'Settings', onPress: () => router.push('/screens/settings-screen') },
  ];

  const filteredTasks = getFilteredTasks();

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      {/* Header */}
      <ChatHeader
        onMenuPress={handleMenuPress}
      />

      {/* Tasks Header Section */}
      <View className="px-4 py-4 border-b border-border dark:border-darkBorder">
        <View className="flex-row items-center justify-between mb-3">
          <ThemedText className="text-2xl font-bold">Tasks</ThemedText>
          <TouchableOpacity
            onPress={handleCreateTask}
            className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center"
          >
            <Icon name="Plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="flex-1 flex-row items-center bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
            <Icon name="Search" size={20} className="mr-2 text-muted-foreground dark:text-darkMutedForeground" />
            <TextInput
              value={filters.search}
              onChangeText={(text) => setFilters({ search: text })}
              placeholder="Search tasks..."
              placeholderTextColor="#999"
              className="flex-1 text-base text-foreground dark:text-darkForeground"
            />
            {filters.search && (
              <TouchableOpacity onPress={() => setFilters({ search: '' })}>
                <Icon name="X" size={20} className="text-muted-foreground dark:text-darkMutedForeground" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              showFilters
                ? 'bg-blue-500'
                : 'bg-muted dark:bg-darkMuted'
            }`}
          >
            <Icon
              name="SlidersHorizontal"
              size={20}
              color={showFilters ? '#fff' : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="gap-3 mt-2">
            {/* Sort Order */}
            <View>
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Sort By
              </ThemedText>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setFilters({ sortBy: 'newest' })}
                  className={`rounded-xl px-3 py-1 ${
                    filters.sortBy === 'newest'
                      ? 'bg-blue-500'
                      : 'bg-muted dark:bg-darkMuted'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${filters.sortBy === 'newest' ? 'text-white font-medium' : ''}`}
                  >
                    Newest First
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilters({ sortBy: 'oldest' })}
                  className={`rounded-xl px-3 py-1 ${
                    filters.sortBy === 'oldest'
                      ? 'bg-blue-500'
                      : 'bg-muted dark:bg-darkMuted'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${filters.sortBy === 'oldest' ? 'text-white font-medium' : ''}`}
                  >
                    Oldest First
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Filter */}
            <View>
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Status
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setFilters({ status: undefined })}
                  className={`rounded-xl px-3 py-1 ${
                    !filters.status
                      ? 'bg-blue-500'
                      : 'bg-muted dark:bg-darkMuted'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${!filters.status ? 'text-white font-medium' : ''}`}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilters({ status: status as TaskStatus })}
                    className={`rounded-xl px-3 py-1 ${
                      filters.status === status
                        ? 'bg-blue-500'
                        : 'bg-muted dark:bg-darkMuted'
                    }`}
                  >
                    <ThemedText
                      className={`text-sm ${
                        filters.status === status ? 'text-white font-medium' : ''
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View>
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Priority
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setFilters({ priority: undefined })}
                  className={`rounded-xl px-3 py-1 ${
                    !filters.priority
                      ? 'bg-blue-500'
                      : 'bg-muted dark:bg-darkMuted'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${!filters.priority ? 'text-white font-medium' : ''}`}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setFilters({ priority: priority as TaskPriority })}
                    className={`rounded-xl px-3 py-1 ${
                      filters.priority === priority
                        ? 'bg-blue-500'
                        : 'bg-muted dark:bg-darkMuted'
                    }`}
                  >
                    <ThemedText
                      className={`text-sm ${
                        filters.priority === priority ? 'text-white font-medium' : ''
                      }`}
                    >
                      {priority}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Assignee Type Filter */}
            <View>
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Assignee
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setFilters({ assignee_type: undefined })}
                  className={`rounded-xl px-3 py-1 ${
                    !filters.assignee_type
                      ? 'bg-blue-500'
                      : 'bg-muted dark:bg-darkMuted'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${
                      !filters.assignee_type ? 'text-white font-medium' : ''
                    }`}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                {['ai_agent', 'user', 'unassigned'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilters({ assignee_type: type as AssigneeType })}
                    className={`rounded-xl px-3 py-1 ${
                      filters.assignee_type === type
                        ? 'bg-blue-500'
                        : 'bg-muted dark:bg-darkMuted'
                    }`}
                  >
                    <ThemedText
                      className={`text-sm ${
                        filters.assignee_type === type ? 'text-white font-medium' : ''
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Task Count */}
        <View className="mt-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </ThemedText>
        </View>
      </View>

      {/* Task List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onTaskPress={handleTaskPress}
          isRefreshing={isLoading}
          onRefresh={fetchTasks}
        />
      )}

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isVisible={detailModalVisible}
        onClose={handleCloseDetailModal}
        onEdit={handleEditTask}
      />

      <TaskFormModal
        task={editingTask}
        isVisible={formModalVisible}
        onClose={handleCloseFormModal}
      />

      {/* Sidebar */}
      <AnimatedSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        menuItems={sidebarMenuItems}
        userName={user?.full_name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        userAvatar={undefined}
      />
    </AnimatedView>
  );
}
