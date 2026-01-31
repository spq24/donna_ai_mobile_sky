// Generative UI Component Exports

// Main renderer
export { GenerativeUIRenderer, GenerativeUIList } from './GenerativeUIRenderer';

// Animation wrapper
export { CardAnimationWrapper } from './CardAnimationWrapper';

// Individual card components
export { TaskCard } from './cards/TaskCard';
export { SchedulingTaskCard } from './cards/SchedulingTaskCard';
export { GroupSchedulingCard } from './cards/GroupSchedulingCard';
export { CalendarCard } from './cards/CalendarCard';
export { ContactCard } from './cards/ContactCard';
export { VendorCard } from './cards/VendorCard';
export { ListCard } from './cards/ListCard';
export { ReminderCard } from './cards/ReminderCard';
export { UserCard } from './cards/UserCard';

// Re-export types
export type {
  GenerativeUIComponent,
  UIComponentType,
  CardMode,
  GenerativeUIRendererProps,
  TaskCardProps,
  SchedulingTaskCardProps,
  GroupSchedulingCardProps,
  CalendarCardProps,
  ContactCardProps,
  VendorCardProps,
  ListCardProps,
  ReminderCardProps,
  UserCardProps,
} from '@/types/generative-ui';
