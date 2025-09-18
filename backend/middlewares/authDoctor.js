import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      console.log("unauthorized");
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Please log in again.',
      });
    }

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // Attach doctor info to req
    req.doctor = { _id: decoded.id }; // ✅ accessible in controllers as req.doctor._id
    req.body = req.body || {};
    req.body.docId = decoded.id; // still available for other endpoints

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export { authDoctor };
