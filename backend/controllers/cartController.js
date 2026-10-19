const Cart = require('../models/cart.model'); 

const getUserCart = async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  res.json(cart);
};

const updateCart = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "userId and items are required" });
  }

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = { getUserCart, updateCart };
