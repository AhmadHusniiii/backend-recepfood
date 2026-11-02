import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { KategoriResep } from "@/lib/types";

/**
 * GET /api/kategori
 * Ambil semua kategori resep
 */
export async function getAllKategoriController(): Promise<Response> {
  const { data, error } = await supabaseAdmin
    .from("kategori_resep")
    .select("*")
    .order("nama_kategori", { ascending: true });

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil data kategori.");
  }

  return successResponse(data, "Daftar kategori berhasil diambil.");
}

/**
 * GET /api/kategori/:id
 * Ambil detail kategori berdasarkan ID
 */
export async function getKategoriByIdController(
  idKategori: number
): Promise<Response> {
  const { data: kategori, error } = await supabaseAdmin
    .from("kategori_resep")
    .select("*")
    .eq("id_kategori", idKategori)
    .single();

  if (error || !kategori) {
    return notFoundResponse("Kategori tidak ditemukan.");
  }

  return successResponse(kategori, "Kategori berhasil diambil.");
}

/**
 * POST /api/kategori (Admin only)
 * Buat kategori baru
 */
export async function createKategoriController(
  body: Omit<KategoriResep, "id_kategori">
): Promise<Response> {
  const { nama_kategori, deskripsi_kategori } = body;

  if (!nama_kategori?.trim()) {
    return errorResponse("Nama kategori wajib diisi.", 400);
  }

  // Cek duplikat nama kategori
  const { data: existing } = await supabaseAdmin
    .from("kategori_resep")
    .select("id_kategori")
    .ilike("nama_kategori", nama_kategori.trim())
    .single();

  if (existing) {
    return errorResponse("Nama kategori sudah ada.", 409);
  }

  const { data: kategori, error } = await supabaseAdmin
    .from("kategori_resep")
    .insert({
      nama_kategori: nama_kategori.trim(),
      deskripsi_kategori: deskripsi_kategori?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal membuat kategori.");
  }

  return successResponse(kategori, "Kategori berhasil dibuat.", 201);
}

/**
 * PUT /api/kategori/:id (Admin only)
 * Perbarui kategori berdasarkan ID
 */
export async function updateKategoriController(
  idKategori: number,
  body: Partial<Omit<KategoriResep, "id_kategori">>
): Promise<Response> {
  const { nama_kategori, deskripsi_kategori } = body;

  // Cek apakah kategori ada
  const { data: existing } = await supabaseAdmin
    .from("kategori_resep")
    .select("id_kategori")
    .eq("id_kategori", idKategori)
    .single();

  if (!existing) {
    return notFoundResponse("Kategori tidak ditemukan.");
  }

  const updateData: Partial<Omit<KategoriResep, "id_kategori">> = {};
  if (nama_kategori) updateData.nama_kategori = nama_kategori.trim();
  if (deskripsi_kategori !== undefined)
    updateData.deskripsi_kategori = deskripsi_kategori;

  const { data: kategori, error } = await supabaseAdmin
    .from("kategori_resep")
    .update(updateData)
    .eq("id_kategori", idKategori)
    .select()
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal memperbarui kategori.");
  }

  return successResponse(kategori, "Kategori berhasil diperbarui.");
}

/**
 * DELETE /api/kategori/:id (Admin only)
 * Hapus kategori berdasarkan ID
 */
export async function deleteKategoriController(
  idKategori: number
): Promise<Response> {
  // Cek apakah kategori ada
  const { data: existing } = await supabaseAdmin
    .from("kategori_resep")
    .select("id_kategori")
    .eq("id_kategori", idKategori)
    .single();

  if (!existing) {
    return notFoundResponse("Kategori tidak ditemukan.");
  }

  // Cek apakah ada resep yang menggunakan kategori ini
  const { count } = await supabaseAdmin
    .from("resep")
    .select("id_resep", { count: "exact", head: true })
    .eq("id_kategori", idKategori);

  if (count && count > 0) {
    return errorResponse(
      `Kategori tidak dapat dihapus karena masih digunakan oleh ${count} resep.`,
      400
    );
  }

  const { error } = await supabaseAdmin
    .from("kategori_resep")
    .delete()
    .eq("id_kategori", idKategori);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus kategori.");
  }

  return successResponse(null, "Kategori berhasil dihapus.");
}
