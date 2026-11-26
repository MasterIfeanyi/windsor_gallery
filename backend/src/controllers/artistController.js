import Artist from '../models/Artist.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/artists
export const getArtists = asyncHandler(async (req, res) => {
    const artists = await Artist.find()
        // return only the name and slug fields
        .select('name slug')
        .sort({ sortOrder: 1, name: 1 }) // sorts ascending by sortOrder first, and uses name as a tiebreaker for artists with the same sortOrder.
        .lean()

    res.json({ artists })
})