import "dotenv/config";
import path from "path";
import dotenv from "dotenv";

// ✅ Load root shared env first (for Supabase keys etc.)
dotenv.config({ path: path.resolve(__dirname, "../../.env.shared") });

// ✅ Then load app-specific .env (overrides if needed)
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    scheme: "mobile",
    entryPoint: "expo-router/entry",

    ios: {
      bundleIdentifier: "com.afternoon-academy.mobile",
      associatedDomains: ["applinks:snpmvvisvnrodeumewpe.supabase.co"],
    },

    android: {
      package: "com.afternoon-academy.mobile",
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "mobile", host: "*" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },

    // 🟢 This will be injected into your runtime
    extra: {
      // Web-safe client values (public)
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
      // You can add other app-specific config here if needed
    },
  },
};
