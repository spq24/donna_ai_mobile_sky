import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import { VendorCardProps, CardMode } from '@/types/generative-ui';

/**
 * VendorCard - Displays vendor information with selection capability for scheduling
 * 
 * This card is used in the scheduling flow to display vendors and allow
 * the user to select which vendor they want the AI to call on their behalf.
 */
export function VendorCard({
  id,
  name,
  phone,
  category,
  subcategory,
  address,
  preferred,
  notes,
  service_type,
  mode = 'view',
  onModeChange,
  onPress,
  onSelect,
  isSelected,
  selectable = true,
}: VendorCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  const handleSelect = () => {
    if (onSelect && id) {
      onSelect(id);
    }
  };

  // View Mode - Compact vendor card with select button
  if (mode === 'view') {
    return (
      <View
        className={`bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4 ${
          isSelected ? 'border-2 border-green-500' : ''
        }`}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <View className="flex-row items-start gap-3">
            {/* Vendor Icon */}
            <View className="w-12 h-12 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Icon name="Building2" size={24} />
            </View>
            
            <View className="flex-1">
              {/* Vendor Name with Preferred Star */}
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-base font-semibold" numberOfLines={1}>
                  {name}
                </ThemedText>
                {preferred && (
                  <View className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded-full">
                    <ThemedText className="text-xs text-yellow-700 dark:text-yellow-300">
                      ⭐ Preferred
                    </ThemedText>
                  </View>
                )}
              </View>
              
              {/* Category/Subcategory */}
              {(category || subcategory) && (
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                  {subcategory || category}
                </ThemedText>
              )}
              
              {/* Phone */}
              {phone && (
                <View className="flex-row items-center gap-1 mt-1">
                  <Icon name="Phone" size={12} />
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    {phone}
                  </ThemedText>
                </View>
              )}
              
              {/* Address */}
              {address && (
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Icon name="MapPin" size={12} />
                  <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext" numberOfLines={1}>
                    {address}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {/* Chevron for details */}
            <Icon name="ChevronRight" size={20} />
          </View>
        </TouchableOpacity>
        
        {/* Select Button */}
        {selectable && (
          <TouchableOpacity
            onPress={handleSelect}
            className={`mt-3 rounded-xl py-3 flex-row items-center justify-center gap-2 ${
              isSelected
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
          >
            <Icon name={isSelected ? 'Check' : 'PhoneCall'} size={18} color="#fff" />
            <ThemedText className="text-sm font-semibold text-white">
              {isSelected ? 'Selected' : 'Select for Scheduling'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Detail Mode - Full vendor information
  if (mode === 'detail') {
    return (
      <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Icon name="Building2" size={28} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-lg font-bold">{name}</ThemedText>
                {preferred && (
                  <ThemedText className="text-yellow-500">⭐</ThemedText>
                )}
              </View>
              {(category || subcategory) && (
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                  {[subcategory, category].filter(Boolean).join(' • ')}
                </ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => onModeChange?.('view')}>
            <Icon name="X" size={20} />
          </TouchableOpacity>
        </View>

        {/* Info rows */}
        <View className="gap-3 mb-4">
          {/* Phone */}
          {phone && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
                <Icon name="Phone" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{phone}</ThemedText>
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  Phone (AI will call this number)
                </ThemedText>
              </View>
            </View>
          )}

          {/* Address */}
          {address && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
                <Icon name="MapPin" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{address}</ThemedText>
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  Address
                </ThemedText>
              </View>
            </View>
          )}

          {/* Service Type */}
          {service_type && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
                <Icon name="Calendar" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{service_type}</ThemedText>
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  Service Type
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {notes && (
          <View className="p-3 bg-light-primary dark:bg-dark-primary rounded-xl mb-4">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext mb-1">
              Notes
            </ThemedText>
            <ThemedText className="text-sm">{notes}</ThemedText>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => onModeChange?.('form')}
            className="flex-1 bg-light-primary dark:bg-dark-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
          >
            <Icon name="Edit" size={16} />
            <ThemedText className="text-sm font-medium">Edit</ThemedText>
          </TouchableOpacity>
          
          {selectable && (
            <TouchableOpacity
              onPress={handleSelect}
              className={`flex-1 rounded-xl py-3 flex-row items-center justify-center gap-2 ${
                isSelected ? 'bg-green-500' : 'bg-blue-500'
              }`}
            >
              <Icon name={isSelected ? 'Check' : 'PhoneCall'} size={16} color="#fff" />
              <ThemedText className="text-sm font-medium text-white">
                {isSelected ? 'Selected' : 'Select'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Form Mode - Add/Edit vendor
  return (
    <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText className="text-lg font-bold">
          {id ? 'Edit Vendor' : 'Add New Vendor'}
        </ThemedText>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Form fields */}
      <View className="gap-3">
        <View>
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-1">
            Name *
          </ThemedText>
          <TextInput
            className="bg-light-primary dark:bg-dark-primary rounded-xl px-3 py-2 text-black dark:text-white"
            defaultValue={name || ''}
            placeholder="Vendor name (e.g., Dr. Smith's Office)"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-1">
            Phone Number *
          </ThemedText>
          <TextInput
            className="bg-light-primary dark:bg-dark-primary rounded-xl px-3 py-2 text-black dark:text-white"
            defaultValue={phone || ''}
            placeholder="Phone number to call"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-1">
            Category
          </ThemedText>
          <TextInput
            className="bg-light-primary dark:bg-dark-primary rounded-xl px-3 py-2 text-black dark:text-white"
            defaultValue={category || ''}
            placeholder="e.g., Healthcare, Beauty, Automotive"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-1">
            Address
          </ThemedText>
          <TextInput
            className="bg-light-primary dark:bg-dark-primary rounded-xl px-3 py-2 text-black dark:text-white"
            defaultValue={address || ''}
            placeholder="Address (optional)"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-1">
            Notes
          </ThemedText>
          <TextInput
            className="bg-light-primary dark:bg-dark-primary rounded-xl px-3 py-2 text-black dark:text-white"
            defaultValue={notes || ''}
            placeholder="Any special instructions..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={() => onModeChange?.('view')}
          className="flex-1 bg-light-primary dark:bg-dark-primary rounded-xl py-3 items-center"
        >
          <ThemedText className="text-sm font-medium">Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-3 items-center">
          <ThemedText className="text-sm font-medium text-white">
            {id ? 'Save' : 'Add Vendor'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default VendorCard;
