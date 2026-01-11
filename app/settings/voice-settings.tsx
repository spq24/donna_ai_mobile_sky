import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { useAuth } from '@/contexts/AuthContext';

type Voice = 'willow' | 'hazelwood' | 'valerian' | 'arborville' | 'solstice' | 'emberly' | 'sprucetown' | 'coverton' | 'breezeway';

interface VoiceOption {
  code: Voice;
  label: string;
}

interface VoiceSettingsProps {
  onBack?: () => void;
}

const voices: VoiceOption[] = [
  { code: 'willow', label: 'Willow' },
  { code: 'hazelwood', label: 'Hazelwood' },
  { code: 'valerian', label: 'Valerian' },
  { code: 'arborville', label: 'Arborville' },
  { code: 'solstice', label: 'Solstice' },
  { code: 'emberly', label: 'Emberly' },
  { code: 'sprucetown', label: 'Sprucetown' },
  { code: 'coverton', label: 'Coverton' },
  { code: 'breezeway', label: 'Breezeway' },
];

export default function VoiceSettings({ onBack }: VoiceSettingsProps) {
  const { user } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<Voice>('willow');

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    // In a real app, this would save the voice preference
    console.log('Selected voice:', voice);
  };

  const renderVoiceOption = (voice: VoiceOption) => {
    const isSelected = selectedVoice === voice.code;
    return (
      <Pressable
        key={voice.code}
        onPress={() => handleSelectVoice(voice.code)}
        className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-2 bg-light-secondary dark:bg-dark-secondary"
      >
        <ThemedText className="text-sm">{voice.label}</ThemedText>
        {isSelected ? (
          <Icon name="Check" size={16} />
        ) : (
          <View style={{ width: 16, height: 16 }} />
        )}
      </Pressable>
    );
  };

  return (
    <AnimatedView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
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
            <ThemedText className="text-2xl font-semibold">Voice</ThemedText>
          </View>

          {/* Voice Options */}
          <View className="mb-6">
            {voices.map((voice) => renderVoiceOption(voice))}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

