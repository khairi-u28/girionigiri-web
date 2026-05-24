"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  prevState: { error?: string },
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");

  if (password === process.env.OWNER_PASSWORD) {
    (await cookies()).set("admin_role", "owner", {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin/dashboard");
  }

  if (password === process.env.OPERATOR_PASSWORD) {
    (await cookies()).set("admin_role", "operator", {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin/dashboard");
  }

  return { error: "Password salah" };
}
