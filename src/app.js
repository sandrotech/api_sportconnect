import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import arenaRoutes from './routes/arena.routes.js';
import atletaRoutes from './routes/atleta.routes.js';
import profissionalRoutes from './routes/profissional.routes.js';
import groupRoutes from './routes/group.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const length = res.getHeader('content-length') || 0;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${length}`);
  });
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRoutes);
app.use('/arena', arenaRoutes);
app.use('/atleta', atletaRoutes);
app.use('/profissional', profissionalRoutes);
app.use('/groups', groupRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('SportConnect API is running 🚀');
});

export default app;
