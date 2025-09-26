import { View, Text } from "react-native";

export default function CheckEmailScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-lg font-semibold mb-4">📩 Check your inbox</Text>
      <Text className="text-center text-gray-600">
        We’ve sent you a confirmation link.{"\n"}
        Please check your email and click the link to continue.
      </Text>
    </View>
  );
}
