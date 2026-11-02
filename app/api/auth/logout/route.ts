import { NextRequest } from "next/server";
import { logoutController } from "@/lib/controllers/auth.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse } from "@/lib/helpers/response";

/**
 * POST /api/auth/logout
 * Logout dan invalidate semua session pengguna
 * Membutuhkan: Bearer Token
 */
export async function POST(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) {
    return unauthorizedResponse();
  }

  return await logoutController(authUser.auth_id);
}
