// =====================================================
// TIPE DATA UNTUK DATABASE RESEP
// =====================================================

// Tabel: pengguna
export interface Pengguna {
  id_pengguna: number;
  auth_id: string;
  username: string;
  url_avatar?: string | null;
  jenis_makanan_favorit?: string | null;
  peran: "user" | "admin";
  dibuat_pada?: string;
}

// Tabel: kategori_resep
export interface KategoriResep {
  id_kategori: number;
  nama_kategori: string;
  deskripsi_kategori?: string | null;
}

// Tabel: resep
export interface Resep {
  id_resep: number;
  id_pengguna?: number | null;
  id_kategori?: number | null;
  judul: string;
  deskripsi_singkat?: string | null;
  url_gambar: string;
  bahan: string;
  langkah: string;
  waktu_masak_menit?: number | null;
  porsi?: number | null;
  tingkat_kesulitan?: "mudah" | "sedang" | "sulit" | null;
  tag?: string[] | null;
  ditayangkan: boolean;
  dibuat_pada?: string;
  diubah_pada?: string;
  // Relasi (optional, dari join)
  pengguna?: Pick<Pengguna, "id_pengguna" | "username" | "url_avatar">;
  kategori_resep?: Pick<KategoriResep, "id_kategori" | "nama_kategori">;
}

// Tabel: favorit
export interface Favorit {
  id_favorit: number;
  id_pengguna: number;
  id_resep: number;
  dibuat_pada?: string;
  // Relasi (optional)
  resep?: Resep;
}

// Tabel: rating_resep
export interface RatingResep {
  id_rating: number;
  id_pengguna: number;
  id_resep: number;
  nilai_rating: 1 | 2 | 3 | 4 | 5;
  komentar?: string | null;
  dibuat_pada?: string;
  // Relasi (optional)
  pengguna?: Pick<Pengguna, "id_pengguna" | "username" | "url_avatar">;
}

// Tabel: unduhan_offline
export interface UnduhanOffline {
  id_unduhan: number;
  id_pengguna: number;
  id_resep: number;
  diunduh_pada?: string;
  // Relasi (optional)
  resep?: Resep;
}

// =====================================================
// TIPE UNTUK REQUEST BODY
// =====================================================

export interface RegisterBody {
  email: string;
  password: string;
  username: string;
  jenis_makanan_favorit?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateResepBody {
  id_kategori?: number;
  judul: string;
  deskripsi_singkat?: string;
  url_gambar: string;
  bahan: string;
  langkah: string;
  waktu_masak_menit?: number;
  porsi?: number;
  tingkat_kesulitan?: "mudah" | "sedang" | "sulit";
  tag?: string[];
  ditayangkan?: boolean;
}

export interface UpdateResepBody extends Partial<CreateResepBody> {}

export interface CreateRatingBody {
  nilai_rating: 1 | 2 | 3 | 4 | 5;
  komentar?: string;
}

export interface UpdateProfilBody {
  username?: string;
  url_avatar?: string;
  jenis_makanan_favorit?: string;
}

// =====================================================
// TIPE UNTUK RESPONSE API
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
