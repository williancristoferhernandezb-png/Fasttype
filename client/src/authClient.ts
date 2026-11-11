import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    oneTapClient({
      clientId: GOOGLE_CLIENT_ID,
      autoSelect: true,
      cancelOnTapOutside: true,
      context: "signin",
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 3,
        fedCM: true,
      },
    }),
  ],
});
