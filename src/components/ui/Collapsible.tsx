import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, LayoutChangeEvent, ViewStyle } from 'react-native';

interface CollapsibleProps {
  children: React.ReactNode;
  collapsed: boolean;
  style?: ViewStyle;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  collapsed,
  style,
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (collapsed) {
      // Collapse animation
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Expand animation
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: contentHeight,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 250,
          delay: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [collapsed, contentHeight]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
      if (!collapsed) {
        animatedHeight.setValue(height);
        animatedOpacity.setValue(1);
      }
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          height: animatedHeight,
          opacity: animatedOpacity,
          overflow: 'hidden',
        },
      ]}
    >
      <View onLayout={handleLayout}>{children}</View>
    </Animated.View>
  );
};
