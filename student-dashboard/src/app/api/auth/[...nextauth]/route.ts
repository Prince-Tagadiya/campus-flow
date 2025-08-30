import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        try {
          // Store user data in Firestore
          const userRef = doc(db, 'users', user.id);
          await setDoc(
            userRef,
            {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { merge: true }
          );

          return true;
        } catch (error) {
          console.error('Error storing user data:', error);
          return true; // Still allow sign in even if storing fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };
