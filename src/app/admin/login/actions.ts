"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set("admin_token", process.env.ADMIN_TOKEN_VALUE ?? "admin-auth", {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
    });
    redirect("/admin/dashboard");
  }
  return { error: "Password salah" };
}
