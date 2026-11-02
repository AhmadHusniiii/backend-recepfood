# 🍳 Backend API - Aplikasi Resep Makanan

Backend REST API untuk aplikasi resep makanan menggunakan **Next.js 16 App Router** + **Supabase**.

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router, Route Handlers)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **ORM**: Supabase JS Client (bawaan Supabase)
- **Language**: TypeScript
- **Runtime**: Node.js / Bun

---

## 🚀 Setup

### 1. Install dependencies
```bash
bun install
```

### 2. Konfigurasi environment
Salin `.env.example` menjadi `.env.local` dan isi nilainya:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> ⚠️ **PENTING**: `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server-side. JANGAN expose ke client!

### 3. Jalankan development server
```bash
bun run dev
```

API tersedia di: `http://localhost:3000/api`

---

## 📁 Struktur Project

```
backend-learn1/
├── app/
│   └── api/
│       ├── route.ts                        # GET /api (health check)
│       ├── auth/
│       │   ├── register/route.ts           # POST /api/auth/register
│       │   ├── login/route.ts              # POST /api/auth/login
│       │   ├── logout/route.ts             # POST /api/auth/logout
│       │   └── refresh/route.ts            # POST /api/auth/refresh
│       ├── pengguna/
│       │   ├── route.ts                    # GET /api/pengguna
│       │   ├── me/route.ts                 # GET/PUT /api/pengguna/me
│       │   └── [id]/route.ts               # GET/DELETE /api/pengguna/:id
│       ├── kategori/
│       │   ├── route.ts                    # GET/POST /api/kategori
│       │   └── [id]/route.ts               # GET/PUT/DELETE /api/kategori/:id
│       ├── resep/
│       │   ├── route.ts                    # GET/POST /api/resep
│       │   ├── saya/route.ts               # GET /api/resep/saya
│       │   └── [id]/
│       │       ├── route.ts                # GET/PUT/DELETE /api/resep/:id
│       │       └── rating/route.ts         # GET/POST/DELETE /api/resep/:id/rating
│       ├── favorit/
│       │   ├── route.ts                    # GET /api/favorit
│       │   └── [id_resep]/route.ts         # GET/POST/DELETE /api/favorit/:id_resep
│       └── unduhan/
│           ├── route.ts                    # GET/DELETE /api/unduhan
│           └── [id_resep]/route.ts         # POST/DELETE /api/unduhan/:id_resep
│
└── lib/
    ├── supabase/
    │   ├── client.ts                       # Supabase client (browser)
    │   └── server.ts                       # Supabase admin client (server)
    ├── types/index.ts                      # Semua tipe TypeScript
    ├── helpers/response.ts                 # Helper response API
    ├── middleware/auth.ts                  # Verifikasi JWT token
    └── controllers/
        ├── auth.controller.ts              # Logic auth
        ├── pengguna.controller.ts          # Logic manajemen pengguna
        ├── kategori.controller.ts          # Logic CRUD kategori
        ├── resep.controller.ts             # Logic CRUD resep
        ├── favorit.controller.ts           # Logic favorit
        ├── rating.controller.ts            # Logic rating & komentar
        └── unduhan.controller.ts           # Logic unduhan offline
```

---

## 🔐 Autentikasi

API menggunakan **Bearer Token (JWT)** dari Supabase Auth.

```
Authorization: Bearer <access_token>
```

---

## 📖 Semua Endpoint

### Auth
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login & dapat token |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/refresh` | ❌ | Perbarui access token |

### Pengguna
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/pengguna/me` | ✅ | Profil sendiri |
| PUT | `/api/pengguna/me` | ✅ | Perbarui profil |
| GET | `/api/pengguna/:id` | ❌ | Profil publik |
| GET | `/api/pengguna` | ✅ Admin | Semua pengguna |
| DELETE | `/api/pengguna/:id` | ✅ Admin | Hapus pengguna |

### Kategori
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/kategori` | ❌ | Daftar kategori |
| GET | `/api/kategori/:id` | ❌ | Detail kategori |
| POST | `/api/kategori` | ✅ Admin | Buat kategori |
| PUT | `/api/kategori/:id` | ✅ Admin | Perbarui kategori |
| DELETE | `/api/kategori/:id` | ✅ Admin | Hapus kategori |

### Resep
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/resep` | ❌ | Daftar resep + filter |
| POST | `/api/resep` | ✅ | Buat resep |
| GET | `/api/resep/saya` | ✅ | Resep milik saya |
| GET | `/api/resep/:id` | ❌ | Detail resep |
| PUT | `/api/resep/:id` | ✅ Pemilik/Admin | Perbarui resep |
| DELETE | `/api/resep/:id` | ✅ Pemilik/Admin | Hapus resep |

### Rating
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/resep/:id/rating` | ❌ | Rating + statistik |
| POST | `/api/resep/:id/rating` | ✅ | Beri/perbarui rating |
| DELETE | `/api/resep/:id/rating` | ✅ | Hapus rating saya |

### Favorit
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/favorit` | ✅ | Daftar favorit saya |
| GET | `/api/favorit/:id_resep` | ✅ | Cek status favorit |
| POST | `/api/favorit/:id_resep` | ✅ | Tambah favorit |
| DELETE | `/api/favorit/:id_resep` | ✅ | Hapus favorit |

### Unduhan Offline
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/unduhan` | ✅ | Riwayat unduhan |
| DELETE | `/api/unduhan` | ✅ | Hapus semua unduhan |
| POST | `/api/unduhan/:id_resep` | ✅ | Simpan untuk offline |
| DELETE | `/api/unduhan/:id_resep` | ✅ | Hapus unduhan |

---

## 📋 Format Response

**Sukses:**
```json
{ "success": true, "message": "...", "data": {} }
```

**Pagination:**
```json
{ "success": true, "message": "...", "data": [], "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }
```

**Error:**
```json
{ "success": false, "message": "...", "error": "detail error" }
```
