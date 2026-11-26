import mongoose from 'mongoose'
import { slugify } from '../utils/slugify.js'

const artistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Artist name is required'],
            trim: true,
            unique: true,
        },
        // The web-friendly name, like "van-gogh". Made automatically from the name.
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        // Controls the order of names in the navigation. Lower numbers come first.
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
)

// Right before saving, build the slug from the name
artistSchema.pre('validate', function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name)
    }
})

// The "|| " part stops an error if this file is loaded twice
export default mongoose.models.Artist || mongoose.model('Artist', artistSchema)