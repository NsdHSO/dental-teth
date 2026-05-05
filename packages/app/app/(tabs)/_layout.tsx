import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useUserProfileGate } from '@/features/user-profile';
import {
  Colors,
  CustomTabBar,
  IconSymbol,
  useColorScheme,
} from '@yuhuu/components';

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { ready } = useUserProfileGate();

  return (
    <>
      <Tabs
        initialRouteName='index'
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            tabBarLabel: t('tabs.home'),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='house.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='appointments'
          options={{
            tabBarLabel: t('tabs.appointments'),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='calendar' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='patients'
          options={{
            tabBarLabel: t('tabs.patients', 'Patients'),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='person.2.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='dentists'
          options={{
            tabBarLabel: t('tabs.dentists', 'Dentists'),

            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='stethoscope' color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
