// routes/cart.js
const express = require("express");
const router = express.Router();
const { Article } = require("../models");

// Route to get the cart page
router.get("/", async (req, res) => {
  console.log("Cart page accessed");
  const { articleId } = req.query; // Get template ID from URL query
  console.log("Article ID: ", articleId);

  if (!articleId) {
    return res.status(400).send("No Article ID provided.");
  }

  // Fetch the template details from the database
  const article = await Article.findByPk(articleId);
  if (!article) {
    return res.status(404).send("Article not found.");
  }

  // Render cart page with template details
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
