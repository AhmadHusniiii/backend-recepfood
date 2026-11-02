import { NextRequest } from "next/server";
import {
  getResepByIdController,
  updateResepController,
  deleteResepController,
} from "@/lib/controllers/resep.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/helpers/response";
import { UpdateResepBody } from "@/lib/types";

/**
 * GET /api/resep/[id]
 * Ambil detail resep berdasarkan ID
 * Auth opsional (untuk melihat resep yang disembunyikan jika pemilik/admin)
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  // Auth opsional
  const authUser = await verifyAuth(request);

  return await getResepByIdController(idResep, authUser);
}

/**
 * PUT /api/resep/[id]
 * Perbarui resep (hanya pemilik atau admin)
 * Membutuhkan: Bearer Token
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  try {
    const body: UpdateResepBody = await request.json();
    return await updateResepController(authUser, idResep, body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}

/**
 * DELETE /api/resep/[id]
 * Hapus resep (hanya pemilik atau admin)
 * Membutuhkan: Bearer Token
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await deleteResepController(authUser, idResep);
}
