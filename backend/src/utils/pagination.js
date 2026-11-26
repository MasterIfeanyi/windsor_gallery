const DEFAULT_LIMIT = 12
const MAX_LIMIT = 48

// Reads ?page= and ?limit= from the address and makes sure they are sensible.
// Someone typing ?limit=1000000 should not be able to overload the server.
export const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT))
    const skip = (page - 1) * limit

    return { page, limit, skip }
}