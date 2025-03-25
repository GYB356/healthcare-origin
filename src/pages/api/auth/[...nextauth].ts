import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '../../../utils/auth';
import { getUserByEmail } from '../../../utils/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await getUserByEmail(credentials.email);
          
          if (!user) {
            console.error("No user found for email:", credentials.email);
            throw new Error("Invalid credentials");
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          
          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            throw new Error("Invalid credentials");
          }

          if (user.role !== credentials.role) {
            console.error("Invalid role for user:", credentials.email);
            throw new Error("Invalid role");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/login'
  },
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}); 