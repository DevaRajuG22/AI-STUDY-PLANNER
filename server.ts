import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Route Imports
import authRoutes from './server/routes/authRoutes';
import studyPlanRoutes from './server/routes/studyPlanRoutes';
import taskRoutes from './server/routes/taskRoutes';
import habitRoutes from './server/routes/habitRoutes';
import reminderRoutes from './server/routes/reminderRoutes';
import aiRoutes from './server/routes/aiRoutes';
import reportRoutes from './server/routes/reportRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/study-plans', studyPlanRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/reports', reportRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Study Planner backend running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[Server] Fatal startup error:', error);
  process.exit(1);
});
