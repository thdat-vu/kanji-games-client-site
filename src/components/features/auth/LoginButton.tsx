"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Provider = "google" | "github";

interface LoginButtonProps {
  provider?: Provider;
}

export function LoginButton({ provider = "google" }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button className="btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Redirecting..." : "Sign in with Google"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

