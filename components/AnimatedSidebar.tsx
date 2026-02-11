import React, { useEffect, useRef } from 'react';
import { View, Pressable, Modal, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import Avatar from './shared/Avatar';
import useThemeColors from '@/contexts/ThemeColors';

interface SidebarMenuItem {
  label: string;
  icon: string;
  onPress?: () => void;
  active?: boolean;
}

interface AnimatedSidebarProps {
  visible: boolean;
  onClose: () => void;
  menuItems?: SidebarMenuItem[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const defaultMenuItems: SidebarMenuItem[] = [
  { label: 'Home', icon: 'Home', active: true },
  { label: 'Chat History', icon: 'MessageSquare' },
  { label: 'Explore', icon: 'Compass' },
  { label: 'Library', icon: 'Folder' },
  { label: 'Media', icon: 'Image' },
];

export default function AnimatedSidebar({
  visible,
  onClose,
  menuItems = defaultMenuItems,
  userName = 'Jhon Wales',
  userEmail = 'jhonwales@gmail.com',
  userAvatar,
}: AnimatedSidebarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  // React Native Animated values
  const translateX = useRef(new Animated.Value(-260)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 90,
          friction: 20,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -260,
          useNativeDriver: true,
          tension: 90,
          friction: 20,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Overlay */}
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              opacity: opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 12,
              transform: [{ translateX: translateX }],
            },
          ]}
          className="bg-muted dark:bg-darkMuted"
        >
          <View className="flex-1 justify-between">
            {/* Top Section */}
            <View className="flex-col gap-8">
              {/* Header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-8 h-8 rounded-full bg-foreground dark:bg-darkForeground items-center justify-center">
                    <View className="w-4 h-4 rounded-full bg-background dark:bg-darkBackground" />
                  </View>
                  <ThemedText className="text-base font-normal">SkyAI</ThemedText>
                </View>
                <Pressable onPress={onClose} className="w-5 h-5 items-center justify-center">
                  <Icon name="X" size={20} />
                </Pressable>
              </View>

              {/* Menu Items */}
              <View className="flex-col gap-1">
                {menuItems.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      item.onPress?.();
                      onClose();
                    }}
                    className={`flex-row items-center gap-2 h-10 px-2.5 py-2 rounded-lg ${
                      item.active
                        ? 'bg-light-secondary/50 dark:bg-dark-secondary/50'
                        : 'bg-transparent'
                    }`}
                  >
                    <Icon
                      name={item.icon as any}
                      size={12.5}
                    />
                    <ThemedText
                      className={`flex-1 text-sm ${
                        item.active ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {item.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Bottom Section */}
            <View className="flex-col gap-3">
              {/* Upgrade Plan */}
              <Pressable className="flex-row items-center gap-2 h-10 px-3 py-2 rounded-lg">
                <Icon name="Star" size={12.5} />
                <ThemedText className="flex-1 text-sm font-normal">
                  Upgrade Plan
                </ThemedText>
              </Pressable>

              {/* User Profile */}
              <View className="flex-row items-center gap-3 rounded-xl p-0">
                <Avatar
                  size="lg"
                  src={userAvatar}
                  name={userName}
                  className="w-11 h-11"
                />
                <View className="flex-1">
                  <ThemedText className="text-sm font-normal">
                    {userName}
                  </ThemedText>
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                    {userEmail}
                  </ThemedText>
                </View>
                <Icon name="ChevronDown" size={20} />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
