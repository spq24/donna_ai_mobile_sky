import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import { useAuth } from '@/contexts/AuthContext';

interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

interface IntegrationsSettingsProps {
  onBack?: () => void;
}

export default function IntegrationsSettings({ onBack }: IntegrationsSettingsProps) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'Google Drive', icon: 'Cloud', connected: true },
    { id: '2', name: 'Notion', icon: 'FileText', connected: true },
    { id: '3', name: 'Slack', icon: 'MessageSquare', connected: false },
    { id: '4', name: 'Figma', icon: 'Image', connected: false },
    { id: '5', name: 'GitHub', icon: 'Github', connected: false },
  ]);

  const handleToggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
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
            <ThemedText className="text-2xl font-semibold">Header</ThemedText>
            <View className="h-px bg-light-secondary dark:bg-dark-secondary mt-4" />
          </View>

          {/* Integrations List */}
          <View className="mb-6">
            {integrations.map((integration) => (
              <View
                key={integration.id}
                className="flex-row items-center justify-between py-3 mb-2"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-lg bg-light-secondary dark:bg-dark-secondary items-center justify-center">
                    <Icon name={integration.icon as any} size={24} />
                  </View>
                  <ThemedText className="text-sm flex-1">{integration.name}</ThemedText>
                </View>
                <Pressable
                  onPress={() => handleToggleConnection(integration.id)}
                  className={`px-3 py-1.5 rounded-xl ${
                    integration.connected
                      ? 'bg-light-secondary dark:bg-dark-secondary'
                      : 'bg-dark-primary dark:bg-light-primary'
                  }`}
                  style={integration.connected ? undefined : shadowPresets.small}
                >
                  <ThemedText
                    className={`text-xs ${
                      integration.connected
                        ? 'text-light-text dark:text-dark-text'
                        : 'text-light-primary dark:text-dark-primary font-medium'
                    }`}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </ThemedText>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}

