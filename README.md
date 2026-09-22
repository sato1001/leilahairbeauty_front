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
- `/`: área do cliente após login
- `/admin`: área administrativa apenas para usuários com role `ADMIN`

## Área administrativa: primeiro módulo

A área `/admin` foi implementada com proteção por role e gestão do catálogo de serviços seguindo o contrato real do backend:

- `/admin`: dashboard administrativo
- `/admin/servicos`: lista os serviços ativos disponíveis
- `/admin/servicos/novo`: criação de serviço
- `/admin/servicos/[id]/editar`: edição de serviço
- exclusão de serviço via `DELETE /services/:id` (soft delete, sem rota de reativação)

As ações respeitam as regras reais do backend: `POST /services`, `PATCH /services/:id` e `DELETE /services/:id` exigem autenticação e role `ADMIN`.

## Integração com o backend

O frontend se comunica com o backend em `http://localhost:3001` pelos endpoints:

- `POST /auth/login`
- `POST /auth/register`
- `GET /services`
- `GET /services/:id`
- `POST /services`
- `PATCH /services/:id`
- `DELETE /services/:id`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id`
- `DELETE /appointments/:id`

O cadastro retorna sucesso sem JWT; após concluir, a aplicação redireciona para `/login?registered=true`.

## Área do cliente: Meus Agendamentos

A área do cliente inclui:

- listagem de agendamentos do usuário autenticado;
- filtro por status;
- detalhes do agendamento;
- alteração de data/horário e serviços;
- cancelamento lógico com confirmação;
- atualização do cache após alteração/cancelamento.

As regras de autorização e validação são respeitadas conforme o backend real, especialmente para limitações de 48 horas e acesso restrito ao próprio cliente.
