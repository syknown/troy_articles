// routes/cart.js
const express = require("express");
const router = express.Router();
const { Article } = require("../models");

// Route to get the cart page
router.get("/", async (req, res) => {
  const { articleId } = req.query; // Get article ID from URL query

  if (!articleId) {
    return res.status(400).send("No Article ID provided.");
  }

  // Fetch the article details from the database
  const article = await Article.findByPk(articleId);
  if (!article) {
    return res.status(404).send("Article not found.");
  }

  // Render cart page with article details
  res.render("cart", {
    article,
    hostingPlans: [
      { name: "Bronze", price: 2000 },
      { name: "Bronze Plus", price: 2500 },
      { name: "Silver", price: 3500 },
      { name: "Gold", price: 4500 },
    ],
  });
});


module.exports = router;
