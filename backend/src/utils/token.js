import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'admin_token'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export const signToken = (adminId) =>
    jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

// The settings for the cookie. In production it is only sent over HTTPS.
export const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
})