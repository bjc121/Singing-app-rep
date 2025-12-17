import { cookies } from "next/headers";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const createBrowserSupabase = () => createClientComponentClient<Database>();

export const createServerSupabase = () => createServerComponentClient<Database>({ cookies });

export const createServiceSupabase = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
