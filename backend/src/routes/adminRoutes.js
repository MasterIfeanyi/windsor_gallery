import { Router } from 'express'
import { createArtwork, getUploadSignature } from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// One guard at the top protects every route in this file,
// including any we add later
router.use(requireAdmin)

router.post('/uploads/signature', getUploadSignature)
router.post('/artworks', createArtwork)

export default router