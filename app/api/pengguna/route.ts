import { NextRequest } from "next/server";
import {
  getAllPenggunaController,
} from "@/lib/controllers/pengguna.controller";
import { verifyAuth, isAdmin } from "@/lib/middleware/auth";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/helpers/response";

/**
 * GET /api/pengguna
 * Ambil semua pengguna (Admin only)
 * Membutuhkan: Bearer Token (Admin)
 * Query: page, limit
 */
export async function GET(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();
  if (!isAdmin(authUser)) return forbiddenResponse("Hanya admin yang dapat mengakses endpoint ini.");

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  return await getAllPenggunaController(page, limit);
}
