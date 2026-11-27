export const UPLOAD_ROOT = 'art-gallery'
export const MAX_TITLE_LENGTH = 200
export const MIN_YEAR = 1000

// Never store anything bigger than 2000px. This saves free storage space.
export const INCOMING_TRANSFORMATION = 'c_limit,w_2000,h_2000'

// Cloudinary itself refuses anything that is not one of these
export const ALLOWED_FORMATS = 'jpg,png,webp'