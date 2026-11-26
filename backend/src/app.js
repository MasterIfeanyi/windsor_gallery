import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'

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

// A simple route to check that everything is alive
app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1
    res.json({
        status: 'ok',
        database: isConnected ? 'connected' : 'not connected',
    })
})

// Catches any error and sends a clean message instead of crashing
app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong on the server' })
})

export default app