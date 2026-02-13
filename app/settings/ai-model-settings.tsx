import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { useAuth } from '@/contexts/AuthContext';

type AIModel = 'skyai5o' | 'chatgpt5' | 'gemini25pro' | 'manusai';

interface AIModelOption {
  code: AIModel;
  label: string;
}

interface AIModelSettingsProps {
  onBack?: () => void;
}

const aiModels: AIModelOption[] = [
  { code: 'skyai5o', label: 'SkyAI 5o' },
  { code: 'chatgpt5', label: 'Chatgpt 5' },
  { code: 'gemini25pro', label: 'Gemini 2.5 Pro' },
  { code: 'manusai', label: 'ManusAI' },
];

export default function AIModelSettings({ onBack }: AIModelSettingsProps) {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState<AIModel>('skyai5o');

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    // In a real app, this would save the AI model preference
    console.log('Selected AI model:', model);
  };

  const renderModelOption = (model: AIModelOption) => {
    const isSelected = selectedModel === model.code;
    return (
      <Pressable
        key={model.code}
        onPress={() => handleSelectModel(model.code)}
        className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-2 bg-muted dark:bg-darkMuted"
      >
        <ThemedText className="text-sm">{model.label}</ThemedText>
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
            <ThemedText className="text-2xl font-semibold">AI Model</ThemedText>
          </View>

          {/* AI Model Options */}
          <View className="mb-6">
            {aiModels.map((model) => renderModelOption(model))}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

