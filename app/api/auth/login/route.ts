import { NextRequest } from "next/server";
import { loginController } from "@/lib/controllers/auth.controller";
import { errorResponse } from "@/lib/helpers/response";
import { LoginBody } from "@/lib/types";

/**
 * POST /api/auth/login
 * Login pengguna dan dapatkan token JWT
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: LoginBody = await request.json();
    return await loginController(body);
  } catch {
    return errorResponse("Format request tidak valid. Pastikan mengirim JSON.", 400);
  }
}
