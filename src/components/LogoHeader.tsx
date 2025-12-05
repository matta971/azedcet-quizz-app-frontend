import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface LogoHeaderProps {
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export function LogoHeader({ style, size = 'medium' }: LogoHeaderProps) {
  const logoHeight = size === 'small' ? 24 : size === 'medium' ? 32 : 40;
  const aspectRatio = 4.5; // Logo is approximately 4.5x wider than tall

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/mindsoccer-logo.png')}
        style={[
          styles.logo,
          { height: logoHeight, width: logoHeight * aspectRatio }
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    // Dimensions set dynamically based on size prop
  },
});
