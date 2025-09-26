import { Redirect, Stack } from "expo-router";
import useAuthStore from "@repo/store/auth.store";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />; // ✅ logged out → force to sign-in
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      {/* add other root routes here */}
    </Stack>
  );
}
