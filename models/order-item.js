const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    // if order is multipale you can put it in array 
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
})

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);