const { Product } = require('../models/product');
const { Category } = require('../models/category')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  //cuando se agrega el .select es para especificar los campos
  //que se quieren retornar por ejemplo 'name image'
  //si no quiero ver el id solo debo agregar en el select '-_id'
  //para filtrar por categoria puedo colocar en la url api/v1/products?categories=id de la categoria
  //si son mas de una categoria se separan por comas (,) es decir
  //un array de strings

  let filter = {}
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') }
  }
  const productList = await Product.find(filter).populate('category');

  if (!productList) {
    res.status(500).json({ success: false })
  }
  res.send(productList);
})

router.get(`/:id`, async (req, res) => {
  //.populate() es para traer la info de otra tabla
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(500).json({ success: false })
  }
  res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  console.log('aaaaaaaa ', uploadOptions);
  console.log('bbbbbbbbbbbbb ', req);
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category')
  }

  const file = req.file;
  if (!file) return res.status(400).send('No image in the request');

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    price: req.body.price,
    category: req.body.category
  })

  const resp = await product.save();

  if (!resp) {
    return res.status(500).send('The product cannot be created')
  }

  return res.status(201).json(resp)

})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product Id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid Category');

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product!');

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      image: imagepath,
      price: req.body.price,
      category: req.body.category
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send('the product cannot be updated!');

  res.send(updatedProduct);
})

router.delete('/:id', async (req, res) => {
  const resp = await Product.findByIdAndRemove(req.params.id);

  if (!resp) {
    res.status(404).json({ success: false, messsage: 'Product not found' })
  }

  res.status(200).json({
    success: true,
    message: 'The Product is deleted!'
  })
})

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments()

  if (!productCount) {
    res.status(500).json({ success: false })
  }

  res.send({
    productCount
  })
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product Id');
  }
  const files = req.files;
  let imagesPaths = [];
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  if (files) {
    files.map((file) => {
      imagesPaths.push(`${basePath}${file.filename}`);
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      images: imagesPaths,
    },
    { new: true }
  );

  if (!product)
    return res.status(500).send('the gallery cannot be updated!');

  res.send(product);
}
);

module.exports = router