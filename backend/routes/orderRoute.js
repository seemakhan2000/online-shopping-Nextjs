const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getAllOrders,
  deleteOrder,
  confirmOrder,
  getOrderById
}= require('../controllers/orderController.js');

router.get("/:id", getOrderById);
router.post('/', placeOrder);
router.get('/', getAllOrders);
router.delete('/:id', deleteOrder);
router.put('/confirm/:id', confirmOrder); 

module.exports = router;

