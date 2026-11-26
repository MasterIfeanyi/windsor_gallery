import Admin from '../models/Admin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { COOKIE_NAME, verifyToken } from '../utils/token.js'

// Put this in front of any route that only the admin may use.
export const requireAdmin = asyncHandler(async (req, res, next) => {
    const token = req.cookies[COOKIE_NAME]
    if (!token) {
        return res.status(401).json({ message: 'Please log in' })
    }

    let payload
    try {
        payload = verifyToken(token)
    } catch {
        return res.status(401).json({ message: 'Your session has ended. Please log in again.' })
    }

    // Check the admin still exists, in case the account was removed
    const admin = await Admin.findById(payload.id).select('email').lean()
    if (!admin) {
        return res.status(401).json({ message: 'Please log in' })
    }

    req.admin = admin
    next()
})