import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { AuthUser } from "@/lib/middleware/auth";

/**
 * GET /api/unduhan
 * Ambil semua riwayat unduhan offline pengguna yang login
 */
export async function getUnduhanSayaController(
  authUser: AuthUser,
  page: number = 1,
  limit: number = 10
): Promise<Response> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("unduhan_offline")
    .select(
      `
      id_unduhan,
      diunduh_pada,
      resep:id_resep (
        id_resep,
        judul,
        deskripsi_singkat,
        url_gambar,
        bahan,
        langkah,
        waktu_masak_menit,
        porsi,
        tingkat_kesulitan,
        tag,
        pengguna:id_pengguna (id_pengguna, username, url_avatar),
        kategori_resep:id_kategori (id_kategori, nama_kategori)
      )
    `,
      { count: "exact" }
    )
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .order("diunduh_pada", { ascending: false })
    .range(from, to);

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil riwayat unduhan.");
  }

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Riwayat unduhan berhasil diambil.",
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
 * POST /api/unduhan/:id_resep
 * Tandai resep sebagai sudah diunduh untuk akses offline
 */
export async function tambahUnduhanController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  // Cek apakah resep ada
  const { data: resep } = await supabaseAdmin
    .from("resep")
    .select("id_resep, judul, bahan, langkah, ditayangkan")
    .eq("id_resep", idResep)
    .eq("ditayangkan", true)
    .single();

  if (!resep) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  // Cek apakah sudah pernah diunduh (hindari duplikat)
  const { data: existing } = await supabaseAdmin
    .from("unduhan_offline")
    .select("id_unduhan, diunduh_pada")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  if (existing) {
    // Update timestamp unduhan terbaru
    const { data: updated, error } = await supabaseAdmin
      .from("unduhan_offline")
      .update({ diunduh_pada: new Date().toISOString() })
      .eq("id_unduhan", existing.id_unduhan)
      .select()
      .single();

    if (error) {
      return serverErrorResponse(error, "Gagal memperbarui riwayat unduhan.");
    }

    return successResponse(updated, "Unduhan berhasil diperbarui.");
  }

  // Insert riwayat unduhan baru
  const { data: unduhan, error } = await supabaseAdmin
    .from("unduhan_offline")
    .insert({
      id_pengguna: authUser.pengguna.id_pengguna,
      id_resep: idResep,
    })
    .select()
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal menyimpan riwayat unduhan.");
  }

  return successResponse(unduhan, "Resep berhasil disimpan untuk akses offline.", 201);
}

/**
 * DELETE /api/unduhan/:id_resep
 * Hapus resep dari unduhan offline
 */
export async function hapusUnduhanController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  const { data: existing } = await supabaseAdmin
    .from("unduhan_offline")
    .select("id_unduhan")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  if (!existing) {
    return notFoundResponse("Unduhan tidak ditemukan.");
  }

  const { error } = await supabaseAdmin
    .from("unduhan_offline")
    .delete()
    .eq("id_unduhan", existing.id_unduhan);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus unduhan.");
  }

  return successResponse(null, "Unduhan berhasil dihapus.");
}

/**
 * DELETE /api/unduhan (hapus semua)
 * Hapus semua riwayat unduhan offline pengguna
 */
export async function hapusSemuaUnduhanController(
  authUser: AuthUser
): Promise<Response> {
  const { error } = await supabaseAdmin
    .from("unduhan_offline")
    .delete()
    .eq("id_pengguna", authUser.pengguna.id_pengguna);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus semua unduhan.");
  }

  return successResponse(null, "Semua unduhan berhasil dihapus.");
}
