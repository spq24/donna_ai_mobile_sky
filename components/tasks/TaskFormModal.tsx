import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Task, useTask, TaskStatus, TaskPriority, AssigneeType } from '@/contexts/TaskContext';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TaskFormModalProps {
  task?: Task | null;
  isVisible: boolean;
  onClose: () => void;
}

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_input', label: 'Waiting Input' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const assigneeTypes: { value: AssigneeType; label: string }[] = [
  { value: 'ai_agent', label: 'AI Agent' },
  { value: 'user', label: 'User' },
  { value: 'unassigned', label: 'Unassigned' },
];

export function TaskFormModal({ task, isVisible, onClose }: TaskFormModalProps) {
  const { createTask, updateTask, availableUsers, fetchAvailableUsers } = useTask();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('ai_agent');
  const [assigneeUserId, setAssigneeUserId] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isVisible) {
      if (task) {
        // Edit mode
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
        setPriority(task.priority);
        setAssigneeType(task.assignee_type);
        setAssigneeUserId(task.assignee_user_id);
        setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      } else {
        // Create mode
        resetForm();
      }
      fetchAvailableUsers();
    }
  }, [isVisible, task]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    setAssigneeType('ai_agent');
    setAssigneeUserId(undefined);
    setDueDate(undefined);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setIsSubmitting(true);

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assignee_type: assigneeType,
      assignee_user_id: assigneeType === 'user' ? assigneeUserId : undefined,
      due_date: dueDate ? dueDate.toISOString() : undefined,
    };

    try {
      let success = false;
      if (task) {
        const result = await updateTask(task.id, data);
        success = !!result;
      } else {
        const result = await createTask(data);
        success = !!result;
      }
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-light-secondary dark:border-dark-secondary">
          <ThemedText className="text-xl font-bold">{task ? 'Edit Task' : 'Create Task'}</ThemedText>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Icon name="X" size={24} />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {/* Title */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Title *
            </ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#999"
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 text-base text-black dark:text-white"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Description
            </ThemedText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 text-base text-black dark:text-white min-h-[100px]"
            />
          </View>

          {/* Status */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Status
            </ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setStatus(s.value)}
                  className={`rounded-xl px-4 py-2 ${
                    status === s.value
                      ? 'bg-blue-500'
                      : 'bg-light-secondary dark:bg-dark-secondary'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${status === s.value ? 'text-white font-medium' : ''}`}
                  >
                    {s.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Priority
            </ThemedText>
            <View className="flex-row gap-2">
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    priority === p.value ? p.color : 'bg-light-secondary dark:bg-dark-secondary'
                  }`}
                >
                  <ThemedText
                    className={`text-sm font-medium ${priority === p.value ? 'text-white' : ''}`}
                  >
                    {p.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Due Date
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <ThemedText className="text-base">
                {dueDate ? dueDate.toLocaleDateString() : 'Select due date'}
              </ThemedText>
              <Icon name="Calendar" size={20} />
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(undefined)}
                className="mt-2 self-start"
              >
                <ThemedText className="text-sm text-red-500">Clear date</ThemedText>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Assignee Type */}
          <View className="mb-4">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
              Assignee Type
            </ThemedText>
            <View className="flex-row gap-2">
              {assigneeTypes.map((a) => (
                <TouchableOpacity
                  key={a.value}
                  onPress={() => {
                    setAssigneeType(a.value);
                    if (a.value !== 'user') {
                      setAssigneeUserId(undefined);
                    }
                  }}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    assigneeType === a.value
                      ? 'bg-purple-500'
                      : 'bg-light-secondary dark:bg-dark-secondary'
                  }`}
                >
                  <ThemedText
                    className={`text-sm ${assigneeType === a.value ? 'text-white font-medium' : ''}`}
                  >
                    {a.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* User Selection (if assignee type is user) */}
          {assigneeType === 'user' && (
            <View className="mb-4">
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
                Assign to User
              </ThemedText>
              <ScrollView className="max-h-48 bg-light-secondary dark:bg-dark-secondary rounded-xl">
                {(availableUsers || []).map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => setAssigneeUserId(user.id)}
                    className={`px-4 py-3 border-b border-light-primary dark:border-dark-primary ${
                      assigneeUserId === user.id ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <ThemedText className="text-base font-medium">{user.full_name}</ThemedText>
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                      {user.email}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
                {(availableUsers || []).length === 0 && (
                  <View className="p-4">
                    <ThemedText className="text-center text-light-subtext dark:text-dark-subtext">
                      No users available
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-light-secondary dark:border-dark-secondary">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl py-3 items-center"
            >
              <ThemedText className="text-base font-medium">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
            >
              <ThemedText className="text-base font-medium text-white">
                {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
