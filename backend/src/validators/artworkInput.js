import mongoose from 'mongoose'
import { MAX_TITLE_LENGTH, MIN_YEAR } from '../constants/upload.js'

// Each of these returns { error } if something is wrong, or { value } if fine.
const parseTitle = (title) => {
    if (typeof title !== 'string' || title.trim().length > MAX_TITLE_LENGTH) {
        return { error: `The title must be ${MAX_TITLE_LENGTH} characters or fewer` }
    }
    return { value: title.trim() }
}

// The year is optional. An empty box means "no year", which gives undefined.
const parseYear = (releaseYear) => {
    const hasYear =
        releaseYear !== undefined && releaseYear !== null && String(releaseYear).trim() !== ''
    if (!hasYear) return { value: undefined }

    const year = Number(releaseYear)
    const currentYear = new Date().getFullYear()

    if (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear) {
        return { error: `The year must be between ${MIN_YEAR} and ${currentYear}` }
    }
    return { value: year }
}

// Used when uploading a new artwork: artist, title and year
export const validateArtworkInput = ({ artistId, title = '', releaseYear } = {}) => {
    if (typeof artistId !== 'string' || !mongoose.isValidObjectId(artistId)) {
        return { error: 'Please choose an artist' }
    }

    const parsedTitle = parseTitle(title)
    if (parsedTitle.error) return parsedTitle

    const parsedYear = parseYear(releaseYear)
    if (parsedYear.error) return parsedYear

    return { value: { artistId, title: parsedTitle.value, releaseYear: parsedYear.value } }
}

// Used when editing: only the fields that were sent are checked and changed.
// A year of null means "remove the year".
export const validateArtworkEdit = (body = {}) => {
    const changes = {}

    if ('title' in body) {
        const parsedTitle = parseTitle(body.title)
        if (parsedTitle.error) return parsedTitle
        changes.title = parsedTitle.value
    }

    if ('releaseYear' in body) {
        const parsedYear = parseYear(body.releaseYear)
        if (parsedYear.error) return parsedYear
        changes.releaseYear = parsedYear.value ?? null
    }

    if (Object.keys(changes).length === 0) {
        return { error: 'Nothing to update' }
    }

    return { value: changes }
}