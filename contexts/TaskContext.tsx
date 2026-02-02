import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Alert } from 'react-native';

export type TaskStatus =
  | 'pending'
  | 'queued'
  | 'in_progress'
  | 'waiting_input'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'active'
  | 'success'
  | 'failed_no_contact'
  | 'failed_no_slot'
  | 'failed_other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AssigneeType = 'user' | 'ai_agent' | 'unassigned';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  original_query?: string;
  assignee_type: AssigneeType;
  assignee_user_id?: number;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  intent?: string;
  intent_confidence?: number;
  intent_metadata?: any;
  task_metadata?: any;
  failure_reason?: string;
  scheduling_task_id?: number;
  group_scheduling_task_id?: number;
  conversation_id?: string;
  source_list_item_id?: number;
  created_at: string;
  updated_at: string;
}

export type SortOrder = 'newest' | 'oldest';

export interface TaskFilters {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_type?: AssigneeType;
  sortBy: SortOrder;
}

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface TaskContextType {
  // State
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
  selectedTask: Task | null;
  availableUsers: User[];

  // Actions
  fetchTasks: (silent?: boolean) => Promise<void>;
  createTask: (data: any) => Promise<Task | null>;
  updateTask: (id: number, data: any) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  completeTask: (id: number) => Promise<boolean>;
  cancelTask: (id: number) => Promise<boolean>;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  getFilteredTasks: () => Task[];
  fetchAvailableUsers: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFiltersState] = useState<TaskFilters>({ search: '', sortBy: 'newest' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const fetchTasks = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await apiClient.getTasks({ limit: 500 });
      setTasks(response);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: any): Promise<Task | null> => {
    try {
      const newTask = await apiClient.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      fetchTasks(true); // Silently refresh to ensure consistency
      Alert.alert('Success', 'Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task');
      return null;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: number, data: any): Promise<Task | null> => {
    try {
      const updatedTask = await apiClient.updateTask(id, data);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      fetchTasks(true); // Silently refresh
      Alert.alert('Success', 'Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task');
      return null;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiClient.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      fetchTasks(true); // Silently refresh
      Alert.alert('Success', 'Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      Alert.alert('Error', 'Failed to delete task');
      return false;
    }
  }, [fetchTasks]);

  const completeTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedTask = await apiClient.completeTask(id);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      Alert.alert('Success', 'Task marked as completed');
      return true;
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task');
      return false;
    }
  }, []);

  const cancelTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedTask = await apiClient.cancelTask(id);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      Alert.alert('Success', 'Task cancelled');
      return true;
    } catch (error) {
      console.error('Failed to cancel task:', error);
      Alert.alert('Error', 'Failed to cancel task');
      return false;
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const getFilteredTasks = useCallback((): Task[] => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesAssigneeType =
        !filters.assignee_type || task.assignee_type === filters.assignee_type;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssigneeType;
    });

    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [tasks, filters]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const users = await apiClient.getAvailableUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filters,
        isLoading,
        selectedTask,
        availableUsers,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        completeTask,
        cancelTask,
        setSelectedTask,
        setFilters,
        getFilteredTasks,
        fetchAvailableUsers,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
