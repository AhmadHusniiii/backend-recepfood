import { NextRequest } from "next/server";
import {
  getRatingResepController,
  upsertRatingController,
  deleteRatingController,
} from "@/lib/controllers/rating.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import {
  unauthorizedResponse,
  errorResponse,
} from "@/lib/helpers/response";
import { CreateRatingBody } from "@/lib/types";

/**
 * GET /api/resep/[id]/rating
 * Ambil semua rating untuk resep berdasarkan ID (publik)
 * Query: page, limit
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]/rating">
): Promise<Response> {
  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  return await getRatingResepController(idResep, page, limit);
}

/**
 * POST /api/resep/[id]/rating
 * Tambah atau perbarui rating untuk resep
 * Membutuhkan: Bearer Token
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]/rating">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  try {
    const body: CreateRatingBody = await request.json();
    return await upsertRatingController(authUser, idResep, body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}

/**
 * DELETE /api/resep/[id]/rating
 * Hapus rating pengguna untuk resep ini
 * Membutuhkan: Bearer Token
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/resep/[id]/rating">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const { id } = await ctx.params;
  const idResep = parseInt(id);

  if (isNaN(idResep)) {
    return errorResponse("ID resep tidak valid.", 400);
  }

  return await deleteRatingController(authUser, idResep);
}
