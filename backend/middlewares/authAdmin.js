import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Please log in again.',
      });
    }

    // ✅ Verify the token
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    // ✅ Validate payload (must contain correct email and role)
    if (
      decoded.email !== process.env.ADMIN_EMAIL ||
      decoded.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Invalid admin credentials.',
      });
    }

    // ✅ Attach admin info to request (optional)
    req.admin = decoded;

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export { authAdmin };
