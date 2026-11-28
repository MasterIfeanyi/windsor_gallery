import { Router } from 'express'
import { getArtworksByArtist } from '../controllers/artworkController.js'
import {
    createArtist,
    createArtwork,
    deleteArtist,
    deleteArtwork,
    getUploadSignature,
    updateArtwork,
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// One guard at the top protects every route in this file
router.use(requireAdmin)

router.get('/artists/:slug/artworks', getArtworksByArtist)
router.post('/artists', createArtist)
router.delete('/artists/:id', deleteArtist)

router.post('/uploads/signature', getUploadSignature)
router.post('/artworks', createArtwork)
router.patch('/artworks/:id', updateArtwork)
router.delete('/artworks/:id', deleteArtwork)

export default router