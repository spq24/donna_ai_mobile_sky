// components/shared/ThemedText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

export default function ThemedText({ children, className, ...props }: ThemedTextProps) {
  return (
    <Text
      className={`text-foreground dark:text-darkForeground ${className || ''}`}
      {...props}
    >
      {children}
    </Text>
  );
}
