import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { AuthUser } from "@/lib/middleware/auth";

/**
 * GET /api/favorit
 * Ambil semua resep favorit pengguna yang login
 */
export async function getFavoritSayaController(
  authUser: AuthUser,
  page: number = 1,
  limit: number = 10
): Promise<Response> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("favorit")
    .select(
      `
      id_favorit,
      dibuat_pada,
      resep:id_resep (
        id_resep,
        judul,
        deskripsi_singkat,
        url_gambar,
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
    .order("dibuat_pada", { ascending: false })
    .range(from, to);

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil daftar favorit.");
  }

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Daftar favorit berhasil diambil.",
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
 * POST /api/favorit/:id_resep
 * Tambahkan resep ke favorit
 */
export async function tambahFavoritController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  // Cek apakah resep ada
  const { data: resep } = await supabaseAdmin
    .from("resep")
    .select("id_resep, ditayangkan")
    .eq("id_resep", idResep)
    .eq("ditayangkan", true)
    .single();

  if (!resep) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  // Cek apakah sudah difavoritkan
  const { data: existing } = await supabaseAdmin
    .from("favorit")
    .select("id_favorit")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  if (existing) {
    return errorResponse("Resep sudah ada di favorit.", 409);
  }

  const { data: favorit, error } = await supabaseAdmin
    .from("favorit")
    .insert({
      id_pengguna: authUser.pengguna.id_pengguna,
      id_resep: idResep,
    })
    .select()
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal menambahkan ke favorit.");
  }

  return successResponse(favorit, "Resep berhasil ditambahkan ke favorit.", 201);
}

/**
 * DELETE /api/favorit/:id_resep
 * Hapus resep dari favorit
 */
export async function hapusFavoritController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  const { data: existing } = await supabaseAdmin
    .from("favorit")
    .select("id_favorit")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  if (!existing) {
    return notFoundResponse("Resep tidak ada di favorit.");
  }

  const { error } = await supabaseAdmin
    .from("favorit")
    .delete()
    .eq("id_favorit", existing.id_favorit);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus dari favorit.");
  }

  return successResponse(null, "Resep berhasil dihapus dari favorit.");
}

/**
 * GET /api/favorit/cek/:id_resep
 * Cek apakah resep sudah ada di favorit
 */
export async function cekFavoritController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  const { data: favorit } = await supabaseAdmin
    .from("favorit")
    .select("id_favorit")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  return successResponse(
    { is_favorit: !!favorit, id_favorit: favorit?.id_favorit || null },
    "Status favorit berhasil dicek."
  );
}
