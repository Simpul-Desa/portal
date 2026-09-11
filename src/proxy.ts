import { NextResponse, type NextRequest } from "next/server";

const ONBOARDING_COOKIE = "simpul_onboarded";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Lewati halaman onboarding, rute API, dan berkas internal Next.js
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const onboarded = request.cookies.get(ONBOARDING_COOKIE)?.value;
  if (!onboarded) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    if (pathname !== "/") {
      url.search = `?lanjut=${encodeURIComponent(pathname + search)}`;
    } else {
      url.search = "";
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada seluruh navigasi halaman, KECUALI:
     * - api (rute API backend)
     * - _next/static (aset statis build)
     * - _next/image (optimasi gambar Next.js)
     * - favicon, icon, dan seluruh berkas dengan ekstensi (.png, .svg, .mjs, dll)
     */
    "/((?!api|_next/static|_next/image|favicon|icon|.*\\..*).*)",
  ],
};
