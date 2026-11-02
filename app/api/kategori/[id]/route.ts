import { NextRequest } from "next/server";
import {
  getKategoriByIdController,
  updateKategoriController,
  deleteKategoriController,
} from "@/lib/controllers/kategori.controller";
import { verifyAuth, isAdmin } from "@/lib/middleware/auth";
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from "@/lib/helpers/response";
import { KategoriResep } from "@/lib/types";

/**
 * GET /api/kategori/[id]
 * Ambil detail kategori berdasarkan ID (publik)
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/kategori/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const idKategori = parseInt(id);

  if (isNaN(idKategori)) {
    return errorResponse("ID kategori tidak valid.", 400);
  }

  return await getKategoriByIdController(idKategori);
}

/**
 * PUT /api/kategori/[id]
 * Perbarui kategori berdasarkan ID (Admin only)
 * Membutuhkan: Bearer Token (Admin)
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/kategori/[id]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();
  if (!isAdmin(authUser))
    return forbiddenResponse("Hanya admin yang dapat mengubah kategori.");

  const { id } = await ctx.params;
  const idKategori = parseInt(id);

  if (isNaN(idKategori)) {
    return errorResponse("ID kategori tidak valid.", 400);
  }

  try {
    const body: Partial<Omit<KategoriResep, "id_kategori">> =
      await request.json();
    return await updateKategoriController(idKategori, body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}

/**
 * DELETE /api/kategori/[id]
 * Hapus kategori berdasarkan ID (Admin only)
 * Membutuhkan: Bearer Token (Admin)
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/kategori/[id]">
): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();
  if (!isAdmin(authUser))
    return forbiddenResponse("Hanya admin yang dapat menghapus kategori.");

  const { id } = await ctx.params;
  const idKategori = parseInt(id);

  if (isNaN(idKategori)) {
    return errorResponse("ID kategori tidak valid.", 400);
  }

  return await deleteKategoriController(idKategori);
}
