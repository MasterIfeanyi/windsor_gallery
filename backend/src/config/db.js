import mongoose from 'mongoose'

// We remember the connection between requests. On Netlify, the server wakes up
// and sleeps all the time, so reusing a connection avoids opening a new one on
// every request. That matters when many people visit at once.
let cached = global.mongooseCache
if (!cached) {
    cached = global.mongooseCache = { connection: null, promise: null }
}

export const connectDB = async () => {
    if (cached.connection) return cached.connection

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        })
    }

    try {
        cached.connection = await cached.promise
    } catch (error) {
        // Forget the failed attempt so the next request can try again
        cached.promise = null
        throw error
    }

    return cached.connection
}