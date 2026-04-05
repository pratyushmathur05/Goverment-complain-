import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    // Use our custom auth pages — NextAuth just handles the OAuth plumbing
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first Google sign-in, store the Google profile info in the JWT
      if (account?.provider === 'google' && profile) {
        token.googleName    = profile.name;
        token.googleEmail   = profile.email;
        token.googlePicture = (profile as Record<string, string>).picture;
      }
      return token;
    },
    async session({ session, token }) {
      // Forward Google data to the session object
      if (token.googleName)    session.user.name    = token.googleName as string;
      if (token.googleEmail)   session.user.email   = token.googleEmail as string;
      if (token.googlePicture) session.user.image   = token.googlePicture as string;
      return session;
    },
  },
});
