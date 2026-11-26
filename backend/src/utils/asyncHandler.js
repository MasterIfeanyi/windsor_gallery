// Wraps a route so that if it fails, the error goes to our error handler
// instead of crashing the server. We write this once and use it everywhere.
export const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next)