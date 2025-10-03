import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ⚡ Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.warn('Theme preload failed', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "0.5rem",
                padding: "12px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
              },
              success: { style: { backgroundColor: "#16a34a", color: "#fff" } },
              error: { style: { backgroundColor: "#dc2626", color: "#fff" } },
              loading: { style: { backgroundColor: "#2563eb", color: "#fff" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
