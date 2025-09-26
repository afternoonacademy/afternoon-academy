// packages/lib/appwrite.ts
// ✅ Universal entrypoint for web vs native

// @ts-ignore: handled by bundler condition
export * from "./appwrite.web";

// For React Native builds, Metro bundler will pick up appwrite.native.ts
// Ensure your package.json has correct "exports" or "react-native" field
