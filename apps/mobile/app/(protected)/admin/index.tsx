import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import useAuthStore from "@repo/store/auth.store";

export default function AdminHome() {
  const { logout } = useAuthStore();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-6">🛠 Admin Dashboard</Text>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/sign-in");
        }}
        className="bg-red-500 px-4 py-2 rounded"
      >
        <Text className="text-white font-semibold">🚪 Log Out</Text>
      </Pressable>
    </View>
  );
}
