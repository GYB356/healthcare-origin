import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../utils/auth";
import { getUserByEmail } from "../../../utils/db";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          const user = await getUserByEmail(credentials.email);
          
          if (!user) {
            throw new Error('No user found');
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          
          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Verify role matches
          if (user.role !== credentials.role) {
            throw new Error('Invalid role');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 