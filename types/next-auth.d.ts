import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    allowed?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    allowed?: boolean;
  }
}
