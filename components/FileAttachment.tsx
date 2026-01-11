import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface FileAttachmentProps {
  fileName: string;
  fileType?: string;
  onRemove: () => void;
}

export default function FileAttachment({
  fileName,
  fileType = 'File',
  onRemove,
}: FileAttachmentProps) {
  return (
    <View
      className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-xl px-3 py-2 flex-row items-center gap-3 flex-1 min-w-[191] max-w-[275]"
      style={shadowPresets.medium}
    >
      <View className="w-12 h-12 rounded-lg bg-light-primary dark:bg-dark-primary items-center justify-center flex-shrink-0">
        <Icon name="File" size={20} />
      </View>
      <View className="flex-1 min-w-0">
        <ThemedText className="text-sm font-medium" numberOfLines={1}>
          {fileName}
        </ThemedText>
        <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
          {fileType}
        </ThemedText>
      </View>
      <Pressable onPress={onRemove} className="w-5 h-5 items-center justify-center flex-shrink-0">
        <Icon name="X" size={12} />
      </Pressable>
    </View>
  );
}

