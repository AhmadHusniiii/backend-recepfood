import { NextRequest } from "next/server";
import {
  tambahUnduhanController,
  hapusUnduhanController,
} from "@/lib/controllers/unduhan.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/helpers/response";

/**
 * POST /api/unduhan/[id_resep]
 * Simpan resep untuk akses offline
 * Membutuhkan: Bearer Token
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/unduhan/[id_resep]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id_resep } = await ctx.params;
  const idResep = parseInt(id_resep);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await tambahUnduhanController(authUser, idResep);
}

/**
 * DELETE /api/unduhan/[id_resep]
 * Hapus resep dari unduhan offline
 * Membutuhkan: Bearer Token
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/unduhan/[id_resep]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id_resep } = await ctx.params;
  const idResep = parseInt(id_resep);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await hapusUnduhanController(authUser, idResep);
}
