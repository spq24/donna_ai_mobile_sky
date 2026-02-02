import React, { useState, useRef, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Image, Pressable } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import GreetingSection from '../../components/GreetingSection';
import ExploreScreen from '../../components/ExploreScreen';
import MediaScreen from './media-screen';
import ChatHistoryScreen from './chat-history-screen';
import SettingsScreen from './settings-screen';
import ExpandableChatInput from '../../components/ExpandableChatInput';
import UserMessageBubble from '../../components/UserMessageBubble';
import AIMessageBubble from '../../components/AIMessageBubble';
import AILoadingIndicator from '../../components/AILoadingIndicator';
import GenerationProgress from '../../components/GenerationProgress';
import PlusMenu from '../../components/PlusMenu';
import AnimatedSidebar from '../../components/AnimatedSidebar';
import ThemedScroller from '../../components/shared/ThemeScroller';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import VendorCarousel from '../../components/VendorCarousel';
import { GenerativeUIRenderer, GenerativeUIList } from '../../components/generative';
import { GenerativeUIComponent, CardMode } from '../../types/generative-ui';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '../../lib/api-client';
import { Vendor } from '../../types/vendor';

// Unique ID generator to prevent duplicate keys
let messageIdCounter = 0;
const generateMessageId = (prefix: string = 'msg') => {
  messageIdCounter++;
  return `${prefix}-${Date.now()}-${messageIdCounter}`;
};

type MessageStatus = 'idle' | 'analyzing' | 'generating' | 'searching' | 'image_gen' | 'video_gen' | 'completed';
type GenerationType = 'image' | 'video';

interface AttachedImage {
  uri: string;
  fileName?: string;
}

interface AttachedFile {
  uri: string;
  fileName: string;
  fileType?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: MessageStatus;
  generationType?: GenerationType;
  imageUrl?: string;
  attachedImages?: AttachedImage[];
  attachedFiles?: AttachedFile[];
  feedbackAcknowledged?: boolean; // Whether feedback acknowledgment is shown
  feedbackType?: 'up' | 'down'; // Type of feedback given
  related_vendors?: Vendor[]; // Vendors to show for selection
  ui_components?: GenerativeUIComponent[]; // Generative UI components to render
}

type ViewMode = 'home' | 'explore' | 'media' | 'chatHistory' | 'settings';

