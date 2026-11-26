import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Admin from '../models/Admin.js'

const MIN_PASSWORD_LENGTH = 12

const seed = async () => {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first')
    }
    if (ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    await connectDB()

    const passwordHash = await Admin.hashPassword(ADMIN_PASSWORD)

    // Creates the admin, or updates the password if this email already exists
    await Admin.findOneAndUpdate(
        { email: ADMIN_EMAIL.toLowerCase().trim() },
        { passwordHash },
        { upsert: true, setDefaultsOnInsert: true },
    )

    console.log(`Admin ready: ${ADMIN_EMAIL}`)
    await mongoose.disconnect()
}

seed().catch((error) => {
    console.error(error.message)
    process.exit(1)
})