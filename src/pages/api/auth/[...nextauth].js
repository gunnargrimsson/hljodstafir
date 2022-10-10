import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      id: 'google',
      clientId: process.env.NEXTAUTH_GOOGLE_ID,
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET
    }),
    // Passwordless / email sign in
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
})