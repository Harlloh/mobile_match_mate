import { Tabs } from 'expo-router';
import React from 'react';

import CustomHeader from '@/components/customHeader';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981', // Active tab color (green)
        tabBarInactiveTintColor: '#6b7280', // Inactive tab color (gray)
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#10b981',
          borderTopWidth: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          header: () => <CustomHeader title='Matchmate' />,
          headerShown: true,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name='matches' options={{
        header: () => <CustomHeader title='Matches' />,
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='calendar' color={color} />
      }}
      />
      <Tabs.Screen name='favourites' options={{
        header: () => <CustomHeader title='Favourites' />,
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='heart' color={color} />
      }}
      />
      <Tabs.Screen name='profile' options={{
        title: 'Profile',
        headerShown: false,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='person.circle.fill' color={color} />
      }}
      />
    </Tabs>
  );
}
