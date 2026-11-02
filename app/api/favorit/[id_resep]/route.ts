import { NextRequest } from "next/server";
import {
  tambahFavoritController,
  hapusFavoritController,
  cekFavoritController,
} from "@/lib/controllers/favorit.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/helpers/response";

/**
 * GET /api/favorit/[id_resep]
 * Cek apakah resep ada di favorit pengguna
 * Membutuhkan: Bearer Token
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/favorit/[id_resep]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id_resep } = await ctx.params;
  const idResep = parseInt(id_resep);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await cekFavoritController(authUser, idResep);
}

/**
 * POST /api/favorit/[id_resep]
 * Tambahkan resep ke favorit
 * Membutuhkan: Bearer Token
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/favorit/[id_resep]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id_resep } = await ctx.params;
  const idResep = parseInt(id_resep);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await tambahFavoritController(authUser, idResep);
}

/**
 * DELETE /api/favorit/[id_resep]
 * Hapus resep dari favorit
 * Membutuhkan: Bearer Token
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/favorit/[id_resep]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id_resep } = await ctx.params;
  const idResep = parseInt(id_resep);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await hapusFavoritController(authUser, idResep);
}
