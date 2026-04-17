# BiblioHome — Biblioteca Particular Digital

Um sistema de gerenciamento de biblioteca particular que permite cadastrar livros via leitor de código de barras (HID), câmera ou entrada manual de ISBN.

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API do Google Books (opcional)

## Configuração

### 1. Supabase

1. Crie um projeto no Supabase
2. Execute o arquivo `supabase_migration.sql` no **SQL Editor** do Supabase
3. Habilite a autenticação por email no painel do Supabase (Authentication → Providers → Email)

### 2. Variáveis de Ambiente

**Raiz do projeto (`.env`):**

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
GOOGLE_BOOKS_API_KEY=sua_google_books_key
PORT=3001
```

**Frontend (`client/.env`):**

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_API_URL=http://localhost:3001
```

### 3. Instalação

```bash
npm run install:all
```

### 4. Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` (frontend) — o servidor API roda na porta 3001.

### 5. Produção

```bash
npm start
```

O Express serve o build do React e as rotas da API em `http://localhost:3001`.

## Stack

- **Frontend:** React 18 + Vite + React Router DOM
- **Backend:** Node.js + Express
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **API de livros:** Google Books API
- **Leitor de código de barras:** ZXing (câmera) + HID (teclado)
