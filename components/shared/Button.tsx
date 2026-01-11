import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Icon from './Icon';
import ThemedText from './ThemedText';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  iconStart?: string;
  iconEnd?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  textClassName = '',
  disabled = false,
  iconStart,
  iconEnd,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black dark:bg-white';
      case 'secondary':
        return 'bg-light-secondary dark:bg-dark-secondary';
      case 'outline':
        return 'border border-black dark:border-white bg-transparent';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-black dark:bg-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'medium':
        return 'py-3 px-6';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  const getTextColorClasses = () => {
    if (variant === 'primary') {
      return 'text-white dark:text-black';
    }
    return 'text-black dark:text-white';
  };

  const getIconColor = () => {
    if (variant === 'primary') {
      return undefined; // Will let Icon use its default color based on context if needed
    }
    return undefined;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl flex-row items-center justify-center ${getVariantClasses()} ${getSizeClasses()} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#000000'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {iconStart && (
            <Icon
              name={iconStart}
              size={size === 'large' ? 20 : 18}
              className={`mr-2`}
              color={variant === 'primary' ? (undefined) : undefined}
            />
          )}
          {title && (
            <ThemedText
              className={`font-semibold ${getTextColorClasses()} ${textClassName}`}
            >
              {title}
            </ThemedText>
          )}
          {iconEnd && (
            <Icon
              name={iconEnd}
              size={size === 'large' ? 20 : 18}
              className={`ml-2`}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

export default Button;

