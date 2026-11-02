import { NextRequest } from "next/server";
import {
  getUnduhanSayaController,
  hapusSemuaUnduhanController,
} from "@/lib/controllers/unduhan.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse } from "@/lib/helpers/response";

/**
 * GET /api/unduhan
 * Ambil semua riwayat unduhan offline pengguna
 * Membutuhkan: Bearer Token
 * Query: page, limit
 */
export async function GET(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  return await getUnduhanSayaController(authUser, page, limit);
}

/**
 * DELETE /api/unduhan
 * Hapus semua riwayat unduhan offline pengguna
 * Membutuhkan: Bearer Token
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  return await hapusSemuaUnduhanController(authUser);
}
