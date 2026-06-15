import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { ReaderTypeId } from '@/lib/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      readerTypeId?: ReaderTypeId;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      id: 'firebase',
      name: 'Firebase',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken as string | undefined;
        const providedName = (credentials?.name as string | undefined)?.trim();
        if (!idToken) return null;

        try {
          const { getAdminAuth } = await import('@/lib/firebase/admin');
          const { getUserProfile, upsertUserProfile } = await import('@/lib/firebase/users');
          const decoded = await getAdminAuth().verifyIdToken(idToken);
          const profile = await getUserProfile(decoded.uid);
          const displayName =
            providedName ||
            profile?.name ||
            decoded.name ||
            decoded.email?.split('@')[0] ||
            'Reader';

          await upsertUserProfile(decoded.uid, {
            email: decoded.email ?? null,
            name: displayName,
          });

          return {
            id: decoded.uid,
            name: displayName,
            email: decoded.email ?? null,
            readerTypeId: profile?.readerTypeId,
          };
        } catch (err) {
          console.error('[auth] Firebase authorize failed:', err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        const readerTypeId = (user as { readerTypeId?: ReaderTypeId }).readerTypeId;
        if (readerTypeId) {
          (token as { readerTypeId?: ReaderTypeId }).readerTypeId = readerTypeId;
        }
      }

      if (trigger === 'update' && session) {
        if ('readerTypeId' in session) {
          (token as { readerTypeId?: ReaderTypeId }).readerTypeId = session.readerTypeId as ReaderTypeId;
        }
        if ('name' in session && typeof session.name === 'string') {
          token.name = session.name;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        const user = session.user as {
          id?: string;
          name?: string | null;
          email?: string | null;
          readerTypeId?: ReaderTypeId;
        };
        user.id = token.sub;
        user.name = token.name as string | null | undefined;
        user.email = (token.email as string | null | undefined) ?? null;
        user.readerTypeId = (token as { readerTypeId?: ReaderTypeId }).readerTypeId;
      }
      return session;
    },
  },
  trustHost: true,
});
