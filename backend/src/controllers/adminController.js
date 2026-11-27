import crypto from 'node:crypto'
import cloudinary from '../config/cloudinary.js'
import Artist from '../models/Artist.js'
import Artwork from '../models/Artwork.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validateArtworkInput } from '../validators/artworkInput.js'
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