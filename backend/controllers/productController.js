
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { cloudinary } = require("../config/cloudinary");
// Escape special characters before using user input in a RegExp.
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Find or create a category.
async function findOrCreateCategory(name) {
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    throw new Error("Category is required");
  }

  let category = await Category.findOne({
    name: new RegExp(`^${escapeRegex(cleanName)}$`, "i"),
  });

  if (!category) {
    category = await Category.create({ name: cleanName });
  }

  return category;
}

// Add a product.
const addProduct = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const price = Number(req.body.price);
    const category = String(req.body.category || "").trim();

    // CloudinaryStorage supplies the hosted image URL in req.file.path.
    const imageUrl =
      req.file?.path ||
      req.file?.secure_url ||
      req.file?.url ||
      "";

   
    console.log("CLOUDINARY DEBUG:", {
      hasFile: Boolean(req.file),
      hasBuffer: Boolean(req.file?.buffer),
      hasPath: Boolean(req.file?.path),
      cloudinaryUrl: req.file?.path || null,
      publicId: req.file?.filename || null,
      imageUrl: Boolean(imageUrl),
    });

    
    if (!name || req.body.price === undefined ||
      req.body.price === "" || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, price, category and image are required.",
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product price.",
      });
    }

    const categoryDoc = await findOrCreateCategory(category);

    const product = await Product.create({
      name,
      price,
      category: categoryDoc.name,
      images: [imageUrl],
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR STACK:", error?.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to add product.",
      error: error?.message || "Unknown server error",
    });
  }
};

// Get all products.
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// Get one product.
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const categoryDoc = await Category.findOne({
      name: product.category,
    });

    return res.status(200).json({
      ...product.toObject(),
      categoryId: {
        name: categoryDoc?.name || product.category,
      },
    });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

// Update a product.
const updateProduct = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty.",
        });
      }

      updateData.name = name;
    }

    if (req.body.price !== undefined && req.body.price !== "") {
      const price = Number(req.body.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid product price.",
        });
      }

      updateData.price = price;
    }

    if (req.body.category !== undefined) {
      const categoryDoc = await findOrCreateCategory(
        req.body.category
      );

      updateData.category = categoryDoc.name;
    }

    // Only replace the image when a new file was uploaded.
    if (req.file?.path) {
      updateData.images = [req.file.path];
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No product changes were provided.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    console.error("ERROR MESSAGE:", error?.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
      error: error?.message || "Unknown server error",
    });
  }
};

// Delete a product.
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const categoryName = product.category;

    await product.deleteOne();

    const remainingProduct = await Product.findOne({
      category: categoryName,
    });

    if (!remainingProduct) {
      await Category.deleteOne({ name: categoryName });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};

// Remove duplicate search results.
function removeDuplicates(products) {
  const seen = new Set();

  return products.filter((product) => {
    const key = `${product.name}-${product.price}-${product.size || ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

// Search products.
const searchProducts = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query.",
      });
    }

    const regex = new RegExp(escapeRegex(query), "i");
    const numericPrice = Number(query);

    const conditions = [
      { name: regex },
      { size: regex },
    ];

    if (Number.isFinite(numericPrice) && query !== "") {
      conditions.push({ price: numericPrice });
    }

    const products = await Product.find({
      $or: conditions,
    });

    return res.status(200).json(removeDuplicates(products));
  } catch (error) {
    console.error("SEARCH PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search products.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
};
