<p align="center">
  <img src="client/public/favicon.svg" alt="BiblioHome Logo" width="80" />
</p>

<h1 align="center">BiblioHome</h1>

<p align="center">
  <strong>📚 Biblioteca Particular Digital</strong>
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-stack">Stack</a> •
  <a href="#-pré-requisitos">Pré-requisitos</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-deploy">Deploy</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a> •
  <a href="#-licença">Licença</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

---

## 📖 Sobre

**BiblioHome** é um sistema completo de gerenciamento de biblioteca particular. Cadastre seus livros via leitor de código de barras (HID), câmera do celular/notebook ou entrada manual de ISBN — o sistema busca automaticamente os metadados (título, autor, capa, etc.) na Google Books API.

## ✨ Funcionalidades

- 📷 **Leitura de código de barras** via câmera (ZXing) ou leitor HID (teclado)
- 🔍 **Busca automática de metadados** via Google Books API
- 📊 **Dashboard** com estatísticas da coleção
- 📚 **Gerenciamento de coleção** — filtros por status, busca, ordenação
- 📖 **Controle de leitura** — progresso, status (na coleção, lendo, desejo, concluído)
- 🔐 **Autenticação** completa via Supabase Auth (email/senha)
- 👥 **Multi-usuário** com Row Level Security (RLS)
- ⚙️ **Painel de configurações** do perfil
- 📱 **Responsivo** — funciona em desktop e mobile

## 🛠 Stack

| Camada         | Tecnologia                            |
| -------------- | ------------------------------------- |
| **Frontend**   | React 18 + Vite + React Router DOM   |
| **Backend**    | Node.js + Express                     |
| **Banco**      | Supabase (PostgreSQL)                 |
| **Auth**       | Supabase Auth                         |
| **API Livros** | Google Books API                      |
| **Barcode**    | ZXing (câmera) + HID (teclado)        |
| **Deploy**     | Railway                               |

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org) 18+ e npm 9+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Chave de API do [Google Books](https://console.cloud.google.com/) (opcional, melhora busca de metadados)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/euclidessilva/bibliohome.git
cd bibliohome
```

### 2. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Abra o **SQL Editor** e execute o conteúdo de [`supabase_migration.sql`](supabase_migration.sql)
3. Em **Authentication → Providers → Email**, habilite a autenticação por email

### 3. Configure as variáveis de ambiente

```bash
# Backend (raiz do projeto)
cp .env.example .env

# Frontend
cp client/.env.example client/.env
```

Preencha os arquivos `.env` com suas credenciais do Supabase e Google Books.

### 4. Instale as dependências

```bash
npm run install:all
```

## 💻 Uso

### Desenvolvimento

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

### Produção

```bash
npm start
```

O Express compila o React e serve o build junto com a API em http://localhost:3001.

## ☁️ Deploy

O projeto está configurado para deploy no [Railway](https://railway.app):

1. Conecte o repositório GitHub ao Railway
2. Configure as variáveis de ambiente no painel do Railway
3. O deploy é automático a cada push na `main`

O arquivo [`railway.toml`](railway.toml) já contém a configuração necessária.

## 📁 Estrutura do Projeto

```
bibliohome/
├── client/                   # Frontend React + Vite
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── Badge.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ISBNInput.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Configurações (Supabase client)
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── AddBook.jsx   # Cadastro de livros (ISBN/câmera/manual)
│   │   │   ├── Collection.jsx# Coleção com filtros e busca
│   │   │   ├── Dashboard.jsx # Dashboard com estatísticas
│   │   │   ├── Login.jsx     # Login / Registro
│   │   │   └── Settings.jsx  # Configurações do perfil
│   │   ├── App.jsx           # Rotas da aplicação
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Estilos globais
│   └── .env.example          # Template de variáveis do frontend
├── server/
│   ├── index.js              # Entry point Express
│   ├── middleware/            # Middlewares (auth, etc.)
│   └── routes/
│       ├── books.js          # Rotas de livros (CRUD + Google Books)
│       └── users.js          # Rotas de usuários
├── .env.example              # Template de variáveis do backend
├── .gitignore
├── LICENSE
├── package.json
├── railway.toml              # Configuração Railway
├── supabase_migration.sql    # Schema do banco de dados
└── README.md
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/euclidessilva">Euclides Silva</a>
</p>
