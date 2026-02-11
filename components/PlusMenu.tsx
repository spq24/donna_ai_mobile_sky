import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface PlusMenuItem {
  icon: string;
  label: string;
  onPress: () => void;
}

interface PlusMenuProps {
  visible: boolean;
  items: PlusMenuItem[];
  onClose: () => void;
}

export default function PlusMenu({ visible, items, onClose }: PlusMenuProps) {
  if (!visible) return null;

  return (
    <View className="absolute bottom-full left-4 mb-2">
      <View
        className="bg-background dark:bg-darkBackground rounded-2xl p-2 min-w-[203]"
        style={shadowPresets.large}
      >
        {items.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-light-secondary dark:active:bg-dark-secondary"
          >
            <Icon name={item.icon as any} size={20} />
            <ThemedText className="text-sm">{item.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

