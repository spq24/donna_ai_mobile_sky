import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from '../../components/shared/ThemedText';
import ThemedScroller from '../../components/shared/ThemeScroller';
import Icon from '../../components/shared/Icon';
import ChatHeader from '../../components/ChatHeader';
import { shadowPresets } from '../../utils/useShadow';
import { useAuth } from '@/contexts/AuthContext';
import AccountSettings from '../settings/account-settings';
import PersonalizationSettings from '../settings/personalization-settings';
import NotificationsSettings from '../settings/notifications-settings';
import IntegrationsSettings from '../settings/integrations-settings';
import SubscriptionSettings from '../settings/subscription-settings';
import DataControlSettings from '../settings/data-control-settings';
import SecuritySettings from '../settings/security-settings';
import AppearanceSettings from '../settings/appearance-settings';
import AppLanguageSettings from '../settings/app-language-settings';
import VoiceSettings from '../settings/voice-settings';
import AIModelSettings from '../settings/ai-model-settings';
import ImageGenerateModelSettings from '../settings/image-generate-model-settings';

type SettingsScreenMode = 'main' | 'account' | 'personalization' | 'notifications' | 'integrations' | 'subscription' | 'dataControl' | 'security' | 'appearance' | 'appLanguage' | 'voice' | 'aiModel' | 'imageGenerateModel';

interface SettingsScreenProps {
  onNavigateHome?: () => void;
  onNavigateToScreen?: (screen: SettingsScreenMode) => void;
  onMenuPress?: () => void;
  currentScreen?: SettingsScreenMode;
}

