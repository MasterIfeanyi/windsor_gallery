import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Artist from '../models/Artist.js'

const names = ['Warhol', 'Basquiat', 'Van Gogh', 'Dali', 'Banksy']

const seed = async () => {
    await connectDB()

    for (const [index, name] of names.entries()) {
        const exists = await Artist.findOne({ name })
        if (!exists) {
            await Artist.create({ name, sortOrder: index })
            console.log(`Added ${name}`)
        } else {
            console.log(`${name} already exists, skipped`)
        }
    }

    await mongoose.disconnect()
}

seed().catch((error) => {
    console.error(error)
    process.exit(1)
})