import { NextRequest } from "next/server";
import { registerController } from "@/lib/controllers/auth.controller";
import { errorResponse } from "@/lib/helpers/response";
import { RegisterBody } from "@/lib/types";

/**
 * POST /api/auth/register
 * Mendaftarkan pengguna baru
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: RegisterBody = await request.json();
    return await registerController(body);
  } catch {
    return errorResponse("Format request tidak valid. Pastikan mengirim JSON.", 400);
  }
}
