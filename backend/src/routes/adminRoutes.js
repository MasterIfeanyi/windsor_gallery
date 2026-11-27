import { Router } from 'express'
import { getArtworksByArtist } from '../controllers/artworkController.js'
import {
    createArtwork,
    deleteArtwork,
    getUploadSignature,
    updateArtwork,
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// One guard at the top protects every route in this file,
// including any we add later
router.use(requireAdmin)

// The admin's own copy of the artwork list. The same code as the public one,
// but behind the guard and never cached, so edits show up straight away.
router.get('/artists/:slug/artworks', getArtworksByArtist)

router.post('/uploads/signature', getUploadSignature)
router.post('/artworks', createArtwork)
router.patch('/artworks/:id', updateArtwork)
router.delete('/artworks/:id', deleteArtwork)

export default router