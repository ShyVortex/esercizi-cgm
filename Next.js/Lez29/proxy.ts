import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { User } from "./models/types/User";
import { JwtPayload } from "./models/types/JwtPayload";

function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts: string[] = token.split('.');
        if (parts.length !== 3) return null;
        const base64Url: string = parts[1];
        const base64: string = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload: string = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname }: { pathname: string } = request.nextUrl;

    // Cookie token
    const token: string | undefined = request.cookies.get("token")?.value;

    const isProtectedRoute: boolean = pathname.startsWith("/profile") || pathname.startsWith("/admin");
    const isAuthRoute: boolean = pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (!token) {
        if (isProtectedRoute) {
            const loginUrl: URL = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    const payload: JwtPayload | null = decodeJwt(token);
    if (!payload || !payload.sub) {
        if (isProtectedRoute) {
            const response: NextResponse = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("token");
            return response;
        }
        return NextResponse.next();
    }

    try {
        const userRes: Response = await fetch(`http://localhost:3000/users/${payload.sub}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!userRes.ok) {
            if (isProtectedRoute) {
                const response: NextResponse = NextResponse.redirect(new URL("/login", request.url));
                response.cookies.delete("token");
                return response;
            }
            return NextResponse.next();
        }

        const user: User = await userRes.json() as User;

        if (user.isActive === false) {
            const url: URL = new URL("/403", request.url);
            const requestHeaders: Headers = new Headers(request.headers);
            requestHeaders.set("x-user-active", "false");
            requestHeaders.set("x-user-role", String(user.role));
            requestHeaders.set("x-user-email", user.email);
            requestHeaders.set("x-user-username", user.username);
            return NextResponse.rewrite(url, {
                request: {
                    headers: requestHeaders
                }
            });
        }

        if (isAuthRoute) {
            return NextResponse.redirect(new URL("/profile", request.url));
        }

        if (pathname.startsWith("/admin") && user.role !== 2) {
            const url: URL = new URL("/403", request.url);
            const requestHeaders: Headers = new Headers(request.headers);
            requestHeaders.set("x-user-role", String(user.role));
            requestHeaders.set("x-user-email", user.email);
            requestHeaders.set("x-user-username", user.username);
            return NextResponse.rewrite(url, {
                request: {
                    headers: requestHeaders
                }
            });
        }

        const requestHeaders: Headers = new Headers(request.headers);
        requestHeaders.set("x-user-id", user.id);
        requestHeaders.set("x-user-email", user.email);
        requestHeaders.set("x-user-username", user.username);
        requestHeaders.set("x-user-firstname", user.firstName);
        requestHeaders.set("x-user-lastname", user.lastName);
        requestHeaders.set("x-user-role", String(user.role));

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
    } catch (error) {
        console.error("Middleware fetch error:", error);
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/profile/:path*",
        "/admin/:path*",
        "/login",
        "/signup"
    ]
};
