import React, { useEffect, useRef } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager, ViewStyle } from 'react-native';
import { CardMode } from '@/types/generative-ui';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CardAnimationWrapperProps {
  children: React.ReactNode;
  mode: CardMode;
  index?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Wrapper component that provides smooth animations for card mode transitions
 * and staggered entry animations for multiple cards.
 */
export function CardAnimationWrapper({
  children,
  mode,
  index = 0,
  className,
  style,
}: CardAnimationWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const prevMode = useRef<CardMode>(mode);

  // Staggered entry animation
  useEffect(() => {
    const delay = index * 50; // 50ms stagger between cards
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Mode transition animation
  useEffect(() => {
    if (prevMode.current !== mode) {
      // Configure layout animation for height changes
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });

      // Cross-fade for content changes
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      prevMode.current = mode;
    }
  }, [mode]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default CardAnimationWrapper;
