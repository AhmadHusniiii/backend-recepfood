import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { AuthUser } from "@/lib/middleware/auth";
import { CreateRatingBody } from "@/lib/types";

/**
 * GET /api/resep/:id_resep/rating
 * Ambil semua rating & komentar untuk sebuah resep
 */
export async function getRatingResepController(
  idResep: number,
  page: number = 1,
  limit: number = 10
): Promise<Response> {
  // Cek apakah resep ada
  const { data: resep } = await supabaseAdmin
    .from("resep")
    .select("id_resep")
    .eq("id_resep", idResep)
    .eq("ditayangkan", true)
    .single();

  if (!resep) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("rating_resep")
    .select(
      `
      id_rating,
      nilai_rating,
      komentar,
      dibuat_pada,
      pengguna:id_pengguna (id_pengguna, username, url_avatar)
    `,
      { count: "exact" }
    )
    .eq("id_resep", idResep)
    .order("dibuat_pada", { ascending: false })
    .range(from, to);

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil rating.");
  }

  // Hitung rata-rata rating
  const { data: statsData } = await supabaseAdmin
    .from("rating_resep")
    .select("nilai_rating")
    .eq("id_resep", idResep);

  const rataRata =
    statsData && statsData.length > 0
      ? statsData.reduce((sum, r) => sum + r.nilai_rating, 0) / statsData.length
      : 0;

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Rating berhasil diambil.",
    data,
    statistik: {
      rata_rata: Math.round(rataRata * 10) / 10,
      total_rating: total,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/resep/:id_resep/rating
 * Tambah atau perbarui rating (satu pengguna = satu rating per resep)
 */
export async function upsertRatingController(
  authUser: AuthUser,
  idResep: number,
  body: CreateRatingBody
): Promise<Response> {
  const { nilai_rating, komentar } = body;

  // Validasi nilai rating
  if (!nilai_rating || nilai_rating < 1 || nilai_rating > 5) {
    return errorResponse("Nilai rating harus antara 1 sampai 5.", 400);
  }

  // Cek apakah resep ada
  const { data: resep } = await supabaseAdmin
    .from("resep")
    .select("id_resep")
    .eq("id_resep", idResep)
    .eq("ditayangkan", true)
    .single();

  if (!resep) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  // Cek apakah pengguna sudah pernah memberi rating
  const { data: existingRating } = await supabaseAdmin
    .from("rating_resep")
    .select("id_rating")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  let data, error;

  if (existingRating) {
    // Update rating yang sudah ada
    ({ data, error } = await supabaseAdmin
      .from("rating_resep")
      .update({
        nilai_rating,
        komentar: komentar || null,
      })
      .eq("id_rating", existingRating.id_rating)
      .select(`*, pengguna:id_pengguna (id_pengguna, username, url_avatar)`)
      .single());
  } else {
    // Insert rating baru
    ({ data, error } = await supabaseAdmin
      .from("rating_resep")
      .insert({
        id_pengguna: authUser.pengguna.id_pengguna,
        id_resep: idResep,
        nilai_rating,
        komentar: komentar || null,
      })
      .select(`*, pengguna:id_pengguna (id_pengguna, username, url_avatar)`)
      .single());
  }

  if (error) {
    return serverErrorResponse(error, "Gagal menyimpan rating.");
  }

  const status = existingRating ? 200 : 201;
  const message = existingRating
    ? "Rating berhasil diperbarui."
    : "Rating berhasil ditambahkan.";

  return successResponse(data, message, status);
}

/**
 * DELETE /api/resep/:id_resep/rating
 * Hapus rating milik pengguna untuk resep tertentu
 */
export async function deleteRatingController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  const { data: existing } = await supabaseAdmin
    .from("rating_resep")
    .select("id_rating, id_pengguna")
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .eq("id_resep", idResep)
    .single();

  if (!existing) {
    return notFoundResponse("Rating tidak ditemukan.");
  }

  const isOwner = existing.id_pengguna === authUser.pengguna.id_pengguna;
  const isAdmin = authUser.pengguna.peran === "admin";

  if (!isOwner && !isAdmin) {
    return forbiddenResponse("Kamu tidak memiliki izin untuk menghapus rating ini.");
  }

  const { error } = await supabaseAdmin
    .from("rating_resep")
    .delete()
    .eq("id_rating", existing.id_rating);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus rating.");
  }

  return successResponse(null, "Rating berhasil dihapus.");
}
