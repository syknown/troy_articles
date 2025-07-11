const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    // 1. Check for session-based auth (for HTML page requests)
    if (req.session && req.session.user) {
      const user = await User.findByPk(req.session.user.id);
      if (!user)
        return res
          .status(401)
          .json({ error: "Unauthorized (session user not found)" });

      req.user = user;
      return next(); // Authorized via session
    }

    // 2. Check for JWT token (for API requests)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user)
      return res
        .status(401)
        .json({ error: "Unauthorized (JWT user not found)" });

    req.user = user;
    next(); // Authorized via JWT
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
