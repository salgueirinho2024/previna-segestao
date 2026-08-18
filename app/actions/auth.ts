"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyLogin } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  let user;
  try {
    user = await verifyLogin(email, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao conectar no banco de dados." };
  }

  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
