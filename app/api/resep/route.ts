import { NextRequest } from "next/server";
import {
  getAllResepController,
  createResepController,
} from "@/lib/controllers/resep.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/helpers/response";
import { CreateResepBody } from "@/lib/types";

/**
 * GET /api/resep
 * Ambil semua resep yang ditayangkan (publik)
 * Query params: page, limit, search, id_kategori, tingkat_kesulitan, id_pengguna
 */
export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // max 50
  const search = searchParams.get("search") || undefined;
  const id_kategori = searchParams.get("id_kategori")
    ? parseInt(searchParams.get("id_kategori")!)
    : undefined;
  const tingkat_kesulitan = searchParams.get("tingkat_kesulitan") || undefined;
  const id_pengguna = searchParams.get("id_pengguna")
    ? parseInt(searchParams.get("id_pengguna")!)
    : undefined;

  return await getAllResepController({
    page,
    limit,
    search,
    id_kategori,
    tingkat_kesulitan,
    id_pengguna,
  });
}

/**
 * POST /api/resep
 * Buat resep baru (harus login)
 * Membutuhkan: Bearer Token
 */
export async function POST(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const body: CreateResepBody = await request.json();
    return await createResepController(authUser, body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}
