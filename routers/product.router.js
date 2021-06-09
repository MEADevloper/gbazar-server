const {Products} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


// file upload by multer 

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // validation of file 
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid){
            uploadError = null
        }
        //cb function => cb(null, 'public/uploads')
        //if mimetype was valid then uploadError is null
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        //FILE_TYPE_MAP check the mimetype in stor in extension 
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })

////////////////////////



//get all prodcuts 
router.get(`/`, async (req, res) => {
    
    // Query paramater => localhost:3000/api/v1/products?categories=234234,
    let filter = {};

    if(req.query.categories){
        filter = {category: req.query.categories.split(',')};
    }

    const productList = await Products.find(filter).populate('category');
    // const productList = await Products.find().populate('category');
    // const productList = await Products.find();
    // const productList = await Products.find().select('name image -_id');

    if(!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);

});

// get one product
router.get('/:id', async (req, res) =>{
    const product = await Products.findById(req.params.id).populate('category');

    if(!product){
        res.status(500).json({success: false});
    }

    res.send(product);
})

// save product 
router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');

    //multer
    const fileName = req.file.filename;
    //"http://localhost:3000/public/upload"
    //req.protocol === http
    //req.get(host) === localhost:3000
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  
    let product = new Products({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, //"http://localhost:3000/public/upload/image-3423523"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    console.log(product)

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product connot be created');

    res.send(product);

})

//update category
router.put('/:id', async (req, res) => {
    //checking the the product id is it validate
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product Id');
    }

    // checking the category id 
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const product = await Products.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new: true}
    )

    if(!product)
    return res.status(500).send('the product connot be updated! ');
    
    res.send(product);
})

// delete one product 
router.delete('/:id', (req, res) => {
    Products.findByIdAndRemove(req.params.id).then(product => {
        if(product){
            return res.status(200).json({success: true, message: 'the product is delted! '})
        } else {
            return res.status(404).json({success: false, message: 'product not found'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

// get products count how much products you have
router.get('/get/count', async (req, res) =>{
    const productCount = await Products.countDocuments((count) => count);

    if(!productCount){
        res.status(500).json({success: false});
    }

    res.send({
        productCount: productCount
    });
})

// get featured count how much featured is true
router.get('/get/featured/:count', async (req, res) =>{

    const count = req.params.count ? req.params.count : 0;
    // count is string limit accept the number the convert to number +count 
    const featuredProducts = await Products.find({isFeatured: true}).limit(+count);

    if(!featuredProducts){
        res.status(500).json({success: false});
    }

    res.send(featuredProducts);
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {

    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product Id');
    }
    
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files){
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Products.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new: true}
    )
    
    if(!product) 
        return res.status(500).send('the product connot be updated!');
    
    res.send(product);
})

module.exports = router;
