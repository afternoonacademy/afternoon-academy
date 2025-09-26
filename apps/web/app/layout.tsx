import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  console.log("🟢 RootLayout rendered");

  return (
    <html lang="en">
      <head />
      <body>
        {children}

        {/* 🔔 Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937", // Tailwind gray-800
              color: "#fff",
              borderRadius: "0.5rem",
              padding: "12px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            success: {
              style: {
                background: "#16a34a", // Tailwind green-600
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#16a34a",
              },
            },
            error: {
              style: {
                background: "#dc2626", // Tailwind red-600
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#dc2626",
              },
            },
            loading: {
              style: {
                background: "#2563eb", // Tailwind blue-600
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#2563eb",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
