const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.get("/dashboard", auth, (req, res) => {
  console.log("User authenticated:", req.user);
  res.json({ message: `Welcome ${req.user.username}` });
});

module.exports = router;
