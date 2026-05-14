import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-6 font-heading text-4xl font-black text-giri-black">Admin Login</h1>
      <LoginForm />
    </section>
  );
}
