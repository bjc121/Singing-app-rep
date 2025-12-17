import { cookies } from "next/headers";
import { createServerSupabase } from "./supabase";

export async function getSession() {
  const supabase = createServerSupabase();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
