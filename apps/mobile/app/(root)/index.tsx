// apps/mobile/app/(root)/index.tsx
import { View, Text } from "react-native";
import { Button } from "@repo/ui";
import useAuthStore from "@repo/store/auth.store";

export default function Home() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    console.log("👉 Logout button pressed"); // log before store call
    await logout();
    console.log("✅ Logout finished"); // log after store call
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Home</Text>
      <Button onPress={handleLogout}>Logout</Button>
    </View>
  );
}
