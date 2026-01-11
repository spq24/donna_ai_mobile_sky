import React, { useState, useMemo } from 'react';
import { View, Pressable, TextInput, ScrollView } from 'react-native';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import { useAuth } from '@/contexts/AuthContext';
import useThemeColors from '@/contexts/ThemeColors';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video' | 'documents';
type SortBy = 'latest' | 'oldest' | 'date';

interface ChatHistoryItem {
  id: string;
  date: string;
  responseCount: number;
  userMessage: string;
  aiResponse: string;
  attachments?: {
    type: 'image' | 'video' | 'document';
    name: string;
  }[];
}

interface ChatHistoryScreenProps {
  onNavigateHome?: () => void;
  onMenuPress?: () => void;
}

export default function ChatHistoryScreen({ onNavigateHome, onMenuPress }: ChatHistoryScreenProps = {}) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Mock data - in real app, this would come from storage/API
  const mockChatHistory: ChatHistoryItem[] = [
    {
      id: '1',
      date: 'Oct 29, 2025',
      responseCount: 14,
      userMessage: "I'm working on a landing page design right now, but the whole thing feels too flat and kind of lifeless. I've got all the main elements in place the hero section, headline, CTA, visuals everything technically checks out, but it still doesn't feel right. It's clean, but somehow it lacks depth and emotion. I want it to feel more alive, like it actually speaks to the user instead of just sitting there looking polished.",
      aiResponse: "Hmm, maybe it's a hierarchy issue. Try giving your hero section a stronger visual anchor — like a big, confident headline and generous white space around it. That contrast alone can make the design breathe more.",
      attachments: [
        { type: 'image', name: 'Wolverine-figure.png' },
      ],
    },
    {
      id: '2',
      date: 'Oct 29, 2025',
      responseCount: 14,
      userMessage: "I'm working on a landing page design right now, but the whole thing feels too flat and kind of lifeless. I've got all the main elements in place the hero section, headline, CTA, visuals everything technically checks out, but it still doesn't feel right. It's clean, but somehow it lacks depth and emotion. I want it to feel more alive, like it actually speaks to the user instead of just sitting there looking polished.",
      aiResponse: "Hmm, maybe it's a hierarchy issue. Try giving your hero section a stronger visual anchor — like a big, confident headline and generous white space around it. That contrast alone can make the design breathe more.",
      attachments: [
        { type: 'video', name: 'Ads video marketing.mp4' },
      ],
    },
    {
      id: '3',
      date: 'Oct 29, 2025',
      responseCount: 14,
      userMessage: "I'm working on a landing page design right now, but the whole thing feels too flat and kind of lifeless. I've got all the main elements in place the hero section, headline, CTA, visuals everything technically checks out, but it still doesn't feel right. It's clean, but somehow it lacks depth and emotion. I want it to feel more alive, like it actually speaks to the user instead of just sitting there looking polished.",
      aiResponse: "Hmm, maybe it's a hierarchy issue. Try giving your hero section a stronger visual anchor — like a big, confident headline and generous white space around it. That contrast alone can make the design breathe more.",
    },
    {
      id: '4',
      date: 'Oct 29, 2025',
      responseCount: 14,
      userMessage: "I'm working on a landing page design right now, but the whole thing feels too flat and kind of lifeless. I've got all the main elements in place the hero section, headline, CTA, visuals everything technically checks out, but it still doesn't feel right. It's clean, but somehow it lacks depth and emotion. I want it to feel more alive, like it actually speaks to the user instead of just sitting there looking polished.",
      aiResponse: "Hmm, maybe it's a hierarchy issue. Try giving your hero section a stronger visual anchor — like a big, confident headline and generous white space around it. That contrast alone can make the design breathe more.",
    },
    {
      id: '5',
      date: 'Oct 29, 2025',
      responseCount: 14,
      userMessage: "I'm working on a landing page design right now, but the whole thing feels too flat and kind of lifeless. I've got all the main elements in place the hero section, headline, CTA, visuals everything technically checks out, but it still doesn't feel right. It's clean, but somehow it lacks depth and emotion. I want it to feel more alive, like it actually speaks to the user instead of just sitting there looking polished.",
      aiResponse: "Hmm, maybe it's a hierarchy issue. Try giving your hero section a stronger visual anchor — like a big, confident headline and generous white space around it. That contrast alone can make the design breathe more.",
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Type', icon: 'Filter' },
    { value: 'image', label: 'Image', icon: 'Image' },
    { value: 'video', label: 'Video', icon: 'Play' },
    { value: 'documents', label: 'Documents', icon: 'FileText' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'date', label: 'By Date' },
  ];

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'Image';
      case 'video':
        return 'PlayCircle';
      case 'document':
        return 'File';
      default:
        return 'File';
    }
  };

  // Filter chat history based on search text
  const filteredChatHistory = useMemo(() => {
    if (!searchText.trim()) {
      return mockChatHistory;
    }

    const searchLower = searchText.toLowerCase().trim();
    return mockChatHistory.filter((item) => {
      // Search in user message
      if (item.userMessage.toLowerCase().includes(searchLower)) {
        return true;
      }
      // Search in AI response
      if (item.aiResponse.toLowerCase().includes(searchLower)) {
        return true;
      }
      // Search in attachment names
      if (item.attachments?.some((att) => att.name.toLowerCase().includes(searchLower))) {
        return true;
      }
      return false;
    });
  }, [searchText]);

  const renderGridItem = (item: ChatHistoryItem) => (
    <View
      key={item.id}
      className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-3 mb-4"
      style={shadowPresets.small}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="flex-row items-center gap-1.5">
            <Icon name="Clock" size={14} />
            <ThemedText className="text-xs">{item.date}</ThemedText>
          </View>
          <View className="w-1.5 h-1.5 rounded-full bg-light-subtext dark:bg-dark-subtext" />
          <View className="flex-row items-center gap-1.5">
            <Icon name="MessageSquare" size={14} />
            <ThemedText className="text-xs">{item.responseCount} Response</ThemedText>
          </View>
        </View>
        <Pressable>
          <Icon name="MoreHorizontal" size={16} />
        </Pressable>
      </View>

      {/* Preview */}
      <View className="mb-3">
        <ThemedText className="text-xs mb-2" numberOfLines={1}>
          {item.userMessage}
        </ThemedText>
        <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext" numberOfLines={2}>
          {item.aiResponse}
        </ThemedText>
      </View>

      {/* Attachments */}
      {item.attachments && item.attachments.length > 0 && (
        <View className="flex-row gap-2">
          {item.attachments.map((attachment, index) => (
            <View
              key={index}
              className="bg-light-primary dark:bg-dark-primary rounded-lg px-2.5 py-1.5 flex-row items-center gap-2"
            >
              <Icon name={getAttachmentIcon(attachment.type) as any} size={14} />
              <ThemedText className="text-xs" numberOfLines={1} style={{ maxWidth: 120 }}>
                {attachment.name}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderListItem = (item: ChatHistoryItem, isLast: boolean) => (
    <View key={item.id}>
      <View className="mb-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Icon name="Clock" size={14} />
              <ThemedText className="text-xs">{item.date}</ThemedText>
            </View>
            <View className="w-1.5 h-1.5 rounded-full bg-light-subtext dark:bg-dark-subtext" />
            <View className="flex-row items-center gap-1.5">
              <Icon name="MessageSquare" size={14} />
              <ThemedText className="text-xs">{item.responseCount} Response</ThemedText>
            </View>
          </View>
          <Pressable>
            <Icon name="MoreHorizontal" size={16} />
          </Pressable>
        </View>

        {/* Preview */}
        <View className="mb-3">
          <ThemedText className="text-xs mb-2" numberOfLines={1}>
            {item.userMessage}
          </ThemedText>
          <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext" numberOfLines={2}>
            {item.aiResponse}
          </ThemedText>
        </View>

        {/* Attachments */}
        {item.attachments && item.attachments.length > 0 && (
          <View className="flex-row gap-2">
            {item.attachments.map((attachment, index) => (
              <View
                key={index}
                className="bg-light-primary dark:bg-dark-primary rounded-lg px-2.5 py-1.5 flex-row items-center gap-2"
              >
                <Icon name={getAttachmentIcon(attachment.type) as any} size={14} />
                <ThemedText className="text-xs" numberOfLines={1} style={{ maxWidth: 120 }}>
                  {attachment.name}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
      {!isLast && (
        <View className="h-px bg-light-secondary dark:bg-dark-secondary mb-4" />
      )}
    </View>
  );

  return (
    <View className="flex-1">
      <ChatHeader
        onMenuPress={onMenuPress}
        userName={user?.full_name || 'User'}
        userAvatar={undefined}
      />
      {/* Search and Filters */}
      <View className="px-4 pt-4 pb-3">
        {/* Search Bar and View Toggle */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2 flex-row items-center gap-2">
            <Icon name="Search" size={20} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 text-sm"
              style={{ color: colors.text }}
            />
          </View>
          <View className="flex-row gap-1 bg-light-secondary dark:bg-dark-secondary rounded-xl p-1">
            <Pressable
              onPress={() => setViewMode('grid')}
              className={`px-2 py-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-dark-primary dark:bg-light-primary' : ''}`}
            >
              <Icon
                name="LayoutGrid"
                size={20}
                color={viewMode === 'grid' ? undefined : undefined}
              />
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              className={`px-2 py-1.5 rounded-lg ${viewMode === 'list' ? 'bg-dark-primary dark:bg-light-primary' : ''}`}
            >
              <Icon
                name="List"
                size={20}
                color={viewMode === 'list' ? undefined : undefined}
              />
            </Pressable>
          </View>
        </View>

        {/* Filter and Sort */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              setFilterMenuVisible(!filterMenuVisible);
              setSortMenuVisible(false);
            }}
            className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Icon name="Filter" size={20} />
              <ThemedText className="text-sm">
                {filterOptions.find((opt) => opt.value === filterType)?.label || 'All'}
              </ThemedText>
            </View>
            <Icon
              name={filterMenuVisible ? 'ChevronUp' : 'ChevronDown'}
              size={20}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setSortMenuVisible(!sortMenuVisible);
              setFilterMenuVisible(false);
            }}
            className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl px-3 py-2.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Icon name="Clock" size={20} />
              <ThemedText className="text-sm">
                {sortOptions.find((opt) => opt.value === sortBy)?.label || 'Latest'}
              </ThemedText>
            </View>
            <Icon
              name={sortMenuVisible ? 'ChevronUp' : 'ChevronDown'}
              size={20}
            />
          </Pressable>
        </View>

        {/* Filter Menu */}
        {filterMenuVisible && (
          <View
            className="absolute left-4 right-4 top-32 bg-light-primary dark:bg-dark-primary rounded-2xl overflow-hidden z-50"
            style={shadowPresets.large}
          >
            {filterOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setFilterType(option.value as FilterType);
                  setFilterMenuVisible(false);
                }}
                className="flex-row items-center gap-3 px-3 py-2.5 active:bg-light-secondary dark:active:bg-dark-secondary"
              >
                <Icon name={option.icon as any} size={20} />
                <ThemedText className="text-sm flex-1">{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* Sort Menu */}
        {sortMenuVisible && (
          <View
            className="absolute right-4 top-32 w-[165px] bg-light-primary dark:bg-dark-primary rounded-2xl overflow-hidden z-50"
            style={shadowPresets.large}
          >
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSortBy(option.value as SortBy);
                  setSortMenuVisible(false);
                }}
                className="px-3 py-2.5 active:bg-light-secondary dark:active:bg-dark-secondary"
              >
                <ThemedText className="text-sm">{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Chat History List */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'grid' ? (
          <View>
            {filteredChatHistory.map((item) => renderGridItem(item))}
          </View>
        ) : (
          <View>
            {filteredChatHistory.map((item, index) =>
              renderListItem(item, index === filteredChatHistory.length - 1)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
