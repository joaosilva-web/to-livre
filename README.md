# 🗓️ TôLivre — Agendamentos sem complicação

**TôLivre** é uma plataforma SaaS (Software as a Service) feita para profissionais autônomos que querem ter controle total dos seus agendamentos, lembretes e cobranças, sem depender de atendentes, WhatsApp ou processos manuais.

A proposta é simples: **automatizar tarefas rotineiras e libertar tempo para que o profissional foque no que realmente importa — atender bem seus clientes.**

---

## 🚀 Funcionalidades

- 📅 **Agendamento online**  
  Seus clientes podem visualizar sua disponibilidade e agendar serviços de forma prática, a qualquer momento.

- 🔔 **Lembretes automáticos**  
  Notificações por e-mail, WhatsApp ou SMS para reduzir faltas e esquecimentos.

- 💰 **Cobrança automatizada**  
  Gere links de pagamento, envie cobranças recorrentes e tenha integração com plataformas como Pix, cartão e boleto.

- 🗓️ **Gestão de agenda inteligente**  
  Bloqueios de horários, reagendamentos e controle total da sua disponibilidade.

- 📊 **Dashboard de métricas**  
  Acompanhe seus atendimentos, faturamento e performance com gráficos e relatórios.

- 👥 **Multiusuário (em breve)**  
  Perfeito para pequenos negócios com mais de um profissional.

---

## 🏗️ Arquitetura e Tecnologias

O TôLivre é construído com uma stack moderna, escalável e preparada para SaaS de alta performance.

### ⚙️ Frontend

- **Next.js 14 (App Router + Server Actions)**
- **React**
- **Tailwind CSS**
- **Framer Motion** (animações fluidas)
- **Zod + React Hook Form** (validação robusta de formulários)

### 🧠 Backend

- **API Route + Server Actions do Next.js**
- **Prisma ORM**
- **Banco de Dados PostgreSQL**
- **Redis** (para cache e filas futuras)
- **Auth personalizada ou NextAuth (em definição)**
- **Rate Limiting, reCAPTCHA e Double Opt-in** (segurança e proteção contra spam)

### ☁️ Infraestrutura

- **Docker + Docker Compose** (para ambientes consistentes)
- **Hospedagem:** Vercel (Frontend e API) + Neon (Banco/Postgres)
- **Armazenamento de arquivos:** (em definição)

### 🔒 Segurança

- Proteções contra brute-force e spam
- Confirmação de e-mail (double opt-in)
- Hash de senhas (bcrypt ou argon2)
- Autorização baseada em roles (admin, profissional, cliente)

---

## 🗂️ Organização do projeto

```
/app              → Rotas e páginas (Next.js App Router)
/components       → Componentes reutilizáveis (UI)
/hooks            → Hooks customizados
/libs             → Configurações externas (prisma, auth, recaptcha...)
/services         → Serviços e integrações externas (ex: envio de e-mails, pagamento)
/controllers      → Regras de negócio (server side)
/validators       → Schemas Zod e validações
/public           → Arquivos públicos (imagens, favicon, etc.)
/prisma           → Esquema do banco de dados (schema.prisma)
```

---

## 🏗️ Como rodar o projeto localmente

### Pré-requisitos:

- Node.js 18+
- Docker instalado
- Yarn ou npm

### Passos:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tolivre.git
cd tolivre

# Instale as dependências
yarn install

# Crie o arquivo .env
cp .env.example .env

# Suba o banco de dados
docker-compose up -d

# Rode as migrations
npx prisma migrate dev

# Rode o projeto
yarn dev
```

---

## 🌎 Variáveis de ambiente

Exemplo de `.env`:

```
POSTGRES_URL="postgresql://postgres@localhost:5432/tolivre-dev"
POSTGRES_URL_NON_POOLING="postgresql://postgres@localhost:5432/tolivre-dev"

RECAPTCHA_SECRET_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

---

## 🚧 Status do projeto

- ✅ Landing page
- 🏗️ Em desenvolvimento:
  - MVP funcional: Cadastro, login, agendamento e dashboard básico
  - Integração com meios de pagamento (Pix, cartão, boleto)
  - Área do cliente (para que clientes possam reagendar ou cancelar)
  - Dashboard financeiro
  - Envio de lembretes automáticos (WhatsApp, e-mail e SMS)

---

## 🧠 Roadmap

- [ ] Lançamento do MVP
- [ ] Integração com meios de pagamento
- [ ] Suporte a múltiplos profissionais (plano avançado)
- [ ] Aplicativo mobile (React Native)
- [ ] Marketplace de serviços (opcional)

---

## 💙 Feito com carinho por João

[🔗 LinkedIn](https://www.linkedin.com/in/joaosilvadeveloper/) • [🐙 GitHub](https://github.com/joaosilva-web)
