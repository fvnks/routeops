import { NextAuthOptions } from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_CLIENT_ID || "",
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET || "",
      issuer: process.env.AUTHENTIK_ISSUER || "",
    }),
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email || user.username,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "authentik" && user) {
        token.id = user.id;
        token.role = "ADMIN";
        token.permissions = []; // Admin has access to everything
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions || [];
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "authentik" && user?.email) {
        // For Authentik, use email as username
        const existingUser = await prisma.user.findUnique({
          where: { username: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              username: user.email,
              email: user.email,
              name: user.name || user.email,
              passwordHash: "",
              role: "ADMIN",
              permissions: [],
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
