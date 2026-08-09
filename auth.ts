import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { comparePassword, hashPassword } from "./app/server/utils/password";
import Credentials from "next-auth/providers/credentials";
import {
  getUserByEmail,
  createAccount,
} from "./app/server/service/auth.service";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      profile(profile) {
        return { role: profile.role ?? "user", ...profile };
      },
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },

      authorize: async (credentials) => {
        let user = null;
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = credentials.email as string;
        const password = credentials.password as string;

        const pwHash = hashPassword(password);

        user = await getUserByEmail(email);

        if (!user || !comparePassword(password, user.password_hash)) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await getUserByEmail(user.email as string);

          if (!existingUser) {
            await createAccount({
              name: user.name as string,
              email: user.email as string,
              password: "passdummy",
              phone: "",
              role: "CUSTOMER",
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving Google user to DB:", error);
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.phone =
          token.phone && token.phone !== "0" ? String(token.phone) : "";
        session.user.role = (token.role as string) || "";
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Attach basic Google properties first
        token.email = user.email;
        token.name = user.name;

        // Fetch extra custom fields from DB
        const dbUser = await getUserByEmail(user.email as string);
        if (dbUser) {
          token.id = String(dbUser.id ?? "");
          token.phone =
            dbUser.phone && dbUser.phone !== "0" ? dbUser.phone : "";
          token.role = dbUser.role ?? "CUSTOMER";
        } else {
          // Fallback if DB insert hasn't finished yet
          token.phone = "";
          token.role = "";
        }
      }
      if (trigger === "update" && session) {
        const updatedUser = session.user || session;
        if (updatedUser.phone !== undefined) token.phone = updatedUser.phone;
        if (updatedUser.role !== undefined) token.role = updatedUser.role;
      }
      return token;
    },
  },
});
