import Artist from '../models/Artist.js'
import Artwork from '../models/Artwork.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getPagination } from '../utils/pagination.js'

// GET /api/artists/:slug/artworks?page=1&limit=12
export const getArtworksByArtist = asyncHandler(async (req, res) => {
    const artist = await Artist.findOne({ slug: req.params.slug }).select('name slug').lean()

    if (!artist) {
        return res.status(404).json({ message: 'Artist not found' })
    }

    const { page, limit, skip } = getPagination(req.query)

    // Fetch this page of artworks and the total count at the same time
    const [artworks, total] = await Promise.all([
        Artwork.find({ artist: artist._id })
            .select('title releaseYear image createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Artwork.countDocuments({ artist: artist._id }),
    ])

    const totalPages = Math.ceil(total / limit)

    res.json({
        artist,
        artworks,
        pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    })
})