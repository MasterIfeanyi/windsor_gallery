import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import artistRoutes from './routes/artistRoutes.js'

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
)
app.use(express.json())

// Make sure the database is connected before any route runs
app.use(async (req, res, next) => {
    try {
        await connectDB()
        next()
    } catch (error) {
        next(error)
    }
})

// Public data is the same for everyone, so we let the CDN and browsers keep a
// copy for a short while. This is what lets 100,000 visitors share a few
// database calls instead of making 100,000 of them.
app.use('/api/artists', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    next()
})

app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1
    res.json({
        status: 'ok',
        database: isConnected ? 'connected' : 'not connected',
    })
})

app.use('/api/artists', artistRoutes)

// Any /api address we don't have gets a clean 404
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

// Catches any error and sends a clean message instead of crashing
app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong on the server' })
})

export default app