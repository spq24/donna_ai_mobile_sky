import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { Chip } from './shared/Chip';
import { Vendor } from '../types/vendor';
import { shadowPresets } from '../utils/useShadow';

interface VendorCardProps {
  vendor: Vendor;
  isSelected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export default function VendorCard({
  vendor,
  isSelected,
  onPress,
  disabled,
}: VendorCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`bg-light-secondary dark:bg-dark-secondary border rounded-2xl p-4 w-64 ${
        isSelected
          ? 'border-light-primary dark:border-dark-accent'
          : 'border-light-secondary dark:border-dark-secondary'
      }`}
      style={shadowPresets.medium}
    >
      <View className="flex-row justify-between items-start mb-2">
        <ThemedText className="text-base font-semibold flex-1 mr-2" numberOfLines={1}>
          {vendor.name}
        </ThemedText>
        {vendor.preferred && (
          <View className="bg-light-accent dark:bg-dark-accent/20 px-2 py-0.5 rounded-full">
            <ThemedText className="text-[10px] font-bold text-white dark:text-dark-accent uppercase">
              Preferred
            </ThemedText>
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-1.5 mb-1">
        <Icon name="MapPin" size={14} className="text-light-subtext dark:text-dark-subtext" />
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext flex-1" numberOfLines={1}>
          {vendor.address || 'No address provided'}
        </ThemedText>
      </View>

      <View className="flex-row items-center gap-1.5 mb-3">
        <Icon name="Phone" size={14} className="text-light-subtext dark:text-dark-subtext" />
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
          {vendor.phone_number}
        </ThemedText>
      </View>

      <View className="flex-row flex-wrap gap-2 mt-auto">
        <View className="bg-light-primary/10 dark:bg-dark-primary/20 px-2 py-1 rounded-md">
          <ThemedText className="text-xs font-medium text-light-primary dark:text-dark-text">
            {vendor.category.name}
          </ThemedText>
        </View>
        {vendor.subcategory && (
          <View className="bg-light-secondary dark:bg-dark-secondary border border-light-primary/20 dark:border-dark-primary/30 px-2 py-1 rounded-md">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
              {vendor.subcategory.name}
            </ThemedText>
          </View>
        )}
      </View>

      <View
        className={`mt-4 py-2 rounded-xl items-center justify-center ${
          isSelected
            ? 'bg-light-primary dark:bg-dark-accent'
            : 'bg-light-primary/5 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20'
        }`}
      >
        <ThemedText
          className={`font-semibold ${
            isSelected ? 'text-white' : 'text-light-primary dark:text-dark-text'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </ThemedText>
      </View>
    </Pressable>
  );
}
