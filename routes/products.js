const express = require('express')
const router = express.Router()
const { Product, Category, PetType } = require('../models/Inventory')
const { isDefined } = require('../helperFunctions')

// MIDDLEWARE: Resolve petTypeName and categoryName to ObjectIds
async function resolveCategory(req, res, next) {
    const { categoryName, petTypeName } = req.body

    if (!categoryName || !petTypeName) {
        return res.status(400).json({ message: 'Missing required categoryName or petTypeName' })
    }

    try {
        // find the pet type
        const petType = await PetType.findOne({ petTypeName })
        if (!petType) {
            return res.status(404).json({ message: `Pet type '${petTypeName}' not found` })
        }

        // find the category under this pet type
        const category = await Category.findOne({ categoryName, petTypeId: petType._id })
        if (!category) {
            return res
                .status(404)
                .json({ message: `Category '${categoryName}' not found under pet type '${petTypeName}'` })
        }

        res.category = category
        next()
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId')
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// get all products by petType (grouped by category)
router.get('/grouped/:petTypeName', async (req, res) => {
    const { petTypeName } = req.params

    try {
        // find the petType by name
        const petType = await PetType.findOne({ petTypeName })
        if (!petType) {
            return res.status(404).json({ message: `Pet type '${petTypeName}' not found` })
        }

        // perform aggregation to group products by category
        const results = await Category.aggregate([
            { $match: { petTypeId: petType._id } }, // match categories for petType
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'products',
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryName: 1,
                    products: 1,
                },
            },
        ])

        res.json(results)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// get one product
router.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const product = await Product.findById(id).populate('categoryId')
        if (!product) return res.status(404).json({ message: 'Product not found' })

        res.json(product)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// add a product
router.post('/', resolveCategory, async (req, res) => {
    const { name, description, image, price, quantity } = req.body

    if (!name || !description || !image || price === undefined || quantity === undefined) {
        return res.status(400).json({ message: 'Missing required product fields' })
    }

    try {
        const newProduct = new Product({
            name,
            description,
            image,
            price,
            quantity,
            categoryId: res.category._id,
        })

        const savedProduct = await newProduct.save()
        res.status(201).json({ message: 'Product created successfully', product: savedProduct })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// update a product
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { name, description, image, price, quantity } = req.body

    try {
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: 'Product not found' })

        // update applicable fields
        if (isDefined(name)) product.name = name
        if (isDefined(description)) product.description = description
        if (isDefined(image)) product.image = image
        if (isDefined(price)) product.price = price
        if (isDefined(quantity)) product.quantity = quantity

        const updatedProduct = await product.save()
        res.json({ message: 'Product updated successfully', product: updatedProduct })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
