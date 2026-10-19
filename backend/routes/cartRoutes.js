const express = require('express');
const router = express.Router();

const { getUserCart, updateCart } = require('../controllers/cartController');


router.post('/', updateCart);
router.get('/:userId', getUserCart);

module.exports = router;
