"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";
import { Lock } from "lucide-react";

const initialState: { error?: string } = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-4 border-giri-black bg-giri-red shadow-brutal">
          <Lock className="h-8 w-8 text-giri-white" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Admin Login
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-gray-500">
          Giri-giri Onigiri
        </p>
      </div>

      <form
        action={formAction}
        className="border-4 border-giri-black bg-giri-white p-6 shadow-brutal-lg md:p-8"
      >
        <label className="mb-3 block text-sm font-black uppercase tracking-wider text-giri-black">
          Password Admin
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="Masukkan password..."
          className="brutal-input mb-4 w-full border-4 border-giri-black bg-giri-white p-3 font-medium transition-shadow"
        />

        {state.error && (
          <div className="mb-4 border-4 border-giri-red bg-[#ffeded] p-3">
            <p className="text-sm font-bold text-giri-red">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full border-4 border-giri-black bg-giri-red px-6 py-4 text-lg font-black uppercase tracking-wider text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm disabled:opacity-50"
        >
          {pending ? "Memproses..." : "Masuk →"}
        </button>
      </form>
    </div>
  );
}
