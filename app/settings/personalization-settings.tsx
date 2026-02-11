import React, { useState } from 'react';
import { View, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

interface PersonalizationSettingsProps {
  onBack?: () => void;
}

export default function PersonalizationSettings({ onBack }: PersonalizationSettingsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [introduction, setIntroduction] = useState("I'm a designer who likes to design mobile and desktop app");
  const [location, setLocation] = useState('London, UK');
  const [preciseLocationEnabled, setPreciseLocationEnabled] = useState(false);

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={onBack}
        userName={user?.full_name || 'User'}
        userAvatar={undefined}
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

          {/* Introduce yourself */}
          <View className="mb-6">
            <ThemedText className="text-sm mb-2">Introduce yourself</ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-3 min-h-[80px]">
              <TextInput
                value={introduction}
                onChangeText={setIntroduction}
                className="text-sm"
                style={{ color: colors.foreground }}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.mutedForeground}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Location */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <ThemedText className="text-sm">Location</ThemedText>
              <View className="flex-row gap-2">
                <Switch
                  value={preciseLocationEnabled}
                  onValueChange={setPreciseLocationEnabled}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={preciseLocationEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <TextInput
                value={location}
                onChangeText={setLocation}
                className="text-sm"
                style={{ color: colors.foreground }}
                placeholder="Enter location"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mt-2">
              Enter a location or enable precise location to get more accurate weather and sport
            </ThemedText>
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
              onPress={() => {
                console.log('Save changes');
                onBack?.();
              }}
            >
              <ThemedText className="text-sm text-foreground dark:text-darkForeground font-medium">
                Save Changes
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

