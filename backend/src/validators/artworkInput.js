import mongoose from 'mongoose'
import { MAX_TITLE_LENGTH, MIN_YEAR } from '../constants/upload.js'

// Checks the artist, title and year. Returns { error } if something is wrong,
// or { value } with clean data if everything is fine.
export const validateArtworkInput = ({ artistId, title = '', releaseYear } = {}) => {
    if (typeof artistId !== 'string' || !mongoose.isValidObjectId(artistId)) {
        return { error: 'Please choose an artist' }
    }

    if (typeof title !== 'string' || title.trim().length > MAX_TITLE_LENGTH) {
        return { error: `The title must be ${MAX_TITLE_LENGTH} characters or fewer` }
    }

    // The year is optional. An empty box arrives as "", which means "no year".
    const hasYear =
        releaseYear !== undefined && releaseYear !== null && String(releaseYear).trim() !== ''
    const year = hasYear ? Number(releaseYear) : undefined
    const currentYear = new Date().getFullYear()

    if (hasYear && (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear)) {
        return { error: `The year must be between ${MIN_YEAR} and ${currentYear}` }
    }

    return { value: { artistId, title: title.trim(), releaseYear: year } }
}