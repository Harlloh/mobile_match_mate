import { Tabs } from 'expo-router';
import React from 'react';

import CustomHeader from '@/components/customHeader';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981', // Active tab color (green)
        tabBarInactiveTintColor: '#6b7280', // Inactive tab color (gray)
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#10b981',
          borderTopWidth: 1,
        },
      }}>
      {/* HOME SCREEN */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          header: () => <CustomHeader title='FC Pulse' />,
          headerShown: true,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* LEAGUES */}
      <Tabs.Screen name='leagues' options={{
        title: 'Leagues',
        header: () => <CustomHeader title='Leagues' />,
        headerShown: true,
        tabBarIcon: ({ color }) => {
          return Platform.OS === 'ios' ? <IconSymbol size={28} name='trophy' color={color} /> : <FontAwesome5 size={22} name='trophy' color={color} />
        }
      }}
      />

      {/* MATCHES */}
      <Tabs.Screen name='matches' options={{
        title: 'Matches',
        header: () => <CustomHeader title='Matches' />,
        headerShown: true,
        tabBarIcon: ({ color }) => {
          return Platform.OS === 'ios' ? <IconSymbol size={28} name='calendar' color={color} /> : <FontAwesome5 size={22} name='calendar-alt' color={color} />
        }
      }}
      />
      {/* MY LISTS */}
      <Tabs.Screen name='favourites' options={{
        title: 'My Lists',
        header: () => <CustomHeader title='My Lists' />,
        headerShown: true,
        tabBarIcon: ({ color }) => {
          return Platform.OS === 'ios' ? <IconSymbol size={28} name='heart' color={color} /> : <FontAwesome5 size={22} name='heart' color={color} />
        }
      }}
      />



      {/* PROFILE */}
      <Tabs.Screen name='profile' options={{
        title: 'Profile',
        header: () => <CustomHeader title='Profile' />,
        headerShown: true,
        tabBarIcon: ({ color }) => {
          return Platform.OS === 'ios' ? <IconSymbol size={28} name='person.circle.fill' color={color} /> : <FontAwesome5 size={22} name='user' color={color} />
        }
      }}
      />
      {/* <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
          header: () => <CustomHeader title='Notifications' />,
          headerShown: true,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell" color={color} />,
        }}
      /> */}




    </Tabs>
  );
}
