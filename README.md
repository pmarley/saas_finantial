# SaaS Financial

Aplicação web para gerenciamento financeiro com autenticação de usuários.

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- n8n (backend)
- Supabase (banco de dados)

## Requisitos

- Node.js 18.17.0 ou superior
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_N8N_API_URL=http://localhost:5678
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:3000`

## Estrutura do Projeto

```
src/
  ├── app/              # Páginas da aplicação
  ├── components/       # Componentes React
  └── services/         # Serviços e integrações
```

## Funcionalidades

- Autenticação de usuários (login/registro)
- Dashboard protegido
- Integração com n8n para backend
- Interface responsiva com Tailwind CSS 