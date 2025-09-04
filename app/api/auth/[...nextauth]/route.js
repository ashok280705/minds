import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDoctor: { label: "Doctor Login", type: "text" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          let account;

          if (credentials.isDoctor === "true") {
            account = await Doctor.findOne({ email: credentials.email });
          } else {
            account = await User.findOne({ email: credentials.email });
          }

          if (!account) throw new Error("No account found");
          if (!account.password) throw new Error("Password is required");
          if (!credentials.password) throw new Error("Password is required");

          const isValid = await bcrypt.compare(
            credentials.password,
            account.password
          );
          if (!isValid) throw new Error("Invalid password");

          return {
            id: account._id.toString(),
            name: account.name,
            email: account.email,
            isDoctor: credentials.isDoctor === "true",
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              googleId: profile?.sub,
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return true; // Allow sign in even if DB fails
      }
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isDoctor = token.isDoctor || false;
      session.user.googleId = token.googleId || null; // ✅ Add Google ID!
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id || token.id;
        token.isDoctor = user.isDoctor || false;
        if (profile?.sub) {
          token.googleId = profile.sub; // ✅ Save Google ID!
        }
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  
  // Add error handling
  events: {
    async error(message) {
      console.error('NextAuth error:', message);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };