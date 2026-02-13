import React from 'react';
import { Image, Pressable, View, Text, ViewStyle, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import ThemedText from './ThemedText';

type AvatarProps = {
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  src?: string | ImageSourcePropType;
  name?: string;
  email?: string;
  border?: boolean;
  bgColor?: string;
  onPress?: () => void;
  link?: string;
  className?: string
  style?: ViewStyle;
};

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  src,
  name,
  email,
  border = false,
  bgColor = 'bg-muted dark:bg-darkMuted',
  onPress,
  link,
  className,
  style,
}) => {
  const sizeMap = {
    xxs: 'w-7 h-7',
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    xxl: 'w-24 h-24',
  };

  const borderStyle = border ? 'border-2 border-border dark:border-darkBorder' : '';

  const getInitials = (): string => {
    const trimmed = (name ?? '').trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      const local = email.split('@')[0];
      if (local) return local.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const renderInitials = () => {
    return <ThemedText className=" font-medium text-center">{getInitials()}</ThemedText>;
  };

  const getImageSource = (): ImageSourcePropType => {
    if (!src) {
      return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };
    }

    if (typeof src === 'string') {
      return { uri: src };
    }

    return src;
  };

  const avatarContent = (
    <View
      className={`rounded-full flex-shrink-0 ${bgColor} ${sizeMap[size]} ${borderStyle} items-center justify-center ${className}`}
      style={style}
     >
      {src ? (
        <Image
          source={getImageSource()}
          className="rounded-full w-full h-full object-cover"
        />
      ) : (
        renderInitials()
      )}
    </View>
  );

  if (link) {
    return <Pressable onPress={() => router.push(link)}>{avatarContent}</Pressable>;
  }

  return onPress ? (
    <Pressable onPress={onPress}>{avatarContent}</Pressable>
  ) : (
    avatarContent
  );
};

export default Avatar;

