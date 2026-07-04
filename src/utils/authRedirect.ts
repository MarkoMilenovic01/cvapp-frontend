import type { Role } from "../types/auth";

export function getDashboardPath(role: Role | string | null | undefined) {
  switch (role) {
    case "USER":
      return "/user";

    case "COMPANY":
      return "/company";

    case "ADMIN":
      return "/admin";

    default:
      return "/login";
  }
}