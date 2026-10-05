import { requireAuth, requireRole } from '../middleware/auth.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';

const router = express.Router();

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please try again later.',
    },
});

router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body ?? {};

        // Check types before using string methods.
        if (
            [name, email, password, confirmPassword].some(
                (value) => typeof value !== 'string'
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'All four fields are required.',
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Name must contain 1–100 characters.',
            });
        }

        if (
            cleanEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid email address.',
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and at most 72 bytes.',
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.',
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role: 'customer',
        });

        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please log in.',
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        console.error('Registration failed:', error.name);

        return res.status(500).json({
            success: false,
            message: 'Unable to register. Please try again.',
        });
    }
});

function publicUser(user) {
    return {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.',
    },
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password ||
            email.length > 254 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid email and password.',
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select('+passwordHash');

        const validPassword = user
            ? await bcrypt.compare(password, user.passwordHash)
            : false;

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Your account is inactive.' });

        // Create a fresh session after successful login.
        await new Promise((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) return reject(error);
                resolve();
            });
        });

        req.session.userId = user._id.toString();

        await new Promise((resolve, reject) => {
            req.session.save((error) => {
                if (error) return reject(error);
                resolve();
            });
        });

        return res.json({
            success: true,
            message: 'Login successful.',
            user: publicUser(user),
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
    res.json({
        success: true,
        user: publicUser(req.user),
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
    req.session.destroy((error) => {
        if (error) return next(error);

        res.clearCookie('store.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.json({
            success: true,
            message: 'Logged out successfully.',
        });
    });
});

// Temporary endpoint to test admin permissions.
router.get(
    '/admin-check',
    requireAuth,
    requireRole('admin'),
    (req, res) => {
        res.json({
            success: true,
            message: 'Admin access granted.',
        });
    }
);

export default router;
