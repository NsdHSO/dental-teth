import { useCallback, useRef } from "react";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useAuth } from "@/providers/AuthProvider";
import { hasRole } from "@yuhuu/auth";
import {
  GlassBackground,
  HelloWave,
  SettingsPanel,
  TabScreenWrapper,
  ThemedText,
  UserAvatar,
} from "@yuhuu/components";

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const settingsRef = useRef<BottomSheetModal>(null);

  const isMember = hasRole("Member");
  if (isMember) return <Redirect href="/" />;

  const handleAvatarPress = useCallback(() => {
    // Android New Architecture fix — wait for interactions before presenting
    // (mirrors the pattern used in GenderPicker).
    if (Platform.OS === "android") {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          settingsRef.current?.present();
        });
      });
    } else {
      settingsRef.current?.present();
    }
  }, []);

  return (
    <GlassBackground>
      <TabScreenWrapper contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="title" className="mb-2">
              {t("home.welcome", { name: user?.name ?? user?.email ?? "" })}{" "}
              <HelloWave />
            </ThemedText>
            <ThemedText type="subtitle" className="mb-1">
              {t("home.welcomeMessage")}
            </ThemedText>
          </View>
          <UserAvatar
            name={user?.name}
            email={user?.email}
            size={58}
            onPress={handleAvatarPress}
            accessibilityLabel={t("profile.settings")}
            testID="home-avatar"
          />
        </View>

        <ThemedText leading="relaxed" className="mb-6">
          {t("home.encouragement")}
        </ThemedText>

        <SettingsPanel ref={settingsRef} testID="home-settings" />

        <Pressable
          onPress={signOut}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            backgroundColor: "#ef4444",
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: "center",
            width: 120,
            marginTop: 16,
          })}
        >
          <ThemedText
            style={{
              color: "white",
              fontWeight: "600",
            }}
          >
            {t("home.signOut")}
          </ThemedText>
        </Pressable>
      </TabScreenWrapper>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
});
