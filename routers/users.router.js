const {User} = require('../models/users');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get All users
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    // const userList = await User.find().select('email passwordHash isAdmin');

    if(!userList) {
        res.status(500).json({success: false});
    }
    res.send(userList);
})



// Get one user
router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({success: false});
    }
    res.send(user);
})


router.post('/', async (req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 2),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartmetn: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if(!user)
    return res.status(404).send('the user connot be created!');

    res.status(200).send(user);

})

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    
    // if it null then it show the user not found
    if(!user) {
        return res.status(400).send('The user not found!');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){

        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        
        )
        
        res.status(200).send({user: user.email, token: token});
    } else {
        res.status(400).send('password is wrong')
    }

}) 


router.post('/register', async (req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 2),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartmetn: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if(!user)
    return res.status(404).send('the user connot be created!');

    res.status(200).send(user);

})

// delete one user 
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user){
            return res.status(200).json({success: true, message: 'the user is delted! '})
        } else {
            return res.status(404).json({success: false, message: 'user not found'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

// get users count how much users you have
router.get('/get/count', async (req, res) =>{
    const userCount = await User.countDocuments((count) => count);

    if(!userCount){
        res.status(500).json({success: false});
    }

    res.send({
        userCount: userCount
    });
})




module.exports = router;


// npm i -s bcryptjs