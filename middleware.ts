import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

/***
 * The purpose of this configuration is to ensure that 
 * the middleware is applied to all routes except for the 
 * specified exclusions.
 * This is useful for scenarios where you want to run middleware
 * logic on most of your application's routes but exclude certain paths e.g.
 * API endpoints, static assets and image optimizations routes.
 * 
 */

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

/**
 * The protected routes will not even start rendering
 * until the Middleware verifies the authentication, enhancing both
 * security and performance of the app
 */