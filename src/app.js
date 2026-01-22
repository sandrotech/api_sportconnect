import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';

import authRoutes from './routes/auth.routes.js';
import arenaRoutes from './routes/arena.routes.js';
import atletaRoutes from './routes/atleta.routes.js';
import profissionalRoutes from './routes/profissional.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRoutes);
app.use('/arena', arenaRoutes);
app.use('/atleta', atletaRoutes);
app.use('/profissional', profissionalRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('SportConnect API is running 🚀');
});

export default app;
