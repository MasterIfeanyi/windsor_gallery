import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// How much work it takes to scramble a password. Higher is safer but slower.
const HASH_COST = 12

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // select: false means this field is hidden unless we ask for it on purpose
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
    },
    { timestamps: true },
)

adminSchema.statics.hashPassword = function (plainPassword) {
    return bcrypt.hash(plainPassword, HASH_COST)
}

adminSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash)
}

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema)