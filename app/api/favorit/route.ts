import { NextRequest } from "next/server";
import {
  getFavoritSayaController,
} from "@/lib/controllers/favorit.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse } from "@/lib/helpers/response";

/**
 * GET /api/favorit
 * Ambil semua resep favorit pengguna yang sedang login
 * Membutuhkan: Bearer Token
 * Query: page, limit
 */
export async function GET(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  return await getFavoritSayaController(authUser, page, limit);
}
