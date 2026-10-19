
const Review = require("../models/review.model");

exports.createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    const review = new Review({
      productId, 
      userId: userId || null,
      rating,
      comment,
    });

    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review" });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId; 
    const reviews = await Review.find({ productId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
