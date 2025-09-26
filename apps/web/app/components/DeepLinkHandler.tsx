"use client";

import { useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";

export default function DeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      console.log("🔗 [DeepLinkHandler] Got deep link:", url);

      if (!(url.includes("#access_token") || url.includes("code="))) {
        return;
      }

      const cleaned = url.replace("#", "?");
      try {
        if (url.includes("access_token")) {
          const qp = Linking.parse(cleaned).queryParams || {};
          console.log("➡️ [DeepLinkHandler] Using setSession", qp);

          const { error } = await supabase.auth.setSession({
            access_token: qp.access_token as string,
            refresh_token: qp.refresh_token as string,
          });
          if (error) throw error;
        } else {
          console.log("➡️ [DeepLinkHandler] Using exchangeCodeForSession");
          const { error } = await supabase.auth.exchangeCodeForSession(cleaned);
          if (error) throw error;
        }

        await useAuthStore.getState().fetchAuthenticatedUser(true);
      } catch (err) {
        console.error("❌ [DeepLinkHandler] Auth error:", err);
      }
    };

    const sub = Linking.addEventListener("url", handleUrl);
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleUrl({ url: initialUrl });
    })();

    return () => sub.remove();
  }, []);

  return null;
}
