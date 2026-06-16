/**
 * Configuração PM2 para produção.
 * Use apenas 1 instância — SQLite não suporta múltiplos processos simultâneos.
 *
 * Iniciar:  pm2 start ecosystem.config.cjs
 * Reiniciar: pm2 restart tutti-pane
 * Logs:     pm2 logs tutti-pane
 */

module.exports = {
  apps: [
    {
      name: "tutti-pane",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
