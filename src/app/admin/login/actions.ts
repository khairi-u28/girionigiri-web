"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  prevState: { error?: string },
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");
  const ownerPassword = process.env.OWNER_PASSWORD ?? process.env.ADMIN_PASSWORD;
  const operatorPassword = process.env.OPERATOR_PASSWORD ?? process.env.ADMIN_PASSWORD;

  if (password === ownerPassword) {
    (await cookies()).set("admin_role", "owner", {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin/dashboard");
  }

  if (password === operatorPassword) {
    (await cookies()).set("admin_role", "operator", {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin/dashboard");
  }

  return { error: "Password salah" };
}
