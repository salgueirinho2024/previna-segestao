export type Role = "DONO" | "TECNICO" | "ASSISTENTE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const ROLE_LABEL: Record<Role, string> = {
  DONO: "Dono",
  TECNICO: "Técnico de Segurança",
  ASSISTENTE: "Assistente",
};
