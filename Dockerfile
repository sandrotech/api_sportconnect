FROM node:22-slim

# Instalar dependências necessárias para o Prisma (OpenSSL)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar as dependências
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o restante do código
COPY . .

# Expor a porta
EXPOSE 3000

# Script de inicialização
CMD ["npm", "run", "start"]