export default function SettingsScreen({ onNavigateHome, onNavigateToScreen, onMenuPress, currentScreen = 'main' }: SettingsScreenProps = {}) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState<SettingsScreenMode>(currentScreen);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutNotificationVisible, setLogoutNotificationVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const handleBack = () => {
    setActiveScreen('main');
  };

  const handleNavigateToScreen = (screen: SettingsScreenMode) => {
    setActiveScreen(screen);
    onNavigateToScreen?.(screen);
  };

  const renderSubScreen = () => {
    switch (activeScreen) {
      case 'account':
        return <AccountSettings onBack={handleBack} />;
      case 'personalization':
        return <PersonalizationSettings onBack={handleBack} />;
      case 'notifications':
        return <NotificationsSettings onBack={handleBack} />;
      case 'integrations':
        return <IntegrationsSettings onBack={handleBack} />;
      case 'subscription':
        return <SubscriptionSettings onBack={handleBack} />;
      case 'dataControl':
        return <DataControlSettings onBack={handleBack} />;
      case 'security':
        return <SecuritySettings onBack={handleBack} />;
      case 'appearance':
        return <AppearanceSettings onBack={handleBack} />;
      case 'appLanguage':
        return <AppLanguageSettings onBack={handleBack} />;
      case 'voice':
        return <VoiceSettings onBack={handleBack} />;
      case 'aiModel':
        return <AIModelSettings onBack={handleBack} />;
      case 'imageGenerateModel':
        return <ImageGenerateModelSettings onBack={handleBack} />;
      default:
        return null;
    }
  };

  const renderSettingsItem = (
    icon: string,
    label: string,
    onPress: () => void,
    rightContent?: React.ReactNode,
    showArrow: boolean = true
  ) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3 px-3 active:bg-light-secondary dark:active:bg-dark-secondary rounded-xl"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Icon name={icon as any} size={20} />
        <ThemedText className="text-sm flex-1">{label}</ThemedText>
      </View>
      {rightContent || (showArrow && <Icon name="ChevronRight" size={16} />)}
    </Pressable>
  );

  const renderMainSettings = () => (
    <ThemedScroller
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="pt-4 px-4">
        {/* Settings Title */}
        <View className="mb-6">
          <ThemedText className="text-2xl font-semibold">Settings</ThemedText>
        </View>

        {/* Account Settings Section */}
        <View className="mb-6">
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-2 px-3">
            Account Settings
          </ThemedText>
          <View className="bg-muted dark:bg-darkMuted rounded-2xl overflow-hidden">
            {renderSettingsItem('User', 'Account', () => handleNavigateToScreen('account'))}
            {renderSettingsItem('Wrench', 'Personalization', () => handleNavigateToScreen('personalization'))}
            {renderSettingsItem('Bell', 'Notifications', () => handleNavigateToScreen('notifications'))}
            {renderSettingsItem('Plug', 'Integrations', () => handleNavigateToScreen('integrations'))}
            {renderSettingsItem('Gift', 'Manage Subscription', () => handleNavigateToScreen('subscription'))}
            {renderSettingsItem('Database', 'Data control', () => handleNavigateToScreen('dataControl'))}
            {renderSettingsItem('Key', 'Security', () => handleNavigateToScreen('security'))}
          </View>
        </View>

        {/* Artificial Intelligence Section */}
        <View className="mb-6">
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-2 px-3">
            Artificial Intelligence
          </ThemedText>
          <View className="bg-muted dark:bg-darkMuted rounded-2xl overflow-hidden">
            {renderSettingsItem(
              'Moon',
              'AI Model',
              () => handleNavigateToScreen('aiModel'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">System</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}
            {renderSettingsItem(
              'Languages',
              'Image Generate Model',
              () => handleNavigateToScreen('imageGenerateModel'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Auto Detection</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}

          </View>
        </View>

        {/* App Section */}
        <View className="mb-6">
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-2 px-3">
            App
          </ThemedText>
          <View className="bg-muted dark:bg-darkMuted rounded-2xl overflow-hidden">
            {renderSettingsItem(
              'Moon',
              'Appearance',
              () => handleNavigateToScreen('appearance'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">System</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}
            {renderSettingsItem(
              'Languages',
              'App Language',
              () => handleNavigateToScreen('appLanguage'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Auto Detection</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}
            {renderSettingsItem(
              'Volume2',
              'Spoken Language',
              () => console.log('Spoken Language'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Auto Detection</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}
            {renderSettingsItem(
              'Mic',
              'Voice',
              () => handleNavigateToScreen('voice'),
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Willow</ThemedText>
                <Icon name="ChevronRight" size={16} />
              </View>
            )}

          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-2 px-3">
            About
          </ThemedText>
          <View className="bg-muted dark:bg-darkMuted rounded-2xl overflow-hidden">
            {renderSettingsItem('Info', 'Support', () => console.log('Support'), undefined, false)}
            {renderSettingsItem('FileText', 'Terms of Use', () => console.log('Terms of Use'), undefined, false)}
            {renderSettingsItem('Lock', 'Privacy Policy', () => console.log('Privacy Policy'), undefined, false)}

          </View>
        </View>

        {/* Logout and Delete Account */}
        <View className="mb-6">
          <View className="bg-muted dark:bg-darkMuted rounded-2xl overflow-hidden">
            {renderSettingsItem('LogOut', 'Logout', () => setLogoutModalVisible(true), undefined, false)}
            {renderSettingsItem('Trash2', 'Delete Account', () => setDeleteAccountModalVisible(true), undefined, false)}
          </View>

        </View>
      </View>
    </ThemedScroller>
  );

  return (
    <View className="flex-1">
      {activeScreen === 'main' ? (
        <>
          <ChatHeader
            onMenuPress={onMenuPress}
            userName={user?.full_name || 'User'}
            userAvatar={undefined}
          />
          {renderMainSettings()}
        </>
      ) : (
        renderSubScreen()
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View
          className="flex-1 bg-black/40 items-center justify-center"
          style={{ paddingHorizontal: 16 }}
        >
          <View
            className="bg-background dark:bg-darkBackground rounded-2xl w-full"
            style={{ maxWidth: 327, padding: 16, ...shadowPresets.large }}
          >
            {/* Header */}
            <View className="mb-4">
              <ThemedText className="text-lg font-semibold">Logout</ThemedText>
            </View>

            {/* Message */}
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-6">
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </ThemedText>

            {/* Action Buttons */}
            <View className="flex-row gap-2 justify-end">
              <Pressable
                className="px-4 py-2 rounded-xl"
                onPress={() => setLogoutModalVisible(false)}
              >
                <ThemedText className="text-sm">Cancel</ThemedText>
              </Pressable>
              <Pressable
                className="bg-foreground dark:bg-darkForeground rounded-xl px-4 py-2"
                style={shadowPresets.small}
                onPress={async () => {
                  setLogoutModalVisible(false);
                  // Show notification first
                  setLogoutNotificationVisible(true);
                  // Then logout after a brief delay
                  setTimeout(async () => {
                    await logout();
                  }, 1000);
                }}
              >
                <ThemedText className="text-sm text-foreground dark:text-darkForeground font-medium">
                  Sign Out
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View
          className="flex-1 bg-black/40 items-center justify-center"
          style={{ paddingHorizontal: 16 }}
        >
          <View
            className="bg-background dark:bg-darkBackground rounded-2xl w-full"
            style={{ maxWidth: 327, padding: 16, ...shadowPresets.large }}
          >
            {/* Header */}
            <View className="mb-4">
              <ThemedText className="text-lg font-semibold">Delete Account</ThemedText>
            </View>

            {/* Information */}
            <View className="mb-6">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-4">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </ThemedText>
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-4">
                This will permanently delete:
                {'\n'}• All your conversations and chat history
                {'\n'}• Your account settings and preferences
                {'\n'}• All generated content (images, videos, documents)
                {'\n'}• Your subscription and billing information
              </ThemedText>
              <ThemedText className="text-sm text-red-500 dark:text-red-400 font-medium">
                Warning: This action is permanent and cannot be reversed. Please make sure you want to proceed.
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2 justify-end">
              <Pressable
                className="px-4 py-2 rounded-xl"
                onPress={() => setDeleteAccountModalVisible(false)}
              >
                <ThemedText className="text-sm">Cancel</ThemedText>
              </Pressable>
              <Pressable
                className="bg-red-500 dark:bg-red-600 rounded-xl px-4 py-2"
                style={shadowPresets.small}
                onPress={async () => {
                  setDeleteAccountModalVisible(false);
                  // Handle account deletion
                  console.log('Delete account');
                  // In a real app, this would call an API to delete the account
                  // await apiClient.deleteAccount();
                  // await logout();
                }}
              >
                <ThemedText className="text-sm text-white font-medium">
                  Delete Account
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Success Notification Banner */}
      {logoutNotificationVisible && (
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
              You're logout, you can sign in again.
            </ThemedText>
            <Pressable
              onPress={() => setLogoutNotificationVisible(false)}
              className="w-5 h-5 items-center justify-center ml-2"
            >
              <Icon name="X" size={20} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
