/**
 * GET /api
 * Health check & info API
 */
export async function GET(): Promise<Response> {
  return Response.json({
    success: true,
    message: "API Resep Makanan berjalan dengan baik! 🍳",
    versi: "1.0.0",
    waktu: new Date().toISOString(),
    endpoints: {
      auth: {
        "POST /api/auth/register": "Daftar akun baru",
        "POST /api/auth/login": "Login & dapatkan token",
        "POST /api/auth/logout": "Logout (butuh token)",
        "POST /api/auth/refresh": "Perbarui access token",
      },
      pengguna: {
        "GET /api/pengguna/me": "Profil sendiri (butuh token)",
        "PUT /api/pengguna/me": "Perbarui profil (butuh token)",
        "GET /api/pengguna/:id": "Profil publik pengguna",
        "GET /api/pengguna": "Semua pengguna (admin only)",
        "DELETE /api/pengguna/:id": "Hapus pengguna (admin only)",
      },
      kategori: {
        "GET /api/kategori": "Daftar semua kategori",
        "GET /api/kategori/:id": "Detail kategori",
        "POST /api/kategori": "Buat kategori (admin only)",
        "PUT /api/kategori/:id": "Perbarui kategori (admin only)",
        "DELETE /api/kategori/:id": "Hapus kategori (admin only)",
      },
      resep: {
        "GET /api/resep": "Daftar resep (filter: search, id_kategori, tingkat_kesulitan, id_pengguna)",
        "POST /api/resep": "Buat resep baru (butuh token)",
        "GET /api/resep/saya": "Resep milik saya (butuh token)",
        "GET /api/resep/:id": "Detail resep",
        "PUT /api/resep/:id": "Perbarui resep (pemilik/admin)",
        "DELETE /api/resep/:id": "Hapus resep (pemilik/admin)",
      },
      rating: {
        "GET /api/resep/:id/rating": "Semua rating resep + statistik",
        "POST /api/resep/:id/rating": "Beri/perbarui rating (butuh token)",
        "DELETE /api/resep/:id/rating": "Hapus rating saya (butuh token)",
      },
      favorit: {
        "GET /api/favorit": "Daftar favorit saya (butuh token)",
        "GET /api/favorit/:id_resep": "Cek status favorit (butuh token)",
        "POST /api/favorit/:id_resep": "Tambah ke favorit (butuh token)",
        "DELETE /api/favorit/:id_resep": "Hapus dari favorit (butuh token)",
      },
      unduhan: {
        "GET /api/unduhan": "Riwayat unduhan offline (butuh token)",
        "DELETE /api/unduhan": "Hapus semua unduhan (butuh token)",
        "POST /api/unduhan/:id_resep": "Simpan untuk offline (butuh token)",
        "DELETE /api/unduhan/:id_resep": "Hapus unduhan (butuh token)",
      },
    },
  });
}
