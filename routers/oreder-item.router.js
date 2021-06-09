const {OrderItem} = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderItemList = await OrderItem.find();

    if(!orderItemList) {
        res.status(500).json({success: false});
    }

    res.send(orderItemList);
})



// delete one order item
router.delete('/:id', (req, res) => {
    OrderItem.findByIdAndRemove(req.params.id).then(orderitem => {
        if(orderitem){
            return res.status(200).json({success: true, message: 'the order is delted! '})
        } else {
            return res.status(404).json({success: false, message: 'order not found'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})



module.exports = router;