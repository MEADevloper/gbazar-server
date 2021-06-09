const {Order} = require('../models/orders');
const {OrderItem} = require('../models/order-item');
// const {User} = require('../models/users');
const express = require('express');
const router = express.Router();


//get all orders
router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort('dateOrdered');
    console.log(orderList)

    if(!orderList) {
        res.status(500).json({success: false});
    }

    res.send(orderList);
})


//get order by id
router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    // if you have any nested id you can use the way
    .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category'}
    })
    // .populate('orderItems', 'quantity');
    // if you want to show the all filed the products
    // .populate({path: 'orderItems', populate: 'product'});
    // if you want to show all fileds the categories too the do that 
    

    if(!order) {
        res.status(500).json({success: false});
    }

    res.send(order);
})


router.post('/', async (req, res) => {

    // first we need the order item (id)
   
    const orderItemIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        // it cont save the orderitem
        newOrderItem = await newOrderItem.save();
        // we can return the (id) 
        return newOrderItem._id;
    }))

    const orderItemIdsResolved = await orderItemIds;
    // it is use to protuct our backend we callculate it here not in frontend
    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId)=>{

        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    
    // totalPrices is array we can combin and addation all and stor on variable 
    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
        
    });
    
    //if you want to creat order you should have oderd id
    order = await order.save();

    if(!order)
    return res.status(404).send('the order connot be created!');

    res.status(200).send(order);

})


//update orders
router.put('/:id', async (req, res) => {

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        
        },
        {new: true}
    )

    if(!order)
    return res.status(500).send('the order connot be updated! ');
    
    res.send(order);
})



// delete one order 
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order){
            // when we delete the order we should also delete the orderItem 
            await order.orderItems.map(async orderItem => {
                
                await OrderItem.findByIdAndRemove(orderItem)
                // if you don't find orderItem id you can also catch it by .then
            })

            return res.status(200).json({success: true, message: 'the order is delted! '})
        } else {
            return res.status(404).json({success: false, message: 'order not found'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})


// show the total sales 
router.get('/get/totalsales', async (req, res) => {
    // aggregate is to join the tables and show all in one tale 
    
    const totalSales = await Order.aggregate([
        //mongoose connot return any object  without id or object id
        
        //$sum is resolev word in mongoose and totalPrice is the order collections filed
        {$group: { _id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    console.log(totalSales)

    if(!totalSales){
        return res.status(400).send('the order sales connot be genarated')
    }

    res.send({totalSales: totalSales.pop().totalsales})
})

// get order count how much orders you have
router.get('/get/count', async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count);

    if(!orderCount){
        res.status(500).json({success: false});
    }

    res.send({
        orderCount: orderCount
    });
})

//i want to get users order we need to sficefy the id 
// by the rout we can find all order that the user did
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userorderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category'}
    })
    .sort('dateOrdered');

    if(!userorderList) {
        res.status(500).json({success: false});
    }

    res.send(userorderList);
})



module.exports = router;