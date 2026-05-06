import 'dotenv/config';
import app from './app.js';
import { initializeAdmin } from './config/initDb.js';

const PORT = process.env.PORT || 3000;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  
  // Inicialização assíncrona do administrador padrão do sistema
  await initializeAdmin();
});
