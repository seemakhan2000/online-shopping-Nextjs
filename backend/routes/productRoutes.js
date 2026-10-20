
const express = require("express");
const multer = require("multer");

const router = express.Router();

const productController = require("../controllers/productController");
const { storage } = require("../config/cloudinary");

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, PNG and WEBP images are allowed.")
    );
  },
});

// Search must come before /:id.
router.get("/search", productController.searchProducts);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  upload.single("image"),
  productController.addProduct
);

router.put(
  "/:id",
  upload.single("image"),
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);

// Handle upload and Multer errors for these routes.
router.use((err, req, res, next) => {
  console.error("PRODUCT ROUTE ERROR:", err);
  console.error("PRODUCT ROUTE ERROR MESSAGE:", err?.message);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    err instanceof multer.MulterError ? 400 :
    err.status || 500;

  return res.status(status).json({
    success: false,
    message: err.message || "Product request failed.",
  });
});

module.exports = router;
