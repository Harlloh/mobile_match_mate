import { Tabs } from 'expo-router';
import React from 'react';

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
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name='matches' options={{
        title: 'Matches',
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='calendar' color={color} />
      }}
      />
      <Tabs.Screen name='favourites' options={{
        title: 'Favourites',
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='heart' color={color} />
      }}
      />
      <Tabs.Screen name='profile' options={{
        title: 'Profile',
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name='person.circle.fill' color={color} />
      }}
      />
    </Tabs>
  );
}
