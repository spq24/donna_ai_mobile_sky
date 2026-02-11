import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import GreetingSection from '../../components/GreetingSection';
import ChatInputBar from '../../components/ChatInputBar';
import AnimatedSidebar from '../../components/AnimatedSidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleChipPress = (label: string) => {
    console.log('Chip pressed:', label);
    // Handle chip press logic here
  };

  const handleSendMessage = () => {
    console.log('Send message');
    // Handle send message logic here
  };

  const handlePlusPress = () => {
    console.log('Plus pressed');
    // Handle plus press logic here
  };

  const handleMicPress = () => {
    console.log('Mic pressed');
    // Handle mic press logic here
  };

  const sidebarMenuItems = [
    { label: 'Home', icon: 'Home', active: true },
    { label: 'Chat History', icon: 'MessageCircle' },
    { label: 'Explore', icon: 'Compass' },
    { label: 'Library', icon: 'Folder' },
    { label: 'Media', icon: 'Image' },
  ];

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={handleMenuPress}
        userName={user?.full_name || 'User'}
        userAvatar={undefined}
      />

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
        className="flex-1"
      >
        <View className="flex-1 px-4">
          <GreetingSection
            userName={user?.full_name?.split(' ')[0] || 'Jason'}
            onChipPress={handleChipPress}
          />
        </View>

        <ChatInputBar
          placeholder="Ask AI anything"
          onPlusPress={handlePlusPress}
          onMicPress={handleMicPress}
          onSendPress={handleSendMessage}
        />
      </KeyboardAvoidingView>

      {/* Sidebar */}
      <AnimatedSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        menuItems={sidebarMenuItems}
        userName={user?.full_name || 'Jhon Wales'}
        userEmail={user?.email || 'jhonwales@gmail.com'}
        userAvatar={undefined}
      />
    </AnimatedView>
  );
}

