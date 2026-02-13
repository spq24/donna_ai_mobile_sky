import React, { useState } from 'react';
import { View, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedScroller from '../../components/shared/ThemeScroller';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface AccountSettingsProps {
  onBack?: () => void;
}

export default function AccountSettings({ onBack }: AccountSettingsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(user?.full_name || 'Jhon Wales');
  const [username, setUsername] = useState('jhonwales');
  const [email, setEmail] = useState(user?.email || 'jhonwales@gmail.com');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [successNotificationVisible, setSuccessNotificationVisible] = useState(false);

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={onBack}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-4">
            <ThemedText className="text-2xl font-semibold">Header</ThemedText>
            <View className="h-px bg-muted dark:bg-darkMuted mt-4" />
          </View>

          {/* Avatar Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-muted dark:bg-darkMuted items-center justify-center">
                  <Icon name="User" size={24} />
                </View>
                <View>
                  <ThemedText className="text-sm font-medium">{fullName}</ThemedText>
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">{username}</ThemedText>
                </View>
              </View>
              <Pressable
                className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2"
                style={shadowPresets.small}
              >
                <ThemedText className="text-xs">Change avatar</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Full Name */}
          <View className="mb-6">
            <ThemedText className="text-sm mb-2">Full Name</ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                className="text-sm"
                style={{ color: colors.foreground }}
                placeholder="Enter full name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          {/* Username */}
          <View className="mb-6">
            <ThemedText className="text-sm mb-2">Username</ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-sm"
                style={{ color: colors.foreground }}
                placeholder="Enter username"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-6">
            <ThemedText className="text-sm mb-2">Email</ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="text-sm"
                style={{ color: colors.foreground }}
                placeholder="Enter email"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mt-4">
            <Pressable
              className="flex-1 bg-muted dark:bg-darkMuted rounded-xl py-2 items-center"
              onPress={onBack}
            >
              <ThemedText className="text-sm">Cancel</ThemedText>
            </Pressable>
            <Pressable
              className="flex-1 bg-foreground dark:bg-darkForeground rounded-xl py-2 items-center"
              style={shadowPresets.small}
              onPress={() => setSaveModalVisible(true)}
            >
              <ThemedText className="text-sm text-foreground dark:text-darkForeground font-medium">
                Save Changes
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Save Confirmation Modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View
          className="flex-1 bg-black/40 items-center justify-center"
          style={{ paddingHorizontal: 16 }}
        >
          <View
            className="bg-background dark:bg-darkBackground rounded-2xl w-full"
            style={{ maxWidth: 343, padding: 16, ...shadowPresets.large }}
          >
            {/* Header */}
            <View className="mb-4">
              <ThemedText className="text-lg font-semibold">Save Changes</ThemedText>
            </View>

            {/* Message */}
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-6">
              Are you sure you want to save these changes to your account?
            </ThemedText>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 bg-muted dark:bg-darkMuted rounded-xl py-2 items-center"
                onPress={() => setSaveModalVisible(false)}
              >
                <ThemedText className="text-sm">Cancel</ThemedText>
              </Pressable>
              <Pressable
                className="flex-1 bg-foreground dark:bg-darkForeground rounded-xl py-2 items-center"
                style={shadowPresets.small}
                onPress={() => {
                  setSaveModalVisible(false);
                  // Simulate save
                  setTimeout(() => {
                    setSuccessNotificationVisible(true);
                    setTimeout(() => {
                      setSuccessNotificationVisible(false);
                      onBack?.();
                    }, 3000);
                  }, 500);
                }}
              >
                <ThemedText className="text-sm text-foreground dark:text-darkForeground font-medium">
                  Save Changes
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Notification Banner */}
      {successNotificationVisible && (
        <View
          className="absolute left-0 right-0 bg-muted dark:bg-darkMuted mx-4 rounded-xl"
          style={{
            top: insets.top + 64 + 8, // Below header
            paddingVertical: 12,
            paddingHorizontal: 16,
            zIndex: 1000,
            ...shadowPresets.medium,
          }}
        >
          <View className="flex-row items-center justify-between">
            <ThemedText className="text-sm flex-1">
              Your account settings has been updated.
            </ThemedText>
            <Pressable
              onPress={() => setSuccessNotificationVisible(false)}
              className="w-5 h-5 items-center justify-center ml-2"
            >
              <Icon name="X" size={20} />
            </Pressable>
          </View>
        </View>
      )}
    </AnimatedView>
  );
}

