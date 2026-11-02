import { NextRequest } from "next/server";
import {
  getProfilPenggunaController,
  hapusPenggunaController,
} from "@/lib/controllers/pengguna.controller";
import { verifyAuth, isAdmin } from "@/lib/middleware/auth";
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from "@/lib/helpers/response";

/**
 * GET /api/pengguna/[id]
 * Ambil profil publik pengguna berdasarkan ID
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/pengguna/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const idPengguna = parseInt(id);

  if (isNaN(idPengguna)) {
    return errorResponse("ID pengguna tidak valid.", 400);
  }

  return await getProfilPenggunaController(idPengguna);
}

/**
 * DELETE /api/pengguna/[id]
 * Hapus pengguna berdasarkan ID (Admin only)
 * Membutuhkan: Bearer Token (Admin)
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/pengguna/[id]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();
  if (!isAdmin(authUser))
    return forbiddenResponse("Hanya admin yang dapat menghapus pengguna.");

  const { id } = await ctx.params;
  const idPengguna = parseInt(id);

  if (isNaN(idPengguna)) {
    return errorResponse("ID pengguna tidak valid.", 400);
  }

  return await hapusPenggunaController(idPengguna);
}
