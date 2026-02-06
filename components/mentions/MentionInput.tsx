import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import {
  useMentions,
  TriggersConfig,
  SuggestionsProvidedProps,
} from 'react-native-controlled-mentions';
import { apiClient } from '@/lib/api-client';
import type { MentionUser } from '@/types/mention';
import { convertToOriginalFormat, convertToLibraryFormat, parseMentions } from '@/types/mention';
import { useThemeColors } from '@/contexts/ThemeColors';

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentionedUserIds: number[]) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  editable?: boolean;
}

// Helper functions
function getInitials(user: MentionUser): string {
  if (user.full_name) {
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.full_name.substring(0, 2).toUpperCase();
  }
  return user.email.substring(0, 2).toUpperCase();
}

function getDisplayName(user: MentionUser): string {
  return user.full_name || user.email.split('@')[0];
}


// Suggestions component
interface SuggestionsProps extends SuggestionsProvidedProps {
  users: MentionUser[];
  isLoading: boolean;
  colors: ReturnType<typeof useThemeColors>;
}

function Suggestions({ keyword, onSelect, users, isLoading, colors }: SuggestionsProps) {
  if (keyword == null) {
    return null;
  }

  const filteredUsers = useMemo(() => {
    const searchLower = keyword.toLowerCase();
    return users.filter(user => {
      const name = (user.full_name || '').toLowerCase();
      const email = user.email.toLowerCase();
      if (searchLower === '') return true;
      return name.includes(searchLower) || email.includes(searchLower);
    }).slice(0, 5);
  }, [keyword, users]);

  if (isLoading) {
    return (
      <View style={[styles.dropdown, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.placeholder }}>Loading users...</Text>
        </View>
      </View>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <View style={[styles.dropdown, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.placeholder }}>No users found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.dropdown, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={styles.userList}
      >
        {filteredUsers.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[styles.userItem, { backgroundColor: colors.secondary }]}
            onPress={() => onSelect({ id: item.id.toString(), name: getDisplayName(item) })}
            activeOpacity={0.7}
          >
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.userAvatar} />
            ) : (
              <View style={[styles.userAvatarFallback, { backgroundColor: colors.highlight + '30' }]}>
                <Text style={[styles.userAvatarText, { color: colors.highlight }]}>
                  {getInitials(item)}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {getDisplayName(item)}
              </Text>
              <Text style={[styles.userEmail, { color: colors.placeholder }]} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function MentionInput({
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  multiline = true,
  numberOfLines = 3,
  style,
  editable = true,
}: MentionInputProps) {
  const colors = useThemeColors();
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users for mentions on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await apiClient.accounts.getUsersForMentions();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users for mentions:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Configure triggers - must be memoized or static to avoid re-renders
  const triggersConfig: TriggersConfig<'mention'> = useMemo(() => ({
    mention: {
      trigger: '@',
      textStyle: {
        fontWeight: 'bold',
        color: '#0EA5E9', // Highlight color for mentions
      },
      isInsertSpaceAfterMention: true,
    },
  }), []);

  // Convert incoming value from original format to library format for display
  const libraryValue = useMemo(() => convertToLibraryFormat(value), [value]);

  // Handle value changes - convert back to original format and notify parent
  const handleChange = useCallback((newValue: string) => {
    // Convert from library format {@}[Name](id) to original format @[Name](id)
    const originalValue = convertToOriginalFormat(newValue);
    const mentionIds = parseMentions(originalValue);
    onChange(originalValue, mentionIds);
  }, [onChange]);

  // Use the mentions hook with library format value
  const { textInputProps, triggers } = useMentions({
    value: libraryValue,
    onChange: handleChange,
    triggersConfig,
  });

  return (
    <View style={styles.container}>
      {/* Suggestions dropdown - positioned above the input */}
      <Suggestions
        {...triggers.mention}
        users={users}
        isLoading={isLoadingUsers}
        colors={colors}
      />

      <TextInput
        {...textInputProps}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        textAlignVertical="top"
        style={[
          styles.input,
          {
            color: colors.text,
            minHeight: multiline ? Math.max(20, numberOfLines * 20) : undefined,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10000,
    elevation: 1000,
  },
  input: {
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
    // No border/background - parent component provides styling
  },
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    left: -8,
    right: -8,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 99999,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  userList: {
    maxHeight: 200,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
});

export { getInitials, getDisplayName };
