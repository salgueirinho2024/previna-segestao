# Previna-Se Gestão

Sistema de gestão para consultoria de segurança do trabalho: controle de visitas
(histórico, vencimento e alertas) e atribuição de tarefas por técnico, com login
por perfil (Técnico de Segurança / Assistente).

Feito em Next.js 16 + Tailwind, banco Neon (Postgres), visual inspirado no Pipefy
(kanban de visitas). Funciona como site e como PWA instalável — pronta para virar
APK com Capacitor (passo a passo abaixo).

---

## 1. Criar o banco no Neon

1. Crie uma conta em https://neon.tech e um projeto novo.
2. No painel do projeto, vá em **Connection Details** e copie a **connection string**
   (algo como `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`).
3. Abra o **SQL Editor** do Neon, cole o conteúdo do arquivo `db/schema.sql` deste
   projeto e rode. Isso cria as tabelas (`companies`, `visits`, `tasks`, `users`).

**Criar o primeiro usuário:**
```bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA', 10))"
```
Copie o hash gerado e rode no SQL Editor do Neon:
```sql
insert into users (name, email, password_hash, role) values
  ('Nome Sobrenome', 'email@dominio.com', 'HASH_GERADO_ACIMA', 'TECNICO');
```
(troque `role` para `ASSISTENTE` se for o caso).

## 2. Rodar localmente

```bash
cd previna
cp .env.example .env.local
```

Edite `.env.local` e cole:
- `DATABASE_URL` — a connection string do Neon (passo 1)
- `AUTH_SECRET` — qualquer texto aleatório grande (rode
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  pra gerar um)

Depois:
```bash
npm install
npm run dev
```
Acesse http://localhost:3000 — vai redirecionar pro login.

## 3. Publicar na web (Vercel — recomendado)

1. Suba este projeto pro GitHub.
2. Em https://vercel.com, importe o repositório.
3. Em **Environment Variables**, adicione `DATABASE_URL` e `AUTH_SECRET` (os
   mesmos valores do `.env.local`).
4. Deploy. Pronto — o sistema já fica acessível de qualquer navegador, celular
   incluso, e instalável como app (PWA) direto do Chrome/Safari.

## 4. Gerar o APK (site empacotado, via Capacitor)

O app mobile é o mesmo sistema web empacotado — mesma tela, mesmos dados, um
único lugar pra manter. Depois que o site estiver publicado (passo 3), com o
Android Studio instalado na sua máquina:

```bash
npm install -D @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Previna-Se" "com.previnase.gestao" --web-dir=out
```

No `capacitor.config.ts` gerado, aponte pro site publicado em vez de arquivos
locais (assim o app sempre mostra a versão mais atual, sem precisar gerar novo
APK a cada mudança):

```ts
const config = {
  appId: "com.previnase.gestao",
  appName: "Previna-Se",
  server: { url: "https://SEU-DOMINIO-NA-VERCEL.vercel.app", cleartext: false },
};
export default config;
```

Depois:
```bash
npx cap add android
npx cap sync
npx cap open android
```
Isso abre o Android Studio — lá você gera o APK (Build > Build Bundle(s) / APK(s) > Build APK(s)).
Os ícones já estão em `public/icons/` e no `manifest.json`, então o app já nasce
com a marca certa.

## 5. Estrutura do projeto

```
app/
  login/              tela de login
  (app)/dashboard/    painel com alertas e tarefas do dia
  (app)/empresas/     lista, cadastro e detalhe de cada empresa
  (app)/visitas/      kanban de visitas (estilo Pipefy) + agendamento
  (app)/tarefas/      tarefas por responsável
  actions/            server actions (login, empresas, visitas, tarefas)
lib/
  db.ts               conexão com o Neon
  auth.ts             sessão (cookie assinado), login
  data.ts             consultas ao banco + regras de urgência/vencimento
db/schema.sql          schema do banco
public/icons/          logos, já nos tamanhos certos pro PWA
public/manifest.json   configuração do app instalável
```

## 6. O que já funciona

- Login por perfil (Técnico de Segurança / Assistente), sessão via cookie.
- Cadastro de empresas com periodicidade de retorno configurável.
- Agendamento de visitas com responsável, histórico completo, e campo
  "o que foi feito" ao concluir.
- Alertas automáticos: visita atrasada (vermelho), vencendo em até 5 dias
  (laranja), no prazo (verde) — calculado a partir da data agendada, sem
  precisar de nenhuma tarefa manual de "gerar alerta".
- Kanban de visitas (Agendada → Em andamento → Concluída), como no Pipefy.
- Atribuição de tarefas por pessoa e por empresa, com prazo e status.

## 7. Próximos passos sugeridos (não incluídos ainda)

- Notificações por e-mail/WhatsApp quando uma visita estiver perto de vencer.
- Upload de laudos/relatórios em cada visita.
- Edição/exclusão de empresas e visitas (hoje o fluxo cobre criar e avançar
  status; dá pra adicionar telas de edição rapidamente em cima do que já existe).
- Tela de gestão de usuários (criar/editar/trocar senha) direto pelo sistema.
