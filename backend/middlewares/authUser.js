import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token)
      return res.status(401).json({ message: "Access Denied: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // user id attached to request
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
