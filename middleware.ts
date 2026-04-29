import { withAuth } from "next-auth/middleware";
import { isAllowedUser } from "@/server/auth/config";

export default withAuth({
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    authorized({ token }) {
      return isAllowedUser(token?.email);
    }
  }
});

export const config = {
  matcher: [
    "/((?!api|login|manifest.webmanifest|sw.js|icons|_next/static|_next/image|favicon.ico).*)"
  ]
};
