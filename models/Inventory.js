const mongoose = require('mongoose')

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
})

// Category Schema
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        enum: ['food', 'toys', 'treats', 'wellness', 'supplies'],
    },
    products: {
        type: [productSchema],
        required: true,
    },
})

// Pet Type Schema
const petTypeSchema = new mongoose.Schema({
    petTypeName: {
        type: String,
        required: true,
        enum: ['dog', 'cat'],
    },
    categories: {
        type: [categorySchema],
        required: true,
    },
})

// Main Schema
const inventorySchema = new mongoose.Schema({
    petTypes: {
        type: [petTypeSchema],
        required: true,
    },
})

const Inventory = mongoose.model('Inventory', inventorySchema)

module.exports = Inventory
