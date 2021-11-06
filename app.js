const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

require('dotenv/config')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler');
app.use(cors());
app.options('*', cors())
const api = process.env.API_URL
const productsRouter = require('./routes/products')
const categoriesRouter = require('./routes/categories')
const usersRouter = require('./routes/users')

//middleware
app.use(express.json());// para poder leer la data tipo json que viene del front
app.use(morgan('tiny'));// esto sirve para ver en consola las url que se consultan
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//routers
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`, usersRouter)


mongoose.connect(process.env.DATABASE_URL)
.then(() => {
  console.log('base de datos conectada');
})
.catch((err) => {
  console.log('error ', err);
})

app.listen(5000, () => {
  console.log('server is running', 5000 + api);
})