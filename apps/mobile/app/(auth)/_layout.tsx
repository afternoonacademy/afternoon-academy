import { Redirect, Stack } from "expo-router";
import useAuthStore from "@repo/store/auth.store";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/" />; // ✅ logged in → always go home
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
    </Stack>
  );
}
