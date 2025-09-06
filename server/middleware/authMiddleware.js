import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: "No access token, please log in" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }
  };
};
