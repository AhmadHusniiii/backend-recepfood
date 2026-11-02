import { NextRequest } from "next/server";
import { refreshTokenController } from "@/lib/controllers/auth.controller";
import { errorResponse } from "@/lib/helpers/response";

/**
 * POST /api/auth/refresh
 * Perbarui access token menggunakan refresh token
 * Body: { refresh_token: string }
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { refresh_token } = body;
    return await refreshTokenController(refresh_token);
  } catch {
    return errorResponse("Format request tidak valid. Pastikan mengirim JSON.", 400);
  }
}
