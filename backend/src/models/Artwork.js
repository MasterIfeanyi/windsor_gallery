import mongoose from 'mongoose'

const artworkSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: '',
        },
        releaseYear: {
            type: Number,
            min: [1000, 'Release year looks too early'],
            max: [new Date().getFullYear(), 'Release year cannot be in the future'],
        },
        // The link: this holds the ID of an Artist
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist',
            required: [true, 'An artwork must belong to an artist'],
        },
        // Details of the image stored on Cloudinary
        image: {
            publicId: { type: String, required: true },
            url: { type: String, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
    },
    { timestamps: true },
)

// Makes "artworks of one artist, newest first" fast, even with huge numbers of images
artworkSchema.index({ artist: 1, createdAt: -1 })

// No two artworks can point at the same Cloudinary image
artworkSchema.index({ 'image.publicId': 1 }, { unique: true })

export default mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema)