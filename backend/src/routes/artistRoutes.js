import { Router } from 'express'
import { getArtists } from '../controllers/artistController.js'
import { getArtworksByArtist } from '../controllers/artworkController.js'

const router = Router()

router.get('/', getArtists)
router.get('/:slug/artworks', getArtworksByArtist)

export default router