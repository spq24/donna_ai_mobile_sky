import React, { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import ImageAttachment from './ImageAttachment';
import FileAttachment from './FileAttachment';
import { MentionInput } from './mentions';
import useThemeColors from '@/contexts/ThemeColors';

interface AttachedImage {
  uri: string;
  fileName?: string;
}

interface AttachedFile {
  uri: string;
  fileName: string;
  fileType?: string;
}

interface ExpandableChatInputProps {
  placeholder?: string;
  onPlusPress?: () => void;
  onMicPress?: () => void;
  onSettingsPress?: () => void;
  onSendPress?: (text: string, mentionedUserIds?: number[]) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  attachedImages?: AttachedImage[];
  attachedFiles?: AttachedFile[];
  onRemoveImage?: (index: number) => void;
  onRemoveFile?: (index: number) => void;
  imageMode?: boolean;
  enableMentions?: boolean;
}

export default function ExpandableChatInput({
  placeholder = 'Ask AI anything',
  onPlusPress,
  onMicPress,
  onSettingsPress,
  onSendPress,
  value,
  onChangeText,
  attachedImages = [],
  attachedFiles = [],
  onRemoveImage,
  onRemoveFile,
  imageMode = false,
  enableMentions = true,
}: ExpandableChatInputProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [inputText, setInputText] = useState(value || '');
  const [inputHeight, setInputHeight] = useState(20);
  const [mentionedUserIds, setMentionedUserIds] = useState<number[]>([]);

  const handleChangeText = (text: string) => {
    setInputText(text);
    onChangeText?.(text);
  };

  const handleMentionChange = (text: string, userIds: number[]) => {
    setInputText(text);
    setMentionedUserIds(userIds);
    onChangeText?.(text);
  };

  const handleSend = () => {
    if (inputText.trim() && onSendPress) {
      onSendPress(inputText.trim(), mentionedUserIds.length > 0 ? mentionedUserIds : undefined);
      setInputText('');
      setMentionedUserIds([]);
      onChangeText?.('');
    }
  };

  const hasText = inputText.trim().length > 0;

  const displayPlaceholder = imageMode ? 'Describe your images' : placeholder;
  const hasAttachments = attachedImages.length > 0 || attachedFiles.length > 0;

  return (
    <View className="px-4 pb-2" style={styles.outerContainer}>
      <View
        className="bg-light-primary dark:bg-dark-primary border border-light-secondary dark:border-dark-secondary rounded-2xl"
        style={styles.inputWrapper}
      >
        {/* Attached Files and Images Preview */}
        {hasAttachments && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-2 pt-2"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {attachedImages.map((img, index) => (
              <ImageAttachment
                key={`img-${index}`}
                uri={img.uri}
                fileName={img.fileName}
                showFileName={!!img.fileName}
                size={img.fileName ? 'medium' : 'small'}
                onRemove={() => onRemoveImage?.(index)}
              />
            ))}
            {attachedFiles.map((file, index) => (
              <FileAttachment
                key={`file-${index}`}
                fileName={file.fileName}
                fileType={file.fileType}
                onRemove={() => onRemoveFile?.(index)}
              />
            ))}
          </ScrollView>
        )}

        {/* Input Text */}
        <View className="px-2 pt-4" style={styles.inputContainer}>
          {enableMentions ? (
            <MentionInput
              value={inputText}
              onChange={handleMentionChange}
              placeholder={displayPlaceholder}
              multiline
              style={[
                styles.mentionInput,
                {
                  minHeight: 20,
                  maxHeight: 180,
                  color: colors.text,
                },
              ]}
            />
          ) : (
            <TextInput
              value={inputText}
              onChangeText={handleChangeText}
              multiline
              className="text-sm text-light-text dark:text-dark-text min-h-[20px] max-h-[180px]"
              placeholder={displayPlaceholder}
              placeholderTextColor={colors.placeholder}
              style={{
                minHeight: 20,
                maxHeight: 180,
                height: Math.max(20, inputHeight),
              }}
              onContentSizeChange={(event) => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
            />
          )}
        </View>

        {/* Input Row */}
        <View className="flex-row items-center gap-3 px-2 pb-2">
          {/* Plus Button */}
          <Pressable
            onPress={onPlusPress}
            className="w-9 h-9 rounded-full border border-light-secondary dark:border-dark-secondary items-center justify-center bg-light-primary dark:bg-dark-primary"
          >
            <Icon name="Plus" size={20} />
          </Pressable>

          {/* Image Button (when in image mode) */}
          {imageMode && (
            <Pressable
              onPress={() => {
                // Handle image picker
                console.log('Open image picker');
              }}
              className="h-7 px-3 rounded-lg bg-light-secondary dark:bg-dark-secondary flex-row items-center gap-2"
            >
              <Icon name="Image" size={14} />
              <Pressable
                onPress={() => {
                  // Remove image mode
                  console.log('Remove image mode');
                }}
                className="w-5 h-5 items-center justify-center"
              >
                <Icon name="X" size={12} />
              </Pressable>
            </Pressable>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Microphone Button */}
          <Pressable
            onPress={onMicPress}
            className="w-9 h-9 rounded-full border border-light-secondary dark:border-dark-secondary items-center justify-center bg-light-primary dark:bg-dark-primary"
          >
            <Icon name="Mic" size={20} />
          </Pressable>

          {/* Settings Button (only in image mode) */}
          {imageMode && onSettingsPress && (
            <Pressable
              onPress={onSettingsPress}
              className="w-9 h-9 rounded-full border border-light-secondary dark:border-dark-secondary items-center justify-center bg-light-primary dark:bg-dark-primary"
            >
              <Icon name="Settings" size={20} />
            </Pressable>
          )}

          {/* Send Button */}
          <Pressable
            onPress={handleSend}
            className="w-9 h-9 rounded-full items-center justify-center bg-dark-primary dark:bg-light-primary"
          >
            <Icon name="ArrowUp" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Home Indicator */}
      <View
        className="h-8.5 items-center justify-end"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className="w-33.5 h-1.25 rounded-full bg-dark-primary dark:bg-light-primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 9999,
  },
  inputWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    // Don't use overflow: hidden - it clips the dropdown
  },
  inputContainer: {
    zIndex: 1000,
    position: 'relative',
  },
  mentionInput: {
    fontSize: 14,
    minHeight: 20,
    maxHeight: 180,
  },
});

