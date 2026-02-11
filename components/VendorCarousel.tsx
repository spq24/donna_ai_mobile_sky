import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import VendorCard from './VendorCard';
import { Vendor } from '../types/vendor';
import Button from './shared/Button';

interface VendorCarouselProps {
  vendors: Vendor[];
  selectedVendorId?: number;
  onSelect: (vendor: Vendor) => void;
  onConfirm: () => void;
  disabled?: boolean;
  showConfirmButton?: boolean;
}

export default function VendorCarousel({
  vendors,
  selectedVendorId,
  onSelect,
  onConfirm,
  disabled,
  showConfirmButton = true,
}: VendorCarouselProps) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <View className="w-full my-4">
      <ThemedText className="text-sm font-medium mb-3 ml-1 text-muted-foreground dark:text-darkMutedForeground">
        I found these vendors that might fit your needs:
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 8 }}
        className="flex-row"
      >
        {vendors.map((vendor, index) => (
          <View key={vendor.id} className={index < vendors.length - 1 ? 'mr-4' : ''}>
            <VendorCard
              vendor={vendor}
              isSelected={selectedVendorId === vendor.id}
              onPress={() => onSelect(vendor)}
              disabled={disabled}
            />
          </View>
        ))}
      </ScrollView>

      {showConfirmButton && (
        <View className="mt-4 px-1">
          <Button
            title="Confirm Selection"
            onPress={onConfirm}
            disabled={!selectedVendorId || disabled}
            variant="primary"
            className="w-full"
          />
        </View>
      )}
    </View>
  );
}
