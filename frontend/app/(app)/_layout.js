import { Stack } from 'expo-router';
import colors from '../../src/constants/colors';

/**
 * App Layout Stack Router
 * Controls transition animations between the Bottom Tab Navigation group and the details screen.
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, presentation: 'card' }} />
    </Stack>
  );
}
