const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Add a product
const addProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const imagePath = req.file ? `/upload/${req.file.filename}` : '';

    if (!name || !price || !category || !req.file) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    const product = new Product({
      name,
      price,
      category: categoryDoc.name,
      images: [imagePath],
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); 
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const categoryObj = await Category.findOne({ name: product.category });
    const productWithCategory = {
      ...product._doc,
      categoryId: categoryObj ? { name: categoryObj.name } : { name: product.category }
    };

    res.json(productWithCategory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (price) updateData.price = price;

    if (category) {
      let categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: category });
      }
      updateData.category = categoryDoc.name;
    }

    if (req.file) {
      updateData.images = [`/upload/${req.file.filename}`];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete product
const deleteProduct = async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const categoryToCheck = product.category;
    await product.deleteOne();
    const existing = await Product.findOne({ category: categoryToCheck });
    if (!existing) {
      await Category.deleteOne({ name: categoryToCheck }); 
    }
    res.json({ message: "Product and category (if unused) deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error while deleting product" });
  }
};


// Helper to remove duplicates by name+price+size
function removeDuplicates(products) {
  const seen = new Set();
  return products.filter(product => {
    const key = `${product.name}-${product.price}-${product.size}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Search controller
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "No search query provided" });

    const regex = new RegExp(query, 'i');

    const products = await Product.find({
      $or: [
        { name: regex },
        { price: +query || -1 },
        { size: regex }
      ]
    });

    const uniqueProducts = removeDuplicates(products);
    res.json(uniqueProducts);
  } catch (err) {
    res.status(500).json({ message: "Server error during search" });
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