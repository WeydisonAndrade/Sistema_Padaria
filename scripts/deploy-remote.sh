#!/usr/bin/env bash
# Deploy/atualização no servidor remoto (VPS Linux).
# Uso: chmod +x scripts/deploy-remote.sh && ./scripts/deploy-remote.sh

set -euo pipefail

echo "==> Instalando dependências..."
npm ci

echo "==> Gerando Prisma Client..."
npm run db:generate

echo "==> Sincronizando banco..."
npm run db:push

echo "==> Build de produção..."
npm run build

echo "==> Reiniciando PM2..."
if pm2 describe tutti-pane > /dev/null 2>&1; then
  pm2 restart ecosystem.config.cjs
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi

echo "==> Deploy concluído!"
pm2 status
