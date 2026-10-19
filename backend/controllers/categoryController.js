const Category = require('../models/category.model');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(); 
    res.json(categories); 
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

module.exports = { getAllCategories };
