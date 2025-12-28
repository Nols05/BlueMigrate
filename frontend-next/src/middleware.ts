import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/migrate', '/migrate/posts', '/featured'];



export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (isProtectedRoute && !session?.userId) {
        let redirect = '/signup';
        if (path === '/featured') {
            redirect = '/signup?r=featured';
        }
        return NextResponse.redirect(new URL(redirect, req.nextUrl));
    }


    return NextResponse.next();
}
