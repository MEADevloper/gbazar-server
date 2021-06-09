const express = require('express');


const app = express(); 
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');
const authJwt = require('./helper/jwt');
const errorHandler = require('./helper/error-handler');
const expressJwt = require('express-jwt');


app.use(cors());
app.options('*', cors())

// Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
// json web token 
app.use(authJwt());
// directory of uploads the root path
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
//Authentecation error handling
app.use(errorHandler);


//Router 
const categoriesRoutes = require('./routers/categories.router');
const productsRouter = require('./routers/product.router');
const usersRouter = require('./routers/users.router');
const ordersRouter = require('./routers/orders.router');
//temp
const orderItemList = require('./routers/oreder-item.router');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
//temp
app.use(`${api}/orderitem`, orderItemList);

//Database

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'g-bazar'
})
.then(() => {
    console.log('Db Connected Successfuly');
})
.catch((error) => {
    console.error(error);
})


//Development
//Server 
// app.listen(3000, "192.168.8.10", () => {
//     console.log('server is running: http://192.168.8.10:3000');
// })


//production
var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port 
    console.log('Express is working on port ' + port)
})


