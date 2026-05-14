"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";

const initialState: { error?: string } = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="border-4 border-giri-black bg-giri-white p-6 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <label className="mb-2 block font-heading font-bold text-giri-black">Password Admin</label>
      <input
        name="password"
        type="password"
        required
        className="w-full border-4 border-giri-black bg-giri-white p-2"
      />
      {state.error ? <p className="mt-2 text-sm text-giri-red">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full border-4 border-giri-black bg-giri-red px-4 py-3 font-heading font-bold text-giri-white"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
