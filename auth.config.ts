import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';

export const authConfig = {
    pages: {
        /**
         * the user will be redirected to our custom login page, 
         * rather than the NextAuth.js default page.
         */
        signIn: '/login',
    },

    callbacks: {
        /**This callback is used to verify if the request 
         * is authorized to access a page with Next.js Middleware
         *  and is called before a request is completed, receiving 
         * an object with the following properties:auth and request. 
         * 
         * The auth object contains the user session and the request object 
         * contains the URL of the page the user is trying to access.
         * */
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: []//here you add different login options
} satisfies NextAuthConfig;
