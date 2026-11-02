import { supabaseAdmin } from "@/lib/supabase/server";
import { Pengguna } from "@/lib/types";
import { NextRequest } from "next/server";

// Interface untuk data user yang sudah terverifikasi dari token
export interface AuthUser {
  auth_id: string;
  pengguna: Pengguna;
}

/**
 * Verifikasi token JWT dari header Authorization
 * Mengembalikan data user jika valid, null jika tidak valid
 */
export async function verifyAuth(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    // Verifikasi token dengan Supabase Auth
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return null;

    // Ambil data pengguna dari tabel pengguna
    const { data: pengguna, error: penggunaError } = await supabaseAdmin
      .from("pengguna")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (penggunaError || !pengguna) return null;

    return {
      auth_id: user.id,
      pengguna: pengguna as Pengguna,
    };
  } catch {
    return null;
  }
}

/**
 * Cek apakah user adalah admin
 */
export function isAdmin(authUser: AuthUser): boolean {
  return authUser.pengguna.peran === "admin";
}
