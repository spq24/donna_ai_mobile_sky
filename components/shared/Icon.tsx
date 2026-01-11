// Force cache clear 12345
import React from 'react';
import { View, Pressable } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useThemeColors } from '@/contexts/ThemeColors';

const Icon = ({ name, size = 24, color, style = {}, onPress, disabled }: any) => {
  const colors = useThemeColors();

  // @ts-ignore
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    if (__DEV__) {
      console.warn(`Icon "${name}" not found in LucideIcons`);
    }
    return <View style={[{ width: size, height: size }, style]} />;
  }

  const content = (
    <View style={style}>
      <IconComponent size={size} color={color || colors.text} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {content}
      </Pressable>
    );
  }

  return content;
};

Icon.displayName = 'Icon';

export default Icon;
