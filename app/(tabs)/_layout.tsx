import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { networkService } from '@/services/network';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setOfflineStatus } from '@/store/slices/appSlice';
import { initializeAuthAsync } from '@/store/slices/authSlice';
import { loadBookmarksAsync, loadCoursesAsync } from '@/store/slices/coursesSlice';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize app data
    const initializeApp = async () => {
      try {
        // Initialize authentication
        await dispatch(initializeAuthAsync()).unwrap();
        
        // Load courses and bookmarks
        await Promise.all([
          dispatch(loadCoursesAsync()).unwrap(),
          dispatch(loadBookmarksAsync()).unwrap(),
        ]);

        // Set up network monitoring
        const unsubscribeNetwork = networkService.subscribe((isConnected) => {
          dispatch(setOfflineStatus(!isConnected));
        });

        return unsubscribeNetwork;
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    const unsubscribe = initializeApp();
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null; // Show loading screen
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
