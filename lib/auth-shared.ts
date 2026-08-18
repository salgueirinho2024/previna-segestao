export type Role = "TECNICO" | "ASSISTENTE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const ROLE_LABEL: Record<Role, string> = {
  TECNICO: "Técnico de Segurança",
  ASSISTENTE: "Assistente",
};
