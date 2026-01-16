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
import ImageSettingsModal from '../../components/ImageSettingsModal';
import UserMessageBubble from '../../components/UserMessageBubble';
import AIMessageBubble from '../../components/AIMessageBubble';
import AILoadingIndicator from '../../components/AILoadingIndicator';
import GenerationProgress from '../../components/GenerationProgress';
import PlusMenu from '../../components/PlusMenu';
import MoreOptionsMenu from '../../components/MoreOptionsMenu';
import AnimatedSidebar from '../../components/AnimatedSidebar';
import ThemedScroller from '../../components/shared/ThemeScroller';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import VendorCarousel from '../../components/VendorCarousel';
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
  variants?: string[]; // Multiple response variants
  currentVariantIndex?: number; // Current variant being shown
  isGeneratingVariant?: boolean; // Whether a new variant is being generated
  isRetrying?: boolean; // Whether the message is being retried
  retryMessage?: string; // Message shown during retry
  feedbackAcknowledged?: boolean; // Whether feedback acknowledgment is shown
  feedbackType?: 'up' | 'down'; // Type of feedback given
  related_vendors?: Vendor[]; // Vendors to show for selection
  conversationId?: string;
  schedulingTaskId?: string;
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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>();
  const [selectedRatio, setSelectedRatio] = useState<string | undefined>();
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [moreMenuVisible, setMoreMenuVisible] = useState<string | null>(null); // Message ID for which menu is open
  const [moreMenuPosition, setMoreMenuPosition] = useState<{ x: number; y: number } | undefined>();
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
  }, [messages.length]);

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
        // Create new conversation
        response = await apiClient.createConversation({ message: messageText });
        if (response?.conversation_id) {
          setConversationId(response.conversation_id);
          if (response.scheduling_task_id) {
            setSchedulingTaskId(response.scheduling_task_id);
          }
        }
      } else {
        // Send to existing conversation
        response = await apiClient.sendMessage(conversationId, { message: messageText });
      }

      if (response) {
        setMessages((prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === analyzingMessage.id
              ? {
                  ...msg,
                  status: 'completed' as MessageStatus,
                  content: response.response_message,
                  related_vendors: response.related_vendors,
                  variants: [response.response_message],
                  currentVariantIndex: 0,
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
        variants: [confirmationContent],
        currentVariantIndex: 0,
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

  const handleMoreOptions = (messageId: string, event?: any) => {
    // Calculate position for menu (below the more button)
    // For now, use a fixed position - in real app, measure the button position
    setMoreMenuPosition({ x: 36, y: 0 });
    setMoreMenuVisible(messageId);
  };

  const handleAskToChangeResponse = (messageId: string) => {
    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? { ...msg, isGeneratingVariant: true }
          : msg
      )
    );

    // Simulate generating another response
    setTimeout(() => {
      const message = messages.find((m: Message) => m.id === messageId);
      if (message) {
        const newVariant = "Just go for it! Test it out. If it gets the same message across with fewer parts, that's a great sign your layout is getting better.";
        const existingVariants = message.variants || [message.content];
        const newVariants = [...existingVariants, newVariant];

        setMessages((prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === messageId
              ? {
                  ...msg,
                  variants: newVariants,
                  currentVariantIndex: newVariants.length - 1,
                  isGeneratingVariant: false,
                  content: newVariant,
                }
              : msg
          )
        );
      }
    }, 2000);
  };

  const handleRetry = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (!message) return;

    // Show retry message
    const retryMessage = "Alright, let's try that again from scratch. I'll take a different approach this time — keeping the same context but aiming for a clearer and more useful answer.";

    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              isRetrying: true,
              retryMessage: retryMessage,
              content: retryMessage,
            }
          : msg
      )
    );

    // Simulate generating new response
    setTimeout(() => {
      // Generate a new response variant
      const newResponse = "Just go for it! Test it out. If it gets the same message across with fewer parts, that's a great sign your layout is getting better.";
      const existingVariants = message.variants || [message.content];
      const newVariants = [...existingVariants, newResponse];

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                isRetrying: false,
                retryMessage: undefined,
                variants: newVariants,
                currentVariantIndex: newVariants.length - 1,
                content: newResponse,
              }
            : msg
        )
      );
    }, 2000);
  };

  const handleAddDetails = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (!message) return;

    // Show add details message
    const addDetailsMessage = "Sure thing. Let's expand on that idea with more context and nuance. I'll dive deeper into the reasoning, include relevant examples, and make it more actionable for you.";

    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              isRetrying: true,
              retryMessage: addDetailsMessage,
              content: addDetailsMessage,
            }
          : msg
      )
    );

    // Simulate generating expanded response
    setTimeout(() => {
      // Generate an expanded response with more details
      const expandedResponse = "Just go for it! Test it out. If it gets the same message across with fewer parts, that's a great sign your layout is getting better. Here's a more detailed approach: Start by identifying the core message you want to communicate. Then, systematically remove elements that don't directly support that message. Use white space strategically to create breathing room and guide the user's eye. Consider typography hierarchy - larger, bolder text for key messages creates visual weight. Finally, test with real users to see if the simplified version communicates as effectively.";
      const existingVariants = message.variants || [message.content];
      const newVariants = [...existingVariants, expandedResponse];

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                isRetrying: false,
                retryMessage: undefined,
                variants: newVariants,
                currentVariantIndex: newVariants.length - 1,
                content: expandedResponse,
              }
            : msg
        )
      );
    }, 2000);
  };

  const handleShorten = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (!message) return;

    // Show shorten message
    const shortenMessage = "Got it — I'll condense that down for you. Let's keep the key takeaways and strip away the extra fluff.";

    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              isRetrying: true,
              retryMessage: shortenMessage,
              content: shortenMessage,
            }
          : msg
      )
    );

    // Simulate generating shortened response
    setTimeout(() => {
      // Generate a shortened, condensed response
      const shortenedResponse = "Go for it! Test it. If it conveys the same message with fewer parts, your layout is improving.";
      const existingVariants = message.variants || [message.content];
      const newVariants = [...existingVariants, shortenedResponse];

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                isRetrying: false,
                retryMessage: undefined,
                variants: newVariants,
                currentVariantIndex: newVariants.length - 1,
                content: shortenedResponse,
              }
            : msg
        )
      );
    }, 2000);
  };

  const handleThinkLonger = (messageId: string) => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (!message) return;

    // Show think longer message
    const thinkLongerMessage = "Alright, let me take a moment to think this through carefully. I'll re-analyze what you said, explore a few different angles, and make sure the reasoning feels solid before I give you the next version. Give me a sec — I want this one to really make sense.";

    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              isRetrying: true,
              retryMessage: thinkLongerMessage,
              content: thinkLongerMessage,
            }
          : msg
      )
    );

    // Simulate generating longer, more thoughtful response
    setTimeout(() => {
      // Generate a longer, more thoughtful response
      const longerResponse = "Don't hesitate—dive right in! Give it a try and see how it works for you. If you find that your message is conveyed just as effectively but with fewer components, that's an excellent indication that your layout is improving significantly. Embrace the process and enjoy the journey of refining your design!";
      const existingVariants = message.variants || [message.content];
      const newVariants = [...existingVariants, longerResponse];

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                isRetrying: false,
                retryMessage: undefined,
                variants: newVariants,
                currentVariantIndex: newVariants.length - 1,
                content: longerResponse,
              }
            : msg
        )
      );
    }, 2000);
  };

  const handleBrowseWeb = (messageId: string) => {
    setMoreMenuVisible(null); // Close menu
    const message = messages.find((m: Message) => m.id === messageId);
    if (!message) return;

    // Show web browsing message
    const webBrowsingMessage = "I found a few design studies and examples showing how removing redundant sections improved clarity and engagement. Want me to summarize the key takeaways or show some visual comparisons?";

    setMessages((prev: Message[]) =>
      prev.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              isRetrying: true,
              retryMessage: webBrowsingMessage,
              content: webBrowsingMessage,
            }
          : msg
      )
    );

    // Simulate generating web-researched response
    setTimeout(() => {
      // Generate a response based on web research
      const webResearchedResponse = "Go ahead and give it a try! If you can convey the same message with fewer elements, that's a clear indication that your layout is improving.";
      const existingVariants = message.variants || [message.content];
      const newVariants = [...existingVariants, webResearchedResponse];

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                isRetrying: false,
                retryMessage: undefined,
                variants: newVariants,
                currentVariantIndex: newVariants.length - 1,
                content: webResearchedResponse,
              }
            : msg
        )
      );
    }, 2000);
  };

  const handleVariantNavigation = (messageId: string, direction: 'prev' | 'next') => {
    const message = messages.find((m: Message) => m.id === messageId);
    if (message && message.variants && message.variants.length > 1) {
      const currentIndex = message.currentVariantIndex || 0;
      let newIndex = currentIndex;

      if (direction === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'next' && currentIndex < message.variants.length - 1) {
        newIndex = currentIndex + 1;
      }

      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? {
                ...msg,
                currentVariantIndex: newIndex,
                content: message.variants![newIndex],
              }
            : msg
        )
      );
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

  const sidebarMenuItems = [
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
                // #region agent log - Defensive check for message validity
                if (!message || !message.id) {
                  console.warn('Invalid message at index', index, message);
                  return null;
                }
                // #endregion
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
                const displayContent = message.isGeneratingVariant || message.isRetrying
                  ? message.retryMessage || message.content
                  : message.variants?.[message.currentVariantIndex || 0] || message.content;

                // Show loading state if generating variant (but not retrying)
                if (message.isGeneratingVariant && !message.isRetrying) {
                  const LoadingIndicator = AILoadingIndicator as any;
                  return (
                    <View key={message.id} className="mb-4">
                      <AIBubble
                        content={displayContent}
                        onThumbsUp={() => handleThumbsUp(message.id)}
                        onThumbsDown={() => handleThumbsDown(message.id)}
                        onRegenerate={() => console.log('Regenerate')}
                        onMore={() => handleMoreOptions(message.id)}
                        variantCount={message.variants?.length}
                        currentVariantIndex={message.currentVariantIndex}
                        onVariantPrev={() => handleVariantNavigation(message.id, 'prev')}
                        onVariantNext={() => handleVariantNavigation(message.id, 'next')}
                        isGeneratingVariant={message.isGeneratingVariant}
                        isRetrying={message.isRetrying}
                      />
                    </View>
                  );
                }

                return (
                  <View key={message.id} className="mb-4" style={{ position: 'relative' }}>
                    <AIBubble
                      content={displayContent}
                      onThumbsUp={() => handleThumbsUp(message.id)}
                      onThumbsDown={() => handleThumbsDown(message.id)}
                      onRegenerate={() => handleRetry(message.id)}
                      onMore={() => handleMoreOptions(message.id)}
                      variantCount={message.variants?.length}
                      currentVariantIndex={message.currentVariantIndex}
                      onVariantPrev={() => handleVariantNavigation(message.id, 'prev')}
                      onVariantNext={() => handleVariantNavigation(message.id, 'next')}
                      isGeneratingVariant={message.isGeneratingVariant || message.isRetrying}
                    />
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
                    {moreMenuVisible === message.id && (
                      <MoreOptionsMenu
                        visible={true}
                        items={[
                          {
                            icon: 'Pencil',
                            label: 'Ask to change response',
                            onPress: () => handleAskToChangeResponse(message.id),
                          },
                          {
                            icon: 'RotateCcw',
                            label: 'Retry',
                            onPress: () => handleRetry(message.id),
                          },
                          {
                            icon: 'Image',
                            label: 'Add details',
                            onPress: () => handleAddDetails(message.id),
                          },
                          {
                            icon: 'Scissors',
                            label: 'Shorten',
                            onPress: () => handleShorten(message.id),
                          },
                          {
                            icon: 'Lightbulb',
                            label: 'Think longer',
                            onPress: () => handleThinkLonger(message.id),
                          },
                          {
                            icon: 'Globe',
                            label: 'Browse the web',
                            onPress: () => handleBrowseWeb(message.id),
                          },
                        ]}
                        onClose={() => setMoreMenuVisible(null)}
                        position={moreMenuPosition}
                      />
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
                  onSettingsPress={() => setSettingsVisible(true)}
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

      {/* Image Settings Modal */}
      <ImageSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        selectedStyle={selectedStyle}
        selectedRatio={selectedRatio}
        onStyleSelect={(style) => setSelectedStyle(style)}
        onRatioSelect={(ratio) => setSelectedRatio(ratio)}
      />

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

