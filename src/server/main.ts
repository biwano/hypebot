import 'dotenv/config'
import express from "express";
import cors from 'cors'
import ViteExpress from "vite-express";

// Import API routes
import botRoutes from './routes/bots'

const app = express();

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use('/api/bots', botRoutes)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

ViteExpress.listen(app, PORT, () => {
  console.log(`🚀 HypeBot Server is listening on port ${PORT}...`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
});
