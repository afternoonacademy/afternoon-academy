import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">👋 Welcome to Afternoon Academy</Text>

      {/* Parent */}
      <Pressable
        onPress={() => router.push("/sign-up?role=parent")}
        className="w-full bg-blue-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">Join as Parent</Text>
      </Pressable>

      {/* Student */}
      <Pressable
        onPress={() => router.push("/sign-up?role=student")}
        className="w-full bg-green-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">Join as Student</Text>
      </Pressable>

      {/* Teacher */}
      <Pressable
        onPress={() => router.push("/sign-up?role=teacher")}
        className="w-full bg-purple-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">Join as Teacher</Text>
      </Pressable>

      {/* Sign In */}
      <Pressable onPress={() => router.push("/sign-in")}>
        <Text className="text-blue-600 font-medium">
          Already have an account? Sign In
        </Text>
      </Pressable>
    </View>
  );
}
