const mongoose = require('mongoose')

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
})

// Category Schema
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        enum: ['food', 'toys', 'treats', 'wellness', 'supplies'],
    },
    petTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetType', required: true },
})

// Pet Type Schema
const petTypeSchema = new mongoose.Schema({
    petTypeName: { type: String, required: true, enum: ['dog', 'cat'] },
})

const PetType = mongoose.model('PetType', petTypeSchema)
const Category = mongoose.model('Category', categorySchema)
const Product = mongoose.model('Product', productSchema)

module.exports = { PetType, Category, Product }
