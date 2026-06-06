import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CUSTOMER" | "ADMIN"
      name: string
      email: string
      image: string
    }
  }
}
