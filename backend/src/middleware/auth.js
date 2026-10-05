import User from '../models/User.js';

export async function requireAuth(req, res, next) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in first.',
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Account not found. Please log in again.',
            });
        }

        if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Your account is inactive.' });

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

export function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.',
            });
        }

        next();
    };
}