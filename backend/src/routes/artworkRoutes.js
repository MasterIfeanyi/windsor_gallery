import { Router } from 'express'
import { getArtworkById } from '../controllers/artworkController.js'

const router = Router()

router.get('/:id', getArtworkById)

export default router