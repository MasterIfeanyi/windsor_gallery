import Admin from '../models/Admin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { COOKIE_NAME, getCookieOptions, signToken } from '../utils/token.js'

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    // The password hash is hidden by default, so we ask for it here on purpose
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash')
    const isCorrect = admin ? await admin.comparePassword(password) : false

    // Same message for a wrong email and a wrong password, so nobody can use
    // this form to find out which emails exist
    if (!isCorrect) {
        return res.status(401).json({ message: 'Incorrect email or password' })
    }

    res.cookie(COOKIE_NAME, signToken(admin._id), getCookieOptions())
    res.json({ admin: { email: admin.email } })
})

// POST /api/auth/logout
export const logout = (req, res) => {
    const { maxAge, ...options } = getCookieOptions()
    res.clearCookie(COOKIE_NAME, options)
    res.json({ message: 'Logged out' })
}

// GET /api/auth/me tells the frontend who is logged in, if anyone
export const getMe = (req, res) => {
    res.json({ admin: { email: req.admin.email } })
}