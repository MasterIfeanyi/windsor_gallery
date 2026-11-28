import serverless from 'serverless-http'
import app from '../../src/app.js'

// Netlify sends every /api request here. basePath removes the function's own
// address, so Express sees plain /api/... paths, just like on your computer.
export const handler = serverless(app, { basePath: '/.netlify/functions/server' })