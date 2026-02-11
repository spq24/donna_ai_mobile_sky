import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import { Chip } from '@/components/shared/Chip';
import { ListCardProps, ListItem, CardMode } from '@/types/generative-ui';

// List type icons and colors
const listTypeConfig: Record<string, { icon: string; color: string }> = {
  todo: { icon: 'CheckSquare', color: 'bg-blue-100 dark:bg-blue-900' },
  grocery: { icon: 'ShoppingCart', color: 'bg-green-100 dark:bg-green-900' },
  shopping: { icon: 'ShoppingBag', color: 'bg-purple-100 dark:bg-purple-900' },
  custom: { icon: 'List', color: 'bg-gray-100 dark:bg-gray-800' },
};

/**
 * ListCard - Displays a list with checkable items
 */
export function ListCard({
  id,
  name,
  list_type = 'custom',
  is_shared = false,
  item_count = 0,
  items = [],
  has_more_items = false,
  mode = 'view',
  onModeChange,
  onPress,
}: ListCardProps) {
  const typeConfig = listTypeConfig[list_type.toLowerCase()] || listTypeConfig.custom;
  const checkedCount = items.filter((item) => item.checked).length;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  const renderListItem = (item: ListItem, showDetails = false) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center gap-3 py-2"
    >
      <View
        className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
          item.checked
            ? 'bg-green-500 border-green-500'
            : 'border-light-subtext dark:border-dark-subtext'
        }`}
      >
        {item.checked && <Icon name="Check" size={12} color="#fff" />}
      </View>
      <View className="flex-1 flex-row items-center justify-between">
        <ThemedText
          className={`text-sm ${
            item.checked ? 'text-muted-foreground dark:text-darkMutedForeground line-through' : ''
          }`}
          numberOfLines={1}
        >
          {item.name}
        </ThemedText>
        {showDetails && item.quantity && (
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
            {item.quantity}
          </ThemedText>
        )}
      </View>
      {showDetails && item.category && (
        <View className="bg-background dark:bg-darkBackground rounded-md px-2 py-0.5">
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
            {item.category}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  // View Mode - Compact list card
  if (mode === 'view') {
    const displayItems = items.slice(0, 5);

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className={`w-8 h-8 rounded-lg items-center justify-center ${typeConfig.color}`}>
              <Icon name={typeConfig.icon} size={16} />
            </View>
            <View>
              <ThemedText className="text-base font-semibold" numberOfLines={1}>
                {name}
              </ThemedText>
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                {checkedCount}/{item_count} completed
              </ThemedText>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {is_shared && (
              <View className="w-6 h-6 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="Users" size={12} />
              </View>
            )}
            <Chip label={list_type} size="xs" />
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-1 bg-background dark:bg-darkBackground rounded-full mb-3 overflow-hidden">
          <View
            className="h-full bg-green-500 rounded-full"
            style={{ width: item_count > 0 ? `${(checkedCount / item_count) * 100}%` : '0%' }}
          />
        </View>

        {/* Items preview */}
        {displayItems.length > 0 ? (
          <View>
            {displayItems.map((item) => renderListItem(item))}
            {has_more_items && (
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mt-1">
                +{item_count - displayItems.length} more items
              </ThemedText>
            )}
          </View>
        ) : (
          <View className="py-2">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              No items yet
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Detail Mode - Full list with all items
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className={`w-10 h-10 rounded-xl items-center justify-center ${typeConfig.color}`}>
            <Icon name={typeConfig.icon} size={20} />
          </View>
          <View>
            <ThemedText className="text-lg font-bold">{name}</ThemedText>
            <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
              {checkedCount} of {item_count} completed
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-background dark:bg-darkBackground rounded-full mb-4 overflow-hidden">
        <View
          className="h-full bg-green-500 rounded-full"
          style={{ width: item_count > 0 ? `${(checkedCount / item_count) * 100}%` : '0%' }}
        />
      </View>

      {/* Type and sharing info */}
      <View className="flex-row items-center gap-2 mb-4">
        <Chip label={list_type} size="sm" />
        {is_shared && (
          <View className="flex-row items-center gap-1 bg-background dark:bg-darkBackground rounded-full px-2 py-0.5">
            <Icon name="Users" size={12} />
            <ThemedText className="text-xs">Shared</ThemedText>
          </View>
        )}
      </View>

      {/* Items list */}
      {items.length > 0 ? (
        <View className="gap-1">
          {/* Unchecked items first */}
          {items
            .filter((item) => !item.checked)
            .map((item) => renderListItem(item, true))}
          
          {/* Checked items */}
          {items.filter((item) => item.checked).length > 0 && (
            <View className="mt-2 pt-2 border-t border-border dark:border-darkBorder">
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-2">
                Completed ({checkedCount})
              </ThemedText>
              {items
                .filter((item) => item.checked)
                .map((item) => renderListItem(item, true))}
            </View>
          )}
        </View>
      ) : (
        <View className="py-8 items-center">
          <Icon name="List" size={32} />
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mt-2">
            No items in this list
          </ThemedText>
        </View>
      )}

      {has_more_items && (
        <TouchableOpacity className="mt-4 py-2 items-center">
          <ThemedText className="text-sm text-blue-500">Show all items</ThemedText>
        </TouchableOpacity>
      )}

      {/* Add item button */}
      <TouchableOpacity className="mt-4 bg-background dark:bg-darkBackground rounded-xl py-3 flex-row items-center justify-center gap-2">
        <Icon name="Plus" size={16} />
        <ThemedText className="text-sm font-medium">Add Item</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default ListCard;
