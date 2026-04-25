import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { useBootstrapGate } from "@/features/bootstrap/api";
import {
    Colors,
    CustomTabBar,
    IconSymbol,
    useColorScheme,
} from "@yuhuu/components";

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const ready = useBootstrapGate();

  return (
    <>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}