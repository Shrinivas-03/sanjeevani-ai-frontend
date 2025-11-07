import React from 'react';
import { Platform, View } from 'react-native';

export default function WebLayout({ children }: { children?: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return children as React.ReactElement;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}