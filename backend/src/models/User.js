import mongoose from 'mongoose';
import { nextUserId } from '../services/userIds.js';

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            immutable: true,
            unique: true,
            sparse: true,
            min: 1,
            validate: Number.isSafeInteger,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        phone: { type: String, trim: true, maxlength: 30, default: '' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (this.isNew && !this.$locals.userIdAssigned) {
        // Ignore supplied IDs: only the shared counter assigns new account IDs.
        this.userId = await nextUserId();
        this.$locals.userIdAssigned = true;
    }
});

userSchema.pre('insertMany', async function (users) {
    for (const user of users) user.userId = await nextUserId();
});

export default mongoose.model('User', userSchema);
