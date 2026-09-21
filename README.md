# Leila Hair & Beauty - Frontend

Frontend do sistema de salão desenvolvido com Next.js 16, App Router, React 19, TypeScript, Material UI e TanStack Query.

## Stack principal

- Next.js 16 + App Router
- React 19
- TypeScript
- Material UI (MUI)
- React Hook Form + Zod
- TanStack Query
- Fetch centralizado em cliente HTTP

## Arquitetura

A aplicação segue a abordagem feature-based, com módulos organizados em:

- `src/app` para rotas e páginas
- `src/components` para providers e elementos compartilhados
- `src/config` para configuração central do tema
- `src/features/auth` para autenticação (schemas, service, components, types)
- `src/lib/api` para o cliente HTTP unificado

## Variáveis de ambiente

Crie um arquivo `.env.local` a partir do `.env.example` e defina a base da API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em http://localhost:3000.

## Verificação

```bash
npm run lint
npm run build
```

## Fluxo de autenticação

- `/login`: acesso ao painel de login
- `/cadastro`: cadastro de novos clientes
- `/`: redireciona para `/login`

## Integração com o backend

O frontend se comunica com o backend em `http://localhost:3001` pelos endpoints:

- `POST /auth/login`
- `POST /auth/register`

O cadastro retorna sucesso sem JWT; após concluir, a aplicação redireciona para `/login?registered=true`.
