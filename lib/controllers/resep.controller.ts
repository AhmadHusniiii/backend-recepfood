import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { AuthUser } from "@/lib/middleware/auth";
import { CreateResepBody, UpdateResepBody } from "@/lib/types";

// Select string untuk relasi
const RESEP_SELECT = `
  *,
  pengguna:id_pengguna (id_pengguna, username, url_avatar),
  kategori_resep:id_kategori (id_kategori, nama_kategori)
`;

/**
 * GET /api/resep
 * Ambil semua resep (publik, hanya yang ditayangkan = true)
 * Mendukung filter, pencarian, dan pagination
 */
export async function getAllResepController(params: {
  page?: number;
  limit?: number;
  search?: string;
  id_kategori?: number;
  tingkat_kesulitan?: string;
  id_pengguna?: number;
}): Promise<Response> {
  const {
    page = 1,
    limit = 10,
    search,
    id_kategori,
    tingkat_kesulitan,
    id_pengguna,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("resep")
    .select(RESEP_SELECT, { count: "exact" })
    .eq("ditayangkan", true)
    .order("dibuat_pada", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `judul.ilike.%${search}%,deskripsi_singkat.ilike.%${search}%`
    );
  }

  if (id_kategori) {
    query = query.eq("id_kategori", id_kategori);
  }

  if (tingkat_kesulitan) {
    query = query.eq("tingkat_kesulitan", tingkat_kesulitan);
  }

  if (id_pengguna) {
    query = query.eq("id_pengguna", id_pengguna);
  }

  const { data, error, count } = await query;

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil data resep.");
  }

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Daftar resep berhasil diambil.",
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
 * GET /api/resep/:id
 * Ambil detail resep berdasarkan ID
 */
export async function getResepByIdController(
  idResep: number,
  authUser?: AuthUser | null
): Promise<Response> {
  const { data: resep, error } = await supabaseAdmin
    .from("resep")
    .select(RESEP_SELECT)
    .eq("id_resep", idResep)
    .single();

  if (error || !resep) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  // Jika resep disembunyikan, hanya pemilik atau admin yang bisa lihat
  if (!resep.ditayangkan) {
    if (!authUser) {
      return notFoundResponse("Resep tidak ditemukan.");
    }
    const isOwner = resep.id_pengguna === authUser.pengguna.id_pengguna;
    const isAdmin = authUser.pengguna.peran === "admin";
    if (!isOwner && !isAdmin) {
      return notFoundResponse("Resep tidak ditemukan.");
    }
  }

  return successResponse(resep, "Resep berhasil diambil.");
}

/**
 * POST /api/resep
 * Buat resep baru (harus login)
 */
export async function createResepController(
  authUser: AuthUser,
  body: CreateResepBody
): Promise<Response> {
  const {
    id_kategori,
    judul,
    deskripsi_singkat,
    url_gambar,
    bahan,
    langkah,
    waktu_masak_menit,
    porsi,
    tingkat_kesulitan,
    tag,
    ditayangkan = true,
  } = body;

  // Validasi field wajib
  if (!judul?.trim()) return errorResponse("Judul resep wajib diisi.", 400);
  if (!url_gambar?.trim()) return errorResponse("URL gambar wajib diisi.", 400);
  if (!bahan?.trim()) return errorResponse("Bahan-bahan wajib diisi.", 400);
  if (!langkah?.trim()) return errorResponse("Langkah-langkah wajib diisi.", 400);

  // Validasi kategori jika diberikan
  if (id_kategori) {
    const { data: kategori } = await supabaseAdmin
      .from("kategori_resep")
      .select("id_kategori")
      .eq("id_kategori", id_kategori)
      .single();

    if (!kategori) {
      return errorResponse("Kategori tidak ditemukan.", 404);
    }
  }

  const { data: resep, error } = await supabaseAdmin
    .from("resep")
    .insert({
      id_pengguna: authUser.pengguna.id_pengguna,
      id_kategori: id_kategori || null,
      judul: judul.trim(),
      deskripsi_singkat: deskripsi_singkat?.trim() || null,
      url_gambar: url_gambar.trim(),
      bahan: bahan.trim(),
      langkah: langkah.trim(),
      waktu_masak_menit: waktu_masak_menit || null,
      porsi: porsi || null,
      tingkat_kesulitan: tingkat_kesulitan || null,
      tag: tag || null,
      ditayangkan,
    })
    .select(RESEP_SELECT)
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal membuat resep.");
  }

  return successResponse(resep, "Resep berhasil dibuat.", 201);
}

