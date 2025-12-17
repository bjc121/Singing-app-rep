"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthForm({ view }: { view: "sign_in" | "sign_up" }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="card mx-auto mt-8 max-w-lg p-8">
      <h1 className="text-2xl font-semibold">{view === "sign_in" ? "Sign in" : "Create account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Secure Supabase Auth UI for quick onboarding.</p>
      <div className="mt-6">
        <Auth
          supabaseClient={supabase}
          view={view}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo="/app"
          socialLayout="horizontal"
          magicLink
          localization={{
            variables: {
              sign_in: { button_label: loading ? "Signing in..." : "Sign in" }
            }
          }}
          theme="light"
          showLinks={false}
          otpType="email"
          onViewChange={() => setLoading(false)}
          handleCodeInApp
        />
      </div>
      <button
        onClick={() => {
          setLoading(true);
          router.refresh();
        }}
        className="btn-secondary mt-6"
      >
        Refresh session
      </button>
    </div>
  );
}
