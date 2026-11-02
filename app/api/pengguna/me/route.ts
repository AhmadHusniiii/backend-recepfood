import { NextRequest } from "next/server";
import {
  getProfilSayaController,
  updateProfilSayaController,
} from "@/lib/controllers/pengguna.controller";
import { verifyAuth } from "@/lib/middleware/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/helpers/response";
import { UpdateProfilBody } from "@/lib/types";

/**
 * GET /api/pengguna/me
 * Ambil profil pengguna yang sedang login
 * Membutuhkan: Bearer Token
 */
export async function GET(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  return await getProfilSayaController(authUser);
}

/**
 * PUT /api/pengguna/me
 * Perbarui profil pengguna yang sedang login
 * Membutuhkan: Bearer Token
 */
export async function PUT(request: NextRequest): Promise<Response> {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const body: UpdateProfilBody = await request.json();
    return await updateProfilSayaController(authUser, body);
  } catch {
    return errorResponse("Format request tidak valid.", 400);
  }
}
