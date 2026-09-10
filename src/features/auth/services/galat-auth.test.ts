import { AuthApiError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { pesanGalatAuth } from "./galat-auth";

describe("pesanGalatAuth", () => {
  it("memetakan invalid_credentials ke pesan kredensial salah", () => {
    const hasil = pesanGalatAuth(
      new AuthApiError("Invalid login credentials", 400, "invalid_credentials"),
    );

    expect(hasil).toMatchObject({ pesan: "Email atau sandi salah.", kode: "invalid_credentials" });
  });

  it("memetakan email_not_confirmed ke pesan konfirmasi email", () => {
    const hasil = pesanGalatAuth(
      new AuthApiError("Email not confirmed", 400, "email_not_confirmed"),
    );

    expect(hasil.pesan).toContain("konfirmasi");
    expect(hasil.kode).toBe("email_not_confirmed");
  });

  it("memetakan user_already_exists ke pesan sudah terdaftar", () => {
    const hasil = pesanGalatAuth(
      new AuthApiError("User already registered", 400, "user_already_exists"),
    );

    expect(hasil.judul).toContain("sudah punya akun");
  });

  it("memetakan weak_password ke pesan syarat panjang sandi", () => {
    const hasil = pesanGalatAuth(
      new AuthApiError("Password should be at least 8 characters", 400, "weak_password"),
    );

    expect(hasil.pesan).toContain("8 karakter");
  });

  it("memetakan over_email_send_rate_limit ke pesan coba lagi nanti", () => {
    const hasil = pesanGalatAuth(
      new AuthApiError("Email rate limit exceeded", 429, "over_email_send_rate_limit"),
    );

    expect(hasil.pesan).toBe("Tunggu beberapa menit, lalu coba lagi.");
  });

  it("memetakan validation_failed ke pesan periksa kembali", () => {
    const hasil = pesanGalatAuth(new AuthApiError("Validation failed", 400, "validation_failed"));

    expect(hasil.pesan).toContain("Periksa kembali");
  });

  it("jatuh ke fallback untuk kode AuthError asing, kode mentah tetap dikembalikan", () => {
    const hasil = pesanGalatAuth(new AuthApiError("Unknown", 400, "kode_asing_zzz"));

    expect(hasil.pesan).toBe("Coba lagi. Kalau tetap gagal, muat ulang halaman.");
    expect(hasil.kode).toBe("kode_asing_zzz");
  });

  it("jatuh ke fallback tanpa melempar untuk galat bukan AuthError", () => {
    const hasil = pesanGalatAuth(new TypeError("Failed to fetch"));

    expect(hasil.pesan).toBe("Coba lagi. Kalau tetap gagal, muat ulang halaman.");
    expect(hasil.kode).toBeUndefined();
  });
});
