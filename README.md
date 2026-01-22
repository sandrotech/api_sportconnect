# SportConnect API

API REST profissional para o sistema SportConnect, desenvolvida com Node.js, Express, Prisma e PostgreSQL.

## Tecnologias

- Node.js (ESM)
- Express
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Bcrypt (Hash de senhas)
- Swagger (Documentação)

## Pré-requisitos

- Node.js instalado
- PostgreSQL rodando localmente
- Banco de dados `sportconnect` criado (ou permissão para criar)

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` (já criado com exemplo):
   ```env
   DATABASE_URL="postgresql://postgres:zlAleeh1234%40@localhost:5432/sportconnect"
   JWT_SECRET="supersecret_sportconnect_key_2026"
   PORT=3000
   ```

3. Gere o cliente Prisma e sincronize o banco de dados:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Rodando o Projeto

Para desenvolvimento (com hot-reload):
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Documentação da API

Acesse o Swagger UI para visualizar e testar as rotas:
http://localhost:3000/api-docs

## Estrutura do Projeto

- `src/config`: Configurações (Prisma, Swagger)
- `src/controllers`: Lógica de tratamento das requisições
- `src/middlewares`: Middlewares de autenticação e autorização
- `src/routes`: Definição das rotas
- `src/services`: Regras de negócio
- `prisma/`: Schema do banco de dados

## Tipos de Usuário (Roles)

- **ARENA**: Gestão de quadras
- **ATLETA**: Reservas e partidas
- **PROFISSIONAL**: Agenda e aulas
