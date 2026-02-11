import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import {
  GenerativeUIComponent,
  UIComponentType,
  CardMode,
  GenerativeUIRendererProps,
} from '@/types/generative-ui';
import { CardAnimationWrapper } from './CardAnimationWrapper';
import ThemedText from '../shared/ThemedText';
import Icon from '../shared/Icon';
import { TouchableOpacity } from 'react-native';

// Import all card components
import { TaskCard } from './cards/TaskCard';
import { SchedulingTaskCard } from './cards/SchedulingTaskCard';
import { GroupSchedulingCard } from './cards/GroupSchedulingCard';
import { CalendarCard } from './cards/CalendarCard';
import { ContactCard } from './cards/ContactCard';
import { VendorCard } from './cards/VendorCard';
import { ListCard } from './cards/ListCard';
import { ReminderCard } from './cards/ReminderCard';
import { UserCard } from './cards/UserCard';

// Component registry mapping type strings to React components
const componentMap: Record<UIComponentType, React.ComponentType<any>> = {
  task_card: TaskCard,
  scheduling_task_card: SchedulingTaskCard,
  group_scheduling_card: GroupSchedulingCard,
  calendar_card: CalendarCard,
  contact_card: ContactCard,
  vendor_card: VendorCard,
  list_card: ListCard,
  reminder_card: ReminderCard,
  user_card: UserCard,
};

/**
 * GenerativeUIRenderer - Renders UI components returned by the backend
 * 
 * This component acts as a registry and router for all generative UI components.
 * It handles mode changes and wraps components with animations.
 */
export function GenerativeUIRenderer({
  component,
  onModeChange,
  onVendorSelect,
  selectedVendorId,
  index = 0,
}: GenerativeUIRendererProps) {
  // Track mode locally if no external handler is provided
  const [localMode, setLocalMode] = useState<CardMode>(component.mode || 'view');

  const handleModeChange = useCallback((newMode: CardMode) => {
    setLocalMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

  // Get the component type from the registry
  const ComponentType = componentMap[component.type as UIComponentType];

  // If component type is not found, render nothing (or could render an error state)
  if (!ComponentType) {
    if (__DEV__) {
      console.warn(`Unknown generative UI component type: ${component.type}`);
    }
    return null;
  }

  // Merge props with mode and mode change handler
  const componentProps: Record<string, any> = {
    ...component.props,
    mode: localMode,
    onModeChange: handleModeChange,
  };

  // Add vendor-specific props for vendor_card
  if (component.type === 'vendor_card' && onVendorSelect) {
    componentProps.onSelect = onVendorSelect;
    componentProps.isSelected = selectedVendorId === component.props.id;
    componentProps.selectable = true;
  }

  return (
    <CardAnimationWrapper mode={localMode} index={index}>
      <ComponentType {...componentProps} />
    </CardAnimationWrapper>
  );
}

/**
 * Renders multiple UI components with staggered animations
 */
export function GenerativeUIList({
  components,
  onModeChange,
  onVendorSelect,
  selectedVendorId,
}: {
  components: GenerativeUIComponent[];
  onModeChange?: (index: number, mode: CardMode) => void;
  onVendorSelect?: (vendorId: number) => void;
  selectedVendorId?: number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const [showAll, setShowAll] = useState(false);

  // Hybrid Logic Decision:
  // 1. If we have 1-2 components -> Always Vertical List
  // 2. If we have 3+ components of the same type in 'view' mode -> Carousel
  // 3. If we have 3+ components but they are mixed or in 'detail'/'form' mode -> Vertical List with "Show More"
  
  const isSameType = components.length > 0 && components.every(c => c.type === components[0].type);
  const allInViewMode = components.every(c => !c.mode || c.mode === 'view');
  const shouldShowCarousel = components.length >= 3 && isSameType && allInViewMode;

  // Carousel Layout
  if (shouldShowCarousel) {
    // Calculate card width for a nice "peek" effect
    // Standard chat bubble has about 48dp left margin for AI avatar
    const CARD_WIDTH = windowWidth * 0.75;
    const GAP = 12;

    return (
      <View className="my-2" style={{ marginLeft: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + GAP}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: 48 }}
        >
          {components.map((component, index) => (
            <View 
              key={`carousel-${index}-${component.type}`} 
              style={{ width: CARD_WIDTH, marginRight: GAP }}
            >
              <GenerativeUIRenderer
                component={component}
                index={index}
                onModeChange={(mode) => onModeChange?.(index, mode)}
                onVendorSelect={onVendorSelect}
                selectedVendorId={selectedVendorId}
              />
            </View>
          ))}
        </ScrollView>
        <View className="flex-row items-center gap-1 mt-2 ml-1">
          <Icon name="ArrowRightLeft" size={10} color="#999" />
          <ThemedText className="text-[10px] text-muted-foreground dark:text-darkMutedForeground italic">
            Swipe to see all {components.length} options
          </ThemedText>
        </View>
      </View>
    );
  }

  // Vertical List with "Show More" Logic
  const visibleComponents = showAll ? components : components.slice(0, 3);
  const hasMore = components.length > 3;

  return (
    <View className="gap-3" style={{ marginLeft: 48 }}>
      {visibleComponents.map((component, index) => (
        <GenerativeUIRenderer
          key={`ui-component-${index}-${component.type}`}
          component={component}
          index={index}
          onModeChange={(mode) => onModeChange?.(index, mode)}
          onVendorSelect={onVendorSelect}
          selectedVendorId={selectedVendorId}
        />
      ))}
      
      {hasMore && !showAll && (
        <TouchableOpacity 
          onPress={() => setShowAll(true)}
          className="bg-background dark:bg-darkBackground rounded-xl py-2 items-center border border-light-border dark:border-dark-border"
        >
          <View className="flex-row items-center gap-2">
            <ThemedText className="text-sm font-medium">
              Show {components.length - 3} more options
            </ThemedText>
            <Icon name="ChevronDown" size={16} />
          </View>
        </TouchableOpacity>
      )}

      {hasMore && showAll && (
        <TouchableOpacity 
          onPress={() => setShowAll(false)}
          className="py-2 items-center"
        >
          <View className="flex-row items-center gap-2">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              Show less
            </ThemedText>
            <Icon name="ChevronUp" size={16} color="#999" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default GenerativeUIRenderer;
