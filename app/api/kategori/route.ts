import { NextRequest } from "next/server";
import {
  getAllKategoriController,
  createKategoriController,
} from "@/lib/controllers/kategori.controller";
import { verifyAuth, isAdmin } from "@/lib/middleware/auth";
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from "@/lib/helpers/response";
import { KategoriResep } from "@/lib/types";

/**
 * GET /api/kategori
 * Ambil semua kategori resep (publik)
 */
export async function GET(): Promise<Response> {
  return await getAllKategoriController();
}

/**
 * POST /api/kategori
 * Buat kategori baru (Admin only)
 * Membutuhkan: Bearer Token (Admin)
 */
export async function POST(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();
  if (!isAdmin(authUser))
    return forbiddenResponse("Hanya admin yang dapat membuat kategori.");

  try {
    const body: Omit<KategoriResep, "id_kategori"> = await request.json();
    return await createKategoriController(body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}
