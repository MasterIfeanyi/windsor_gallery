import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import cloudinary from '../config/cloudinary.js'
import Artist from '../models/Artist.js'
import Artwork from '../models/Artwork.js'

// Which artist these images belong to, and where the images are
const ARTIST_SLUG = 'basquiat'
const IMAGES_FOLDER = path.join(import.meta.dirname, '../../seed-images')
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.webp']

// "01-untitled-skull.jpg" becomes "01 untitled skull"
const makeTitle = (fileName) =>
    path.parse(fileName).name.replace(/[-_]+/g, ' ').trim()

const seed = async () => {
    await connectDB()

    const artist = await Artist.findOne({ slug: ARTIST_SLUG })
    if (!artist) {
        throw new Error(`Artist "${ARTIST_SLUG}" not found. Run npm run seed:artists first.`)
    }

    const allFiles = await fs.readdir(IMAGES_FOLDER)
    const files = allFiles
        .filter((file) => ALLOWED_TYPES.includes(path.extname(file).toLowerCase()))
        .sort()
        // The gallery shows the newest first, so we save the last file first.
        // That way file 01 is saved last and shows up first.
        .reverse()

    if (files.length === 0) {
        throw new Error(`No images found in ${IMAGES_FOLDER}`)
    }

    for (const file of files) {
        const publicId = `art-gallery/${ARTIST_SLUG}/${path.parse(file).name}`

        const result = await cloudinary.uploader.upload(path.join(IMAGES_FOLDER, file), {
            public_id: publicId,
            overwrite: true,
            // Never store anything bigger than 2000px. This saves free storage space.
            transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
        })

        // If this image was saved before, update it. Otherwise, create it.
        await Artwork.findOneAndUpdate(
            { 'image.publicId': result.public_id },
            {
                title: makeTitle(file),
                artist: artist._id,
                image: {
                    publicId: result.public_id,
                    url: result.secure_url,
                    width: result.width,
                    height: result.height,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        )

        console.log(`Saved ${file} (${result.width} x ${result.height})`)
    }

    await mongoose.disconnect()
}

seed().catch((error) => {
    console.error(error)
    process.exit(1)
})