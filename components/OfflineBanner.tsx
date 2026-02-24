import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { createStyles, colors, spacing, fontSize } from '@/utils/styles';
import { networkService } from '@/services/network';

const styles = createStyles({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '500' as const,
  },
});

interface OfflineBannerProps {
  visible?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ visible: propVisible }) => {
  const [visible, setVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = networkService.subscribe((isConnected) => {
      setVisible(!isConnected);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const targetValue = (propVisible !== undefined ? propVisible : visible) ? 1 : 0;
    
    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [propVisible, visible, animatedValue]);

  const shouldShow = propVisible !== undefined ? propVisible : visible;

  if (!shouldShow) {
    return null;
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>
          No internet connection. Some features may be limited.
        </Text>
      </View>
    </Animated.View>
  );
};
