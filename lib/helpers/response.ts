import { ApiResponse } from "@/lib/types";

// Helper untuk membuat response sukses
export function successResponse<T>(
  data: T,
  message: string = "Berhasil",
  status: number = 200
): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return Response.json(body, { status });
}

// Helper untuk membuat response error
export function errorResponse(
  message: string,
  status: number = 400,
  error?: string
): Response {
  const body: ApiResponse = {
    success: false,
    message,
    error,
  };
  return Response.json(body, { status });
}

// Helper khusus untuk 401 Unauthorized
export function unauthorizedResponse(
  message: string = "Tidak terotorisasi. Silakan login."
): Response {
  return errorResponse(message, 401);
}

// Helper khusus untuk 403 Forbidden
export function forbiddenResponse(
  message: string = "Akses ditolak."
): Response {
  return errorResponse(message, 403);
}

// Helper khusus untuk 404 Not Found
export function notFoundResponse(
  message: string = "Data tidak ditemukan."
): Response {
  return errorResponse(message, 404);
}

// Helper khusus untuk 500 Internal Server Error
export function serverErrorResponse(
  error: unknown,
  message: string = "Terjadi kesalahan pada server."
): Response {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error("[SERVER ERROR]", errorMsg);
  return errorResponse(message, 500, errorMsg);
}
