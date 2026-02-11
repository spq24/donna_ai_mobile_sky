import React, { useState } from 'react';
import { View, TextInput, Pressable, TextInputProps } from 'react-native';
import Icon from './Icon';
import ThemedText from './ThemedText';
import useThemeColors from '@/contexts/ThemeColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  containerClassName = '',
  ...props
}) => {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-6 ${containerClassName}`}>
      {label && (
        <ThemedText className="text-sm font-medium mb-2 opacity-70">
          {label}
        </ThemedText>
      )}
      <View
        className={`flex-row items-center border-b ${
          error ? 'border-red-500' : isFocused ? 'border-foreground dark:border-darkForeground' : 'border-border dark:border-darkBorder'
        } pb-2`}
      >
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.placeholder}
          className={`flex-1 text-base text-foreground dark:text-darkForeground ${props.className || ''}`}
          style={[{ color: colors.foreground }, props.style]}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2">
            <Icon
              name={showPassword ? 'EyeOff' : 'Eye'}
              size={20}
              color={colors.foreground}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <ThemedText className="text-xs text-red-500 mt-1">
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default Input;

