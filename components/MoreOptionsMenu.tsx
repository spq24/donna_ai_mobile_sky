import React from 'react';
import { View, Pressable, Modal, TouchableOpacity } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface MoreOptionsMenuItem {
  icon: string;
  label: string;
  onPress: () => void;
}

interface MoreOptionsMenuProps {
  visible: boolean;
  items: MoreOptionsMenuItem[];
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function MoreOptionsMenu({
  visible,
  items,
  onClose,
  position,
}: MoreOptionsMenuProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1 }}
      >
        <View
          className="absolute"
          style={{
            left: position?.x || 36,
            top: position?.y || 0,
            zIndex: 1000,
          }}
          onStartShouldSetResponder={() => true}
        >
          <View
            className="bg-background dark:bg-darkBackground rounded-2xl overflow-hidden min-w-[212px]"
            style={shadowPresets.large}
          >
            {items.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
                className="flex-row items-center gap-3 px-3 py-2.5 active:bg-light-secondary dark:active:bg-dark-secondary"
                style={
                  index === 0
                    ? { borderTopLeftRadius: 16, borderTopRightRadius: 16 }
                    : undefined
                }
              >
                <Icon name={item.icon as any} size={20} />
                <ThemedText className="text-sm flex-1">{item.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

