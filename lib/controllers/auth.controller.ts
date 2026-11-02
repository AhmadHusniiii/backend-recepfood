import { supabaseAdmin } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/helpers/response";
import { RegisterBody, LoginBody } from "@/lib/types";

/**
 * POST /api/auth/register
 * Mendaftarkan pengguna baru
 */
export async function registerController(body: RegisterBody): Promise<Response> {
  const { email, password, username, jenis_makanan_favorit } = body;

  // Validasi input
  if (!email || !password || !username) {
    return errorResponse("Email, password, dan username wajib diisi.", 400);
  }

  if (password.length < 8) {
    return errorResponse("Password minimal 8 karakter.", 400);
  }

  // Cek apakah username sudah dipakai
  const { data: existingUser } = await supabaseAdmin
    .from("pengguna")
    .select("id_pengguna")
    .eq("username", username)
    .single();

  if (existingUser) {
    return errorResponse("Username sudah digunakan.", 409);
  }

  // Buat akun di Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Langsung verifikasi email
    });

  if (authError || !authData.user) {
    if (authError?.message?.includes("already registered")) {
      return errorResponse("Email sudah terdaftar.", 409);
    }
    return serverErrorResponse(authError, "Gagal membuat akun.");
  }

  // Buat profil pengguna di tabel pengguna
  const { data: pengguna, error: profilError } = await supabaseAdmin
    .from("pengguna")
    .insert({
      auth_id: authData.user.id,
      username,
      jenis_makanan_favorit: jenis_makanan_favorit || null,
      peran: "user",
    })
    .select()
    .single();

  if (profilError) {
    // Rollback: hapus akun auth jika gagal buat profil
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return serverErrorResponse(profilError, "Gagal membuat profil pengguna.");
  }

  return successResponse(
    { pengguna },
    "Registrasi berhasil! Silakan login.",
    201
  );
}

/**
 * POST /api/auth/login
 * Login pengguna dan dapatkan token JWT
 */
export async function loginController(body: LoginBody): Promise<Response> {
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse("Email dan password wajib diisi.", 400);
  }

  // Login dengan Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (authError || !authData.user || !authData.session) {
    return errorResponse("Email atau password salah.", 401);
  }

  // Ambil data profil pengguna
  const { data: pengguna, error: profilError } = await supabaseAdmin
    .from("pengguna")
    .select("*")
    .eq("auth_id", authData.user.id)
    .single();

  if (profilError || !pengguna) {
    return errorResponse("Profil pengguna tidak ditemukan.", 404);
  }

  return successResponse(
    {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      pengguna,
    },
    "Login berhasil."
  );
}

/**
 * POST /api/auth/logout
 * Logout pengguna (invalidate token)
 */
export async function logoutController(authId: string): Promise<Response> {
  try {
    // Invalidate semua session user
    await supabaseAdmin.auth.admin.signOut(authId, "global");
    return successResponse(null, "Logout berhasil.");
  } catch (error) {
    return serverErrorResponse(error, "Gagal logout.");
  }
}

/**
 * POST /api/auth/refresh
 * Refresh access token menggunakan refresh token
 */
export async function refreshTokenController(
  refreshToken: string
): Promise<Response> {
  if (!refreshToken) {
    return errorResponse("Refresh token wajib diisi.", 400);
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return errorResponse("Refresh token tidak valid atau sudah kadaluarsa.", 401);
  }

  return successResponse(
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
    "Token berhasil diperbarui."
  );
}
