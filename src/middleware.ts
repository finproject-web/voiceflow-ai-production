import { createClient } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Redirect to login if accessing protected route without session
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify user has organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      // Redirect to login with error if user has no organization
      const loginUrl = new URL('/auth/login?error=no_organization', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    // Verify user has organization before redirecting to dashboard
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userData?.organization_id) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
