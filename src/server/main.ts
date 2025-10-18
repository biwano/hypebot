import 'dotenv/config'
import express from "express";
import cors from 'cors'
import ViteExpress from "vite-express";

// Import API routes
import botRoutes from './routes/bots'
import accountRoutes from './routes/account'

const app = express();

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use('/api/bots', botRoutes)
app.use('/api/account', accountRoutes)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

ViteExpress.listen(app, 3000, () => {
  console.log("🚀 HypeBot Server is listening on port 3000...")
  console.log("📊 Health check: http://localhost:3000/api/health")
});
