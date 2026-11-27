import crypto from 'node:crypto'
import mongoose from 'mongoose'
import cloudinary from '../config/cloudinary.js'
import Artist from '../models/Artist.js'
import Artwork from '../models/Artwork.js'
import { slugify } from '../utils/slugify.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validateArtworkEdit, validateArtworkInput } from '../validators/artworkInput.js'
import { ALLOWED_FORMATS, INCOMING_TRANSFORMATION, UPLOAD_ROOT } from '../constants/upload.js'

// The random part of an image name looks like 3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d
const IMAGE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const findArtist = (artistId) => Artist.findById(artistId).select('slug').lean()

// POST /api/admin/uploads/signature
export const getUploadSignature = asyncHandler(async (req, res) => {
    // Check the whole form BEFORE any image is uploaded
    const { error, value } = validateArtworkInput(req.body)
    if (error) {
        return res.status(400).json({ message: error })
    }

    const artist = await findArtist(value.artistId)
    if (!artist) {
        return res.status(404).json({ message: 'Artist not found' })
    }

    // Everything in here gets "stamped". If the browser changes any of it,
    // Cloudinary rejects the upload. The server picks the image name.
    const params = {
        allowed_formats: ALLOWED_FORMATS,
        public_id: `${UPLOAD_ROOT}/${artist.slug}/${crypto.randomUUID()}`,
        timestamp: Math.round(Date.now() / 1000),
        transformation: INCOMING_TRANSFORMATION,
    }

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)

    // The browser sends every field in uploadParams to Cloudinary, exactly as given
    res.json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        uploadParams: {
            ...params,
            api_key: process.env.CLOUDINARY_API_KEY,
            signature,
        },
    })
})

// POST /api/admin/artworks
export const createArtwork = asyncHandler(async (req, res) => {
    const { error, value } = validateArtworkInput(req.body)
    if (error) {
        return res.status(400).json({ message: error })
    }

    const artist = await findArtist(value.artistId)
    if (!artist) {
        return res.status(404).json({ message: 'Artist not found' })
    }

    // Only image names that our own server made are accepted:
    // art-gallery/<this artist>/<random id>
    const { publicId } = req.body
    const expectedPrefix = `${UPLOAD_ROOT}/${artist.slug}/`
    const isOurs =
        typeof publicId === 'string' &&
        publicId.startsWith(expectedPrefix) &&
        IMAGE_ID_PATTERN.test(publicId.slice(expectedPrefix.length))

    if (!isOurs) {
        return res.status(400).json({ message: 'That image does not belong to this artist' })
    }

    if (await Artwork.exists({ 'image.publicId': publicId })) {
        return res.status(409).json({ message: 'This image has already been saved' })
    }

    // Ask Cloudinary about the image instead of trusting the browser
    let resource
    try {
        resource = await cloudinary.api.resource(publicId)
    } catch (err) {
        // Cloudinary reports errors in slightly different shapes, so we check both
        const status = err?.http_code ?? err?.error?.http_code
        if (status === 404) {
            return res.status(400).json({ message: 'We could not find that image on Cloudinary' })
        }
        throw err
    }

    try {
        const artwork = await Artwork.create({
            title: value.title,
            releaseYear: value.releaseYear,
            artist: artist._id,
            image: {
                publicId: resource.public_id,
                url: resource.secure_url,
                width: resource.width,
                height: resource.height,
            },
        })

        res.status(201).json({ artwork })
    } catch (err) {
        // 11000 means MongoDB's unique index caught a double save
        if (err.code === 11000) {
            return res.status(409).json({ message: 'This image has already been saved' })
        }
        throw err
    }
})

// PATCH /api/admin/artworks/:id
export const updateArtwork = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
        return res.status(404).json({ message: 'Artwork not found' })
    }

    const { error, value } = validateArtworkEdit(req.body)
    if (error) {
        return res.status(400).json({ message: error })
    }

    // Build the update from only what was sent
    const { releaseYear, ...fields } = value
    const toSet = { ...fields }
    if (typeof releaseYear === 'number') toSet.releaseYear = releaseYear

    const operation = {}
    if (Object.keys(toSet).length > 0) operation.$set = toSet
    // null means the year box was cleared, so the year is removed completely
    if (releaseYear === null) operation.$unset = { releaseYear: '' }

    const artwork = await Artwork.findByIdAndUpdate(id, operation, {
        new: true,
        runValidators: true,
    })
        .select('title releaseYear image artist createdAt')
        .lean()

    if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' })
    }

    res.json({ artwork })
})

// DELETE /api/admin/artworks/:id
export const deleteArtwork = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
        return res.status(404).json({ message: 'Artwork not found' })
    }

    // The record goes first. If the image delete fails afterwards, the worst
    // case is a stray image on Cloudinary. The other way round, the gallery
    // could be left showing a broken image.
    const artwork = await Artwork.findByIdAndDelete(id).select('image.publicId').lean()

    if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' })
    }

    try {
        // invalidate makes Cloudinary's CDN stop serving its saved copies
        await cloudinary.uploader.destroy(artwork.image.publicId, { invalidate: true })
    } catch (err) {
        console.error('Could not delete the image from Cloudinary:', artwork.image.publicId, err)
    }

    res.json({ message: 'Artwork deleted' })
})

const MAX_ARTIST_NAME_LENGTH = 60

// POST /api/admin/artists
export const createArtist = asyncHandler(async (req, res) => {
    // Trim, and squash repeated spaces: "Van   Gogh " becomes "Van Gogh"
    const name = typeof req.body.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : ''

    if (!name || name.length > MAX_ARTIST_NAME_LENGTH) {
        return res
            .status(400)
            .json({ message: `The name must be between 1 and ${MAX_ARTIST_NAME_LENGTH} characters` })
    }

    // A name like "!!!" would make an empty slug and a broken web address
    if (!slugify(name)) {
        return res.status(400).json({ message: 'The name must include letters or numbers' })
    }

    // The new artist goes to the end of the navigation
    const last = await Artist.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean()
    const sortOrder = (last?.sortOrder ?? -1) + 1

    try {
        const artist = await Artist.create({ name, sortOrder })
        res.status(201).json({ artist: { _id: artist._id, name: artist.name, slug: artist.slug } })
    } catch (err) {
        // 11000 means the unique name or slug already exists, so "basquiat" and
        // "Basquiat" count as the same artist
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An artist with this name already exists' })
        }
        throw err
    }
})