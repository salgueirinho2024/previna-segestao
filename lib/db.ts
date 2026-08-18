import { neon } from "@neondatabase/serverless";

// A connection string fica em DATABASE_URL (.env.local em dev, env var na Vercel em produção).
// Ela NÃO é lida aqui na hora do build — só quando uma query realmente roda,
// então o projeto builda mesmo antes de você colocar a chave do Neon.
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Adicione a connection string do Neon no arquivo .env.local (veja .env.example)."
    );
  }
  return neon(url);
}

type Row = Record<string, any>;

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  const fn = getSql();
  return fn(strings, ...values) as unknown as Promise<Row[]>;
}
