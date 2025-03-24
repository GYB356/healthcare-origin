import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Allow public routes
    if (path === '/login') {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based route protection
    const role = token.role?.toLowerCase();
    if (path.startsWith(`/${role}`)) {
      return NextResponse.next();
    }

    // Redirect to appropriate dashboard if trying to access wrong role's route
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/login',
  ],
}; 