import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// middleware handles authentication for private pages
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // quick diagnostic log for redirects
  console.log('[middleware] pathname=', pathname);

  // expose the raw pathname to downstream server components via a cookie
  // (response headers aren't available via `headers()` in some server components)
  try {
    response.cookies.set('x-original-path', pathname, { path: '/' });
  } catch (e) {
    // best-effort; if cookies API isn't available in this environment, continue
    console.warn('[middleware] unable to set x-original-path cookie', e);
  }

  // create supabase server client using cookie helpers
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[middleware] user=', user ? user.id : 'anonymous');

  // allow login page through to avoid redirect loops
  if (pathname.startsWith('/login')) {
    console.log('[middleware] allowing login path, skipping auth redirect');
    return response;
  }
  if (pathname.startsWith('/home') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/login`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)).*)',
  ],
};
