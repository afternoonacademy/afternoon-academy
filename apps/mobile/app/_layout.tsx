import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import useAuthStore from "@repo/store/auth.store";


SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AppLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    QuicksandBold: require("../assets/fonts/Quicksand-Bold.ttf"),
    QuicksandMedium: require("../assets/fonts/Quicksand-Medium.ttf"),
    QuicksandRegular: require("../assets/fonts/Quicksand-Regular.ttf"),
    QuicksandSemiBold: require("../assets/fonts/Quicksand-SemiBold.ttf"),
    QuicksandLight: require("../assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isLoading, error]);

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
