import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { AuthUser } from "@/lib/middleware/auth";
import { UpdateProfilBody } from "@/lib/types";

/**
 * GET /api/pengguna/me
 * Ambil profil pengguna yang sedang login
 */
export async function getProfilSayaController(
  authUser: AuthUser
): Promise<Response> {
  return successResponse(authUser.pengguna, "Profil berhasil diambil.");
}

/**
 * PUT /api/pengguna/me
 * Perbarui profil pengguna yang sedang login
 */
export async function updateProfilSayaController(
  authUser: AuthUser,
  body: UpdateProfilBody
): Promise<Response> {
  const { username, url_avatar, jenis_makanan_favorit } = body;

  // Cek apakah ada field yang diupdate
  if (!username && !url_avatar && jenis_makanan_favorit === undefined) {
    return errorResponse("Tidak ada data yang diperbarui.", 400);
  }

  // Jika username diubah, cek keunikannya
  if (username) {
    const { data: existing } = await supabaseAdmin
      .from("pengguna")
      .select("id_pengguna")
      .eq("username", username)
      .neq("id_pengguna", authUser.pengguna.id_pengguna)
      .single();

    if (existing) {
      return errorResponse("Username sudah digunakan.", 409);
    }
  }

  const updateData: UpdateProfilBody = {};
  if (username) updateData.username = username;
  if (url_avatar !== undefined) updateData.url_avatar = url_avatar;
  if (jenis_makanan_favorit !== undefined)
    updateData.jenis_makanan_favorit = jenis_makanan_favorit;

  const { data: pengguna, error } = await supabaseAdmin
    .from("pengguna")
    .update(updateData)
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .select()
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal memperbarui profil.");
  }

  return successResponse(pengguna, "Profil berhasil diperbarui.");
}

/**
 * GET /api/pengguna/:id
 * Ambil profil pengguna publik berdasarkan ID
 */
export async function getProfilPenggunaController(
  idPengguna: number
): Promise<Response> {
  const { data: pengguna, error } = await supabaseAdmin
    .from("pengguna")
    .select("id_pengguna, username, url_avatar, jenis_makanan_favorit, peran, dibuat_pada")
    .eq("id_pengguna", idPengguna)
    .single();

  if (error || !pengguna) {
    return notFoundResponse("Pengguna tidak ditemukan.");
  }

  return successResponse(pengguna, "Profil pengguna berhasil diambil.");
}

/**
 * GET /api/pengguna (Admin only)
 * Ambil semua pengguna dengan pagination
 */
export async function getAllPenggunaController(
  page: number = 1,
  limit: number = 10
): Promise<Response> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("pengguna")
    .select("id_pengguna, username, url_avatar, peran, dibuat_pada", {
      count: "exact",
    })
    .range(from, to)
    .order("dibuat_pada", { ascending: false });

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil data pengguna.");
  }

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Daftar pengguna berhasil diambil.",
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * DELETE /api/pengguna/:id (Admin only)
 * Hapus pengguna berdasarkan ID
 */
export async function hapusPenggunaController(
  idPengguna: number
): Promise<Response> {
  // Ambil auth_id terlebih dahulu
  const { data: pengguna, error: findError } = await supabaseAdmin
    .from("pengguna")
    .select("auth_id")
    .eq("id_pengguna", idPengguna)
    .single();

  if (findError || !pengguna) {
    return notFoundResponse("Pengguna tidak ditemukan.");
  }

  // Hapus dari tabel pengguna
  const { error: deleteError } = await supabaseAdmin
    .from("pengguna")
    .delete()
    .eq("id_pengguna", idPengguna);

  if (deleteError) {
    return serverErrorResponse(deleteError, "Gagal menghapus pengguna.");
  }

  // Hapus dari Supabase Auth
  await supabaseAdmin.auth.admin.deleteUser(pengguna.auth_id);

  return successResponse(null, "Pengguna berhasil dihapus.");
}
