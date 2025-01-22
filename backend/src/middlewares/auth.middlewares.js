import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
const authMiddleware = async (req, res, next) => {
  try {
    const token = req?.cookies?.jwt;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Internal server error at auth middleware!",
    });
  }
};

export default authMiddleware;
