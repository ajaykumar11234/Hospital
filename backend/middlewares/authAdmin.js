// middlewares/authAdmin.js
import jwt from "jsonwebtoken";
import "dotenv/config";

const authAdmin = async (req, res, next) => {
  try {
    // ✅ Always read header in lowercase (Express normalizes headers)
    const atoken = req.headers["atoken"];

    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    // ✅ Verify the token
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    // ✅ Validate payload (must match admin credentials)
    if (
      decoded.email !== process.env.ADMIN_EMAIL ||
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Invalid admin credentials.",
      });
    }

    // ✅ Attach admin info for downstream use
    req.admin = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export { authAdmin };
