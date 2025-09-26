import { View, Text, Button } from "react-native";
import useAuthStore from "@repo/store/auth.store";

export default function Profile() {
  const { logout } = useAuthStore();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl">Profile</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
