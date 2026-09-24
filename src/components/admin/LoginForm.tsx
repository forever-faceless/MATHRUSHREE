"use client";

import { Loader2, LogIn } from "lucide-react";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/forms";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <input id="username" name="username" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-danger-600/20 bg-danger-100 px-4 py-3 text-sm font-medium text-danger-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-olive w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Sign in
      </button>
    </form>
  );
}
