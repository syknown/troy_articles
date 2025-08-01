const express = require("express");
const router = express.Router();
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const { Article, Transaction, Order } = require("../models");
const upload = multer({ dest: "temp_zips/" });

router.get("/test", (req, res) => {
  res.send("Articles test route working.");
});
router.get("/upload", (req, res) => {
  res.render("upload-article", { title: "Upload Article" });
});
router.get("/admin/list", async (req, res) => {
  // Fetch all articles from the database
  try {
    const articles = await Article.findAll();
    res.render("article-list", {
      title: "Article List",
      articles: articles,
      message: null, // or any message you want to display
    });
    console.log(articles);
  } catch (error) {
    console.error("Error fetching articles: ", error);
    res.status(500).send("Error fetching articles.");
  }
});
router.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.render("orders", {
      title: "Orders",
      orders: orders,
      message: null, // or any message you want to display
    });
    console.log(orders);
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).send(error);
  }
});
router.get("/admin/payments", async (req, res) => {
  try {
    const payments = await Transaction.findAll();
    console.log(payments);

    res.render("payments", {
      title: "Payments",
      payments: payments,
      message: null, // or any message you want to display
    });
    console.log(payments);
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).send("Error fetching orders.");
  }
});
router.post(
  "/themes/upload",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description, category, cost } = req.body;
      const thumbnail = req.files["thumbnail"]
        ? req.files["thumbnail"][0]
        : null;
      const file = req.files["file"] ? req.files["file"][0] : null;

      // Validate required fields
      if (!name || !description || !category || !file) {
        return res
          .status(400)
          .send("All fields (name, description, category, file) are required.");
      }
      const destDir = path.join(__dirname, "..", "uploads", "thumbnails");
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const ext = path.extname(thumbnail.originalname);
      const thumbnailFilename = `${thumbnail.filename}${ext}`;
      const thumbnailFullPath = path.join(destDir, thumbnailFilename);

      fs.renameSync(thumbnail.path, thumbnailFullPath);

      // Define file paths for saving
      //   const thumbnailPath = thumbnail
      //   ? `/uploads/thumbnails/${thumbnail.filename}`
      //     : null;

      const zipDestDir = path.join(__dirname, "..", "uploads", "themes");
      if (!fs.existsSync(zipDestDir)) {
        fs.mkdirSync(zipDestDir, { recursive: true });
      }

      const zipExt = path.extname(file.originalname); // e.g. ".zip"
      const zipFilenameWithExt = `${file.filename}${zipExt}`;
      const zipDestPath = path.join(zipDestDir, zipFilenameWithExt);
      const zipFolderName = path.basename(
        file.originalname,
        path.extname(file.originalname)
      ); // "cool-theme"

      fs.renameSync(file.path, zipDestPath);

      const filePath = `/uploads/themes/${zipFilenameWithExt}`;

      const dbThumbnailPath = `/uploads/thumbnails/${thumbnailFilename}`;
      const previewPath = "public/themes/" + zipFolderName; // Save the path of the preview folder

      // Save the theme data to the database
      const newArticle = await Article.create({
        name,
        description,
        category,
        cost,
        image: dbThumbnailPath,
        previewPath: previewPath,
        zipPath: zipFolderName, // Save the path of the zip file
      });

      console.log("New Article Created: ", newArticle);
      res.status(201).redirect("/articles/admin/list");
    } catch (err) {
      console.error("Error uploading theme: ", err);
      res.status(500).send("Error uploading theme. Please try again.");
    }
  }
);
router.post("/edit/:id", async (req, res) => {
  try {
    const { name, description, category, cost } = req.body;
    const { id } = req.params;
   

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Update the Article in the database
    await article.update(
      { name, description, category, cost },
      { where: { id } }
    );

    res.redirect("/Articles/admin/list");
  } catch (error) {
    res.status(500).send("Error updating Article.");
  }
});
router.post("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting Article with ID:", id);

    // Avoid shadowing the model
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Delete using the instance method
    await article.destroy();

    res.redirect("/Articles/admin/list");
  } catch (error) {
    res.status(500).send("Error deleting Article.");
  }
});
// Preview Route
router.get("/preview/:slug", async (req, res) => {
  const { slug } = req.params;
  const Article = await Article.findOne({ where: { slug } });

  if (!Article) return res.status(404).send("Article not found");

  res.render("preview", { slug: Article.slug });
});

module.exports = router;
