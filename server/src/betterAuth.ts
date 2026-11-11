import { betterAuth } from "better-auth";
import { oneTap } from "better-auth/plugins";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins: ["http://localhost:5173"],

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    oneTap({
      clientId: process.env.GOOGLE_CLIENT_ID!,
    }),
  ],
});
