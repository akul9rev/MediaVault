import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  View 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import colors from '../constants/colors';

/**
 * Reusable Screen Wrapper Component
 * Provides Safe Area support, Dark Theme Background, and Keyboard Avoiding features.
 */
export const ScreenWrapper = ({ 
  children, 
  style, 
  contentContainerStyle,
  scrollable = false, 
  keyboardOffset = 0 
}) => {
  const Container = scrollable ? ScrollView : View;
  
  let finalStyle = style;
  let finalContentStyle = contentContainerStyle;
  
  if (scrollable && style) {
    const flatStyle = StyleSheet.flatten(style);
    const containerStyle = {};
    const contentStyle = {};
    
    // Properties that MUST go to ScrollView style (container-only styles)
    const containerKeys = [
      'flex', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
      'backgroundColor', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
      'marginVertical', 'marginHorizontal', 'position', 'top', 'bottom', 'left', 'right',
      'opacity', 'overflow', 'borderRadius', 'borderWidth', 'borderColor', 'borderStyle',
      'elevation', 'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius'
    ];
    
    Object.keys(flatStyle).forEach(key => {
      if (containerKeys.includes(key)) {
        containerStyle[key] = flatStyle[key];
      } else {
        contentStyle[key] = flatStyle[key];
      }
    });
    
    finalStyle = [styles.container, containerStyle];
    finalContentStyle = [styles.scrollContent, contentStyle, contentContainerStyle];
  } else if (!scrollable) {
    finalStyle = [styles.container, style];
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : keyboardOffset}
      >
        <Container 
          style={finalStyle} 
          contentContainerStyle={scrollable ? finalContentStyle : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardAvoid: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  }
});

export default ScreenWrapper;
