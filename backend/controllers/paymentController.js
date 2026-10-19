const Order = require('../models/order.model');

const createPayment = async (req, res) => {
  try {
    const {
      userId = null,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      paymentMethod
    } = req.body;

    if (!items || !items.length || !shippingAddress || !totalAmount || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const order = new Order({
      userId,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      paymentMethod
    });

    await order.save();

    res.status(201).json({ success: true, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPayment };
