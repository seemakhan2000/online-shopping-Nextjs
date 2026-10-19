
const Order = require('../models/order.model.js');

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId');
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({
      error: 'Server error fetching orders',
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({
      message: 'Error fetching order.',
    });
  }
};

// Place new order
const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      paymentMethod,
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingAddress ||
      totalAmount == null
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const newOrder = new Order({
      userId: userId || null,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      message: 'Order deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting order:', err);
    return res.status(500).json({
      error: 'Server error while deleting order',
    });
  }
};

// Confirm order
const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'Confirmed' },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error confirming order:', error);
    return res.status(500).json({
      message: 'Error confirming order',
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  placeOrder,
  deleteOrder,
  confirmOrder,
};
