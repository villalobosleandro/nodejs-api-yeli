const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  image: {
    type: String
  },
  images: [{
    type: String
  }],
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  
})

productSchema.method('toJSON', function(){
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

exports.Product = mongoose.model('Product', productSchema);