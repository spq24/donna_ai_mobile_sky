import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps, View, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface ThemeScrollerProps extends ScrollViewProps {
  children: React.ReactNode;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | any;
  contentContainerStyle?: any;
  scrollEventThrottle?: number;
  headerSpace?: boolean;
}

function ThemedScrollerInner(
  {
    children,
    className,
    onScroll,
    contentContainerStyle,
    scrollEventThrottle = 16,
    headerSpace = false,
    ...props
  }: ThemeScrollerProps,
  ref: React.Ref<ScrollView>
) {
  return (
    <ScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      style={{ width: "100%" }}
      bounces={false}
      overScrollMode='never'
      className={`bg-light-primary dark:bg-dark-primary flex-1 px-global ${className || ''}`}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={[
        headerSpace && { paddingTop: 70 },
        contentContainerStyle
      ]}
      {...props}
    >
      {children}
      <View className="h-20 w-full" />
    </ScrollView>
  );
}

const ThemedScroller = forwardRef(ThemedScrollerInner) as React.ForwardRefExoticComponent<
  ThemeScrollerProps & React.RefAttributes<ScrollView>
>;

ThemedScroller.displayName = 'ThemedScroller';

export default ThemedScroller;

export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
