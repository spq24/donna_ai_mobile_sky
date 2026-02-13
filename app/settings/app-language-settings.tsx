import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { useAuth } from '@/contexts/AuthContext';

type Language = 'auto' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh';

interface LanguageOption {
  code: Language;
  label: string;
}

interface AppLanguageSettingsProps {
  onBack?: () => void;
}

const languages: LanguageOption[] = [
  { code: 'auto', label: 'Automatic detection' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
];

export default function AppLanguageSettings({ onBack }: AppLanguageSettingsProps) {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('auto');

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    // In a real app, this would save the language preference
    console.log('Selected language:', language);
  };

  const renderLanguageOption = (language: LanguageOption) => {
    const isSelected = selectedLanguage === language.code;
    return (
      <Pressable
        key={language.code}
        onPress={() => handleSelectLanguage(language.code)}
        className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-2 bg-muted dark:bg-darkMuted"
      >
        <ThemedText className="text-sm">{language.label}</ThemedText>
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
            <ThemedText className="text-2xl font-semibold">App Language</ThemedText>
          </View>

          {/* Language Options */}
          <View className="mb-6">
            {languages.map((language) => renderLanguageOption(language))}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