export default function ChatScreen() {
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [plusMenuVisible, setPlusMenuVisible] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>();
  const scrollViewRef = useRef<ScrollView>(null);

  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleChipPress = (label: string) => {
    // Treat chip press as a message
    handleSendMessage(label);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText && attachedImages.length === 0 && attachedFiles.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: generateMessageId('user'),
      role: 'user',
      content: messageText || '',
      status: 'completed',
      attachedImages: attachedImages.length > 0 ? [...attachedImages] : undefined,
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputText('');
    setAttachedImages([]);
    setAttachedFiles([]);
    setImageMode(false);

    // Add analyzing state
    const analyzingMessage: Message = {
      id: generateMessageId('analyzing'),
      role: 'assistant',
      content: '',
      status: 'analyzing',
    };
    setMessages((prev: Message[]) => [...prev, analyzingMessage]);

    try {
      let response;
      if (!conversationId) {
        // Create new agentic conversation
        response = await apiClient.createAgenticConversation({ message: messageText });
        if (response?.conversation_id) {
          setConversationId(response.conversation_id);
        }
      } else {
        // Send to existing agentic conversation
        response = await apiClient.sendAgenticMessage(conversationId, { message: messageText });
      }

      if (response) {
        setMessages((prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === analyzingMessage.id
              ? {
                  ...msg,
                  status: 'completed' as MessageStatus,
                  content: response.response,
                  ui_components: response.ui_components,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === analyzingMessage.id
            ? {
                ...msg,
                status: 'completed' as MessageStatus,
                content: "Sorry, I encountered an error. Please try again.",
              }
            : msg
        )
      );
    }
  };

  const handlePlusPress = () => {
    setPlusMenuVisible(!plusMenuVisible);
  };

  const handleCreateImages = () => {
    setImageMode(true);
    setPlusMenuVisible(false);
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev: AttachedImage[]) => prev.filter((_: AttachedImage, i: number) => i !== index));
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev: AttachedFile[]) => prev.filter((_: AttachedFile, i: number) => i !== index));
  };

  const handleAddImage = (uri: string, fileName?: string) => {
    setAttachedImages((prev: AttachedImage[]) => [...prev, { uri, fileName }]);
  };

  const handleAddFile = (uri: string, fileName: string, fileType?: string) => {
    setAttachedFiles((prev: AttachedFile[]) => [...prev, { uri, fileName, fileType }]);
  };

  const handleUploadFiles = () => {
    // Simulate file picker - in real app, use expo-document-picker or similar
    const mockFile: AttachedFile = {
      uri: 'file://mock-document.pdf',
      fileName: 'Wolverine_Figure.webp',
      fileType: 'File',
    };
    handleAddFile(mockFile.uri, mockFile.fileName, mockFile.fileType);
    setPlusMenuVisible(false);
  };

  const handleMicPress = () => {
    console.log('Mic pressed');
    // Handle mic press logic here
  };

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendorId(vendor.id);
  };

  // Handler for vendor selection from generative UI vendor cards
  const handleGenerativeVendorSelect = async (vendorId: number) => {
    setSelectedVendorId(vendorId);
    
    // Find the vendor details from ui_components
    let vendorName = '';
    let serviceType = '';
    for (const msg of messages) {
      if (msg.ui_components) {
        const vendorComponent = msg.ui_components.find(
          (c) => c.type === 'vendor_card' && c.props.id === vendorId
        );
        if (vendorComponent) {
          vendorName = vendorComponent.props.name || '';
          serviceType = vendorComponent.props.service_type || '';
          break;
        }
      }
    }

    // Send a message to the agent with vendor_id encoded so LLM can extract it
    const selectionMessage = vendorName 
      ? `I want to schedule with ${vendorName} (vendor_id: ${vendorId})`
      : `I selected vendor ${vendorId} for scheduling (vendor_id: ${vendorId})`;
    
    await handleSendMessage(selectionMessage);
  };

  const handleVendorConfirm = async (messageId: string) => {
    if (!selectedVendorId || !schedulingTaskId || !conversationId) return;

    const message = messages.find((m: Message) => m.id === messageId);
    const selectedVendor = message?.related_vendors?.find((v: Vendor) => v.id === selectedVendorId);

    if (!selectedVendor) return;

    try {
      // Update the scheduling task with the selected vendor
      await apiClient.updateSchedulingTask(schedulingTaskId, {
        vendor_id: selectedVendorId,
      });

      // Add a confirmation message
      const confirmationContent = `Great! I'll contact ${selectedVendor.name} for you. Let me just confirm the rest of the information with you and I'll get right on that!`;

      const confirmationMessage: Message = {
        id: generateMessageId('confirm'),
        role: 'assistant',
        content: confirmationContent,
        status: 'completed',
      };

      setMessages((prev: Message[]) => [
        ...prev.map((msg: Message) =>
          msg.id === messageId ? { ...msg, related_vendors: undefined } : msg
        ),
        confirmationMessage
      ]);

      setSelectedVendorId(undefined);

      // Trigger preference confirmation or next step - wrapped in try/catch to prevent cascade
      try {
        const continuationMessage = "Please show me my preferences for this appointment.";
        await handleSendMessage(continuationMessage);
      } catch (sendErr) {
        console.error("Failed to send continuation message:", sendErr);
        // Don't throw - the vendor update succeeded
      }

    } catch (err) {
      console.error("Failed to update vendor:", err);
      // Add error message
      const errorMessage: Message = {
        id: generateMessageId('error'),
        role: 'assistant',
        content: "Sorry, I encountered an error while updating the vendor. Please try again.",
        status: 'completed',
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    }
  };

  const handleCopyMessage = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (message) {
      // Copy to clipboard logic here
      console.log('Copying:', message.content);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (message) {
      setInputText(message.content);
      // Remove the message to allow editing
      setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== messageId));
    }
  };

  const handleThumbsUp = (messageId: string) => {
    // Show feedback acknowledgment
    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? { ...msg, feedbackAcknowledged: true, feedbackType: 'up' }
          : msg
      )
    );
  };

  const handleThumbsDown = (messageId: string) => {
    // Show feedback acknowledgment
    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? { ...msg, feedbackAcknowledged: true, feedbackType: 'down' }
          : msg
      )
    );
  };

  const handleDismissFeedback = (messageId: string) => {
    // Hide feedback acknowledgment
    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? { ...msg, feedbackAcknowledged: false }
          : msg
      )
    );
  };

  // Handler to start a new chat
  const handleNewChat = () => {
    // Clear all chat state
    setMessages([]);
    setConversationId(null);
    setSchedulingTaskId(null);
    setSelectedVendorId(undefined);
    setInputText('');
    setAttachedImages([]);
    setAttachedFiles([]);
    // Switch to home view and close sidebar
    setViewMode('home');
    setSidebarVisible(false);
  };

  const sidebarMenuItems = [
    {
      label: 'New Chat',
      icon: 'PlusCircle',
      onPress: handleNewChat,
    },
    {
      label: 'Home',
      icon: 'Home',
      active: viewMode === 'home',
      onPress: () => {
        setViewMode('home');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Chat History',
      icon: 'MessageSquare',
      active: viewMode === 'chatHistory',
      onPress: () => {
        setViewMode('chatHistory');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Explore',
      icon: 'Compass',
      active: viewMode === 'explore',
      onPress: () => {
        setViewMode('explore');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Library',
      icon: 'Folder',
      onPress: () => {
        console.log('Library');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Media',
      icon: 'Image',
      active: viewMode === 'media',
      onPress: () => {
        setViewMode('media');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Settings',
      icon: 'Settings',
      active: viewMode === 'settings',
      onPress: () => {
        setViewMode('settings');
        setSidebarVisible(false);
      },
    },
  ];

  const handleExploreCardPress = (cardId: string) => {
    console.log('Explore card pressed:', cardId);
    // Handle explore card navigation
    if (cardId === 'ai-assistant') {
      setViewMode('home');
    }
  };

  return (
    <AnimatedView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      animation="fadeIn"
      duration={350}
    >
      {/* Main Content */}
      <View className="flex-1">
        {(viewMode === 'home' || viewMode === 'explore') && (
          <ChatHeader
            onMenuPress={handleMenuPress}
            userName={user?.full_name || 'Jason'}
            userAvatar={undefined}
          />
        )}
        {viewMode === 'explore' ? (
          <ExploreScreen
            onCardPress={handleExploreCardPress}
            onLearnMorePress={() => console.log('Learn more pressed')}
          />
        ) : viewMode === 'media' ? (
          <MediaScreen
            onNavigateHome={() => setViewMode('home')}
            onMenuPress={handleMenuPress}
          />
        ) : viewMode === 'chatHistory' ? (
          <ChatHistoryScreen
            onNavigateHome={() => setViewMode('home')}
            onMenuPress={handleMenuPress}
          />
        ) : viewMode === 'settings' ? (
          <SettingsScreen
            onNavigateHome={() => setViewMode('home')}
            onMenuPress={handleMenuPress}
          />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={{ flex: 1 }}
          >
            {hasMessages ? (
            // Chat Messages View
            // @ts-ignore - children are provided as JSX children, TypeScript limitation with forwardRef
            <ThemedScroller
              ref={scrollViewRef}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 16, paddingHorizontal: 16 }}
            >
              {messages.map((message: Message, index: number) => {
                // Defensive check for message validity
                if (!message || !message.id) {
                  console.warn('Invalid message at index', index, message);
                  return null;
                }
                if (message.role === 'user') {
                  const UserBubble = UserMessageBubble as any;
                  return (
                    <View key={message.id} className="mb-4">
                      <UserBubble
                        content={message.content}
                        onCopy={() => handleCopyMessage(message.id)}
                        onEdit={() => handleEditMessage(message.id)}
                        collapsible={message.content.length > 150}
                      />
                      {(message.attachedImages && message.attachedImages.length > 0) ||
                      (message.attachedFiles && message.attachedFiles.length > 0) ? (
                        <View className="flex-row flex-wrap gap-2 mt-2 items-end">
                          {message.attachedImages?.map((img, index) => (
                            <Image
                              key={`img-${index}`}
                              source={{ uri: img.uri }}
                              style={{ width: 64, height: 64, borderRadius: 12 }}
                              resizeMode="cover"
                            />
                          ))}
                          {message.attachedFiles?.map((file, index) => (
                            <View
                              key={`file-${index}`}
                              className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-xl px-3 py-2 flex-row items-center gap-2"
                              style={{ minWidth: 191, maxWidth: 275 }}
                            >
                              <View className="w-12 h-12 rounded-lg bg-light-primary dark:bg-dark-primary items-center justify-center">
                                <Icon name="File" size={20} />
                              </View>
                              <View className="flex-1 min-w-0">
                                <ThemedText className="text-sm font-medium" numberOfLines={1}>
                                  {file.fileName}
                                </ThemedText>
                                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                                  {file.fileType || 'File'}
                                </ThemedText>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                }

                // Handle loading states
                if (message.status === 'analyzing') {
                  const LoadingIndicator = AILoadingIndicator as any;
                  return <LoadingIndicator key={message.id} status="analyzing" />;
                }
                if (message.status === 'generating') {
                  const LoadingIndicator = AILoadingIndicator as any;
                  return <LoadingIndicator key={message.id} status="generating" />;
                }
                if (message.status === 'searching') {
                  const LoadingIndicator = AILoadingIndicator as any;
                  return <LoadingIndicator key={message.id} status="searching" />;
                }

                // Handle generation states
                if (message.status === 'image_gen' || message.status === 'video_gen') {
                  const AIBubble = AIMessageBubble as any;
                  return (
                    <View key={message.id} className="mb-4">
                      <AIBubble
                        content={message.content}
                        onThumbsUp={() => handleThumbsUp(message.id)}
                        onThumbsDown={() => handleThumbsDown(message.id)}
                        onRegenerate={() => console.log('Regenerate')}
                        onMore={() => console.log('More options')}
                      />
                      {message.imageUrl && (
                        <View style={{ marginTop: 8, marginLeft: 48 }}>
                          <Image
                            source={{ uri: message.imageUrl }}
                            style={{ width: '100%', height: 100, borderRadius: 12 }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      <View style={{ marginTop: 8, marginLeft: 48 }}>
                        <GenerationProgress
                          type={message.generationType || 'image'}
                          message={
                            message.status === 'image_gen'
                              ? 'Generating your image ....'
                              : 'Generating your video ....'
                          }
                        />
                      </View>
                      {/* Feedback Acknowledgment Message */}
                      {message.feedbackAcknowledged && (
                        <View className="mt-2 flex-row items-start justify-end">
                          <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl rounded-tr-sm px-3 py-3 flex-row items-center gap-2 max-w-[343px]">
                            <ThemedText className="text-sm flex-1">
                              {message.feedbackType === 'down'
                                ? "Feedback saved. I'll use this to improve future answers"
                                : "Thanks for the feedback! Glad that response helped."}
                            </ThemedText>
                            <Pressable
                              onPress={() => handleDismissFeedback(message.id)}
                              className="w-4 h-4 items-center justify-center"
                            >
                              <Icon name="X" size={16} />
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                }

                // Regular AI message
                const AIBubble = AIMessageBubble as any;

                return (
                  <View key={message.id} className="mb-4" style={{ position: 'relative' }}>
                    <AIBubble
                      content={message.content}
                      onThumbsUp={() => handleThumbsUp(message.id)}
                      onThumbsDown={() => handleThumbsDown(message.id)}
                    />
                    {/* Generative UI Components */}
                    {message.ui_components && message.ui_components.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <GenerativeUIList
                          components={message.ui_components}
                          onModeChange={(idx, newMode) => {
                            // Update the component mode in state
                            setMessages((prev: Message[]) =>
                              prev.map((msg: Message) =>
                                msg.id === message.id
                                  ? {
                                      ...msg,
                                      ui_components: msg.ui_components?.map((c, i) =>
                                        i === idx ? { ...c, mode: newMode } : c
                                      ),
                                    }
                                  : msg
                              )
                            );
                          }}
                          onVendorSelect={handleGenerativeVendorSelect}
                          selectedVendorId={selectedVendorId}
                        />
                      </View>
                    )}
                    {message.related_vendors && message.related_vendors.length > 0 && (
                      <View style={{ marginLeft: 48 }}>
                        <VendorCarousel
                          vendors={message.related_vendors}
                          selectedVendorId={selectedVendorId}
                          onSelect={handleVendorSelect}
                          onConfirm={() => handleVendorConfirm(message.id)}
                        />
                      </View>
                    )}
                    {/* Feedback Acknowledgment Message */}
                    {message.feedbackAcknowledged && (
                      <View className="mt-2 flex-row items-start justify-end">
                        <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl rounded-tr-sm px-3 py-3 flex-row items-center gap-2 max-w-[343px]">
                          <ThemedText className="text-sm flex-1">
                            {message.feedbackType === 'down'
                              ? "Feedback saved. I'll use this to improve future answers"
                              : "Thanks for the feedback! Glad that response helped."}
                          </ThemedText>
                          <Pressable
                            onPress={() => handleDismissFeedback(message.id)}
                            className="w-4 h-4 items-center justify-center"
                          >
                            <Icon name="X" size={16} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </ThemedScroller>
            ) : (
              // Initial Greeting View
              <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <GreetingSection
                  userName={user?.full_name?.split(' ')[0] || 'Jason'}
                  onChipPress={handleChipPress}
                />
              </View>
            )}

            {viewMode === 'home' && (
              <View style={{ position: 'relative' }}>
                <PlusMenu
                  visible={plusMenuVisible}
                  items={[
                    {
                      icon: 'Upload',
                      label: 'Upload files',
                      onPress: handleUploadFiles,
                    },
                    {
                      icon: 'Folder',
                      label: 'Upload files from Drive',
                      onPress: () => {
                        handleUploadFiles();
                        console.log('Upload from Drive');
                      },
                    },
                    {
                      icon: 'Image',
                      label: 'Create images',
                      onPress: handleCreateImages,
                    },
                    {
                      icon: 'Play',
                      label: 'Create videos',
                      onPress: () => console.log('Create videos'),
                    },
                  ]}
                  onClose={() => setPlusMenuVisible(false)}
                />
                <ExpandableChatInput
                  placeholder={imageMode ? 'Describe your images' : 'Ask AI anything'}
                  onPlusPress={handlePlusPress}
                  onMicPress={handleMicPress}
                  onSendPress={handleSendMessage}
                  value={inputText}
                  onChangeText={setInputText}
                  attachedImages={attachedImages}
                  attachedFiles={attachedFiles}
                  onRemoveImage={handleRemoveImage}
                  onRemoveFile={handleRemoveFile}
                  imageMode={imageMode}
                />
              </View>
            )}
          </KeyboardAvoidingView>
        )}
      </View>

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

