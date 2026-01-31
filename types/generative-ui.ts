/**
 * Generative UI Types for Donna AI Mobile
 * 
 * These types define the structure of UI components returned by the backend
 * that are rendered dynamically in the chat interface.
 */

// ============================================
// Component Types
// ============================================

export type UIComponentType =
  | 'task_card'
  | 'scheduling_task_card'
  | 'group_scheduling_card'
  | 'calendar_card'
  | 'contact_card'
  | 'vendor_card'
  | 'list_card'
  | 'reminder_card'
  | 'user_card';

export type CardMode = 'view' | 'detail' | 'form';

export interface GenerativeUIComponent {
  type: UIComponentType;
  props: Record<string, any>;
  mode?: CardMode;
}

// ============================================
// Card Props Interfaces
// ============================================

// Base interface for common card properties
export interface BaseCardProps {
  mode?: CardMode;
  onModeChange?: (mode: CardMode) => void;
  onPress?: () => void;
}

// Task Card Props
export interface TaskCardProps extends BaseCardProps {
  id: number;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  due_date?: string | null;
  assignee_type?: string | null;
  assigned_to?: string | null;
  has_scheduling_task?: boolean;
  tags?: string[];
  attachments_count?: number;
  comments_count?: number;
  created_at?: string;
}

// Scheduling Task Props (extends TaskCard)
export interface SchedulingTaskCardProps extends TaskCardProps {
  scheduling_task?: {
    id: number;
    status: string;
    vendor_name?: string | null;
    vendor_phone?: string | null;
    vendor_category?: string | null;
    requested_service?: string;
    timing_preferences?: string | null;
  };
}

// Group Scheduling Card Props
export interface GroupSchedulingCardProps extends BaseCardProps {
  id: number;
  title: string;
  description?: string;
  participants?: Array<{
    id: number;
    name: string;
    avatar_url?: string;
    vote_status?: 'pending' | 'voted' | 'declined';
  }>;
  proposed_dates?: Array<{
    date: string;
    vote_count: number;
    is_selected?: boolean;
  }>;
  status?: 'voting' | 'confirmed' | 'cancelled';
  time_range_start?: string;
  time_range_end?: string;
}

// Calendar Card Props
export interface CalendarCardProps extends BaseCardProps {
  calendar_name?: string;
  start_date?: string;
  end_date?: string;
  events?: CalendarEvent[];
  events_by_date?: Record<string, CalendarEvent[]>;
  event_count?: number;
  single_event?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string | null;
  description?: string | null;
}

// Contact Card Props
export interface ContactCardProps extends BaseCardProps {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string | null;
  phone_1?: string | null;
  phone_1_type?: string | null;
  phone_2?: string | null;
  phone_2_type?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  birthday?: string | null;
  notes?: string | null;
  photo_url?: string | null;
}

// Vendor Card Props (for scheduling flow)
export interface VendorCardProps extends BaseCardProps {
  id: number;
  name: string;
  phone?: string | null;
  category?: string | null;
  subcategory?: string | null;
  address?: string | null;
  preferred?: boolean;
  notes?: string | null;
  service_type?: string;
  // Selection callbacks for scheduling flow
  onSelect?: (vendorId: number) => void;
  isSelected?: boolean;
  selectable?: boolean;
}

// List Card Props
export interface ListCardProps extends BaseCardProps {
  id: number;
  name: string;
  list_type?: string;
  is_shared?: boolean;
  item_count?: number;
  items?: ListItem[];
  has_more_items?: boolean;
}

export interface ListItem {
  id: number;
  name: string;
  checked?: boolean;
  quantity?: string | null;
  category?: string | null;
}

// Reminder Card Props
export interface ReminderCardProps extends BaseCardProps {
  id: number;
  title: string;
  description?: string | null;
  remind_at?: string | null;
  status?: string;
  recurrence_type?: string | null;
}

// User Card Props
export interface UserCardProps extends BaseCardProps {
  id: number;
  name?: string;
  email?: string;
  is_current_user?: boolean;
  avatar_url?: string | null;
  timezone?: string | null;
  account_id?: number | null;
}

// ============================================
// Component Registry Type
// ============================================

export type CardComponentType = React.ComponentType<BaseCardProps & Record<string, any>>;

export interface ComponentRegistry {
  task_card: React.ComponentType<TaskCardProps>;
  scheduling_task_card: React.ComponentType<SchedulingTaskCardProps>;
  group_scheduling_card: React.ComponentType<GroupSchedulingCardProps>;
  calendar_card: React.ComponentType<CalendarCardProps>;
  contact_card: React.ComponentType<ContactCardProps>;
  vendor_card: React.ComponentType<VendorCardProps>;
  list_card: React.ComponentType<ListCardProps>;
  reminder_card: React.ComponentType<ReminderCardProps>;
  user_card: React.ComponentType<UserCardProps>;
}

// ============================================
// Renderer Props
// ============================================

export interface GenerativeUIRendererProps {
  component: GenerativeUIComponent;
  onModeChange?: (mode: CardMode) => void;
  onVendorSelect?: (vendorId: number) => void;
  selectedVendorId?: number;
  index?: number;
}