/**
 * PUT /api/resep/:id
 * Perbarui resep (hanya pemilik atau admin)
 */
export async function updateResepController(
  authUser: AuthUser,
  idResep: number,
  body: UpdateResepBody
): Promise<Response> {
  // Cek apakah resep ada dan milik pengguna ini
  const { data: existing, error: findError } = await supabaseAdmin
    .from("resep")
    .select("id_resep, id_pengguna")
    .eq("id_resep", idResep)
    .single();

  if (findError || !existing) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  const isOwner = existing.id_pengguna === authUser.pengguna.id_pengguna;
  const isAdmin = authUser.pengguna.peran === "admin";

  if (!isOwner && !isAdmin) {
    return forbiddenResponse("Kamu tidak memiliki izin untuk mengedit resep ini.");
  }

  // Validasi kategori jika diberikan
  if (body.id_kategori) {
    const { data: kategori } = await supabaseAdmin
      .from("kategori_resep")
      .select("id_kategori")
      .eq("id_kategori", body.id_kategori)
      .single();

    if (!kategori) {
      return errorResponse("Kategori tidak ditemukan.", 404);
    }
  }

  const updateData: UpdateResepBody & { diubah_pada: string } = {
    ...body,
    diubah_pada: new Date().toISOString(),
  };

  const { data: resep, error } = await supabaseAdmin
    .from("resep")
    .update(updateData)
    .eq("id_resep", idResep)
    .select(RESEP_SELECT)
    .single();

  if (error) {
    return serverErrorResponse(error, "Gagal memperbarui resep.");
  }

  return successResponse(resep, "Resep berhasil diperbarui.");
}

/**
 * DELETE /api/resep/:id
 * Hapus resep (hanya pemilik atau admin)
 */
export async function deleteResepController(
  authUser: AuthUser,
  idResep: number
): Promise<Response> {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("resep")
    .select("id_resep, id_pengguna")
    .eq("id_resep", idResep)
    .single();

  if (findError || !existing) {
    return notFoundResponse("Resep tidak ditemukan.");
  }

  const isOwner = existing.id_pengguna === authUser.pengguna.id_pengguna;
  const isAdmin = authUser.pengguna.peran === "admin";

  if (!isOwner && !isAdmin) {
    return forbiddenResponse("Kamu tidak memiliki izin untuk menghapus resep ini.");
  }

  const { error } = await supabaseAdmin
    .from("resep")
    .delete()
    .eq("id_resep", idResep);

  if (error) {
    return serverErrorResponse(error, "Gagal menghapus resep.");
  }

  return successResponse(null, "Resep berhasil dihapus.");
}

/**
 * GET /api/resep/saya
 * Ambil semua resep milik pengguna yang sedang login (termasuk yang disembunyikan)
 */
export async function getResepSayaController(
  authUser: AuthUser,
  page: number = 1,
  limit: number = 10
): Promise<Response> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("resep")
    .select(RESEP_SELECT, { count: "exact" })
    .eq("id_pengguna", authUser.pengguna.id_pengguna)
    .order("dibuat_pada", { ascending: false })
    .range(from, to);

  if (error) {
    return serverErrorResponse(error, "Gagal mengambil resep Anda.");
  }

  const total = count || 0;
  return Response.json({
    success: true,
    message: "Resep Anda berhasil diambil.",
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
