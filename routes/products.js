const express = require('express')
const router = express.Router()
const Inventory = require('../models/Inventory')

// import helper functions
const { isDefined, isNull } = require('../helperFunctions')

// middleware: get one item (used for GET one and PATCH one)
async function getInventoryItem(req, res, next) {
    const { params } = req
    const { id } = params
    let inventoryItem

    try {
        // Find the Inventory document that contains the product
        inventoryItem = await Inventory.findOne({
            'petTypes.categories.products._id': id,
        })

        if (!isDefined(inventoryItem)) {
            return res.status(404).json({ message: 'Product not found' })
        }

        // Traverse the nested structure to find the specific product
        let foundProduct = null
        inventoryItem.petTypes.forEach((petType) => {
            petType.categories.forEach((category) => {
                const product = category.products.find((prod) => prod._id.toString() === id)
                if (product) {
                    foundProduct = product
                }
            })
        })

        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found in nested structure' })
        }

        res.inventoryItem = foundProduct // Attach the product to the response
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET all
router.get('/', async (req, res) => {
    try {
        const inventory = await Inventory.find()
        res.send(inventory)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// GET one
router.get('/:id', getInventoryItem, (req, res) => {
    res.status(200).json(res.inventoryItem)
})

// POST one
router.post('/', async (req, res) => {
    const { body } = req
    const { petTypeName, categoryName, product } = body

    // request validation
    if (!petTypeName || !categoryName || !product) {
        return res.status(400).json({
            message: 'Missing required fields: petTypeName, categoryName, or product.',
        })
    }

    try {
        // check if an Inventory document exists
        let inventoryItem = await Inventory.findOne()

        if (!inventoryItem) {
            // create a new Inventory document from scratch and add item
            inventoryItem = new Inventory({
                petTypes: [
                    {
                        petTypeName,
                        categories: [
                            {
                                categoryName,
                                products: [product],
                            },
                        ],
                    },
                ],
            })
        } else {
            // find the petType
            let petType = inventoryItem.petTypes.find((petType) => petType.petTypeName === petTypeName)

            if (!petType) {
                // if petType does not exist, add it
                petType = {
                    petTypeName,
                    categories: [
                        {
                            categoryName,
                            products: [product],
                        },
                    ],
                }
                inventoryItem.petTypes.push(petType)
            } else {
                // find the category
                let category = petType.categories.find((cat) => cat.categoryName === categoryName)

                if (!category) {
                    // if category does not exist, add it
                    category = {
                        categoryName,
                        products: [product],
                    }
                    petType.categories.push(category)
                } else {
                    // add the product to the category
                    category.products.push(product)
                }
            }
        }

        // save the updated Inventory document
        const updatedInventory = await inventoryItem.save()
        res.status(201).json({
            message: 'Product added successfully!',
            updatedInventory,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// update (PATCH) one
router.patch('/:id', getInventoryItem, async (req, res) => {
    const { body } = req
    const { petTypeName, categoryName, product } = body

    // update petTypeName
    if (!isDefined(petTypeName)) {
        let inventoryItem = res.inventoryItem.petTypes[0]
        inventoryItem.petTypeName = petTypeName
    }

    // update categoryName
    if (!isDefined(categoryName)) {
        res.inventoryItem.petTypes[0].categories[0].categoryName = categoryName
    }

    // update product
    // if (!isNull(product)) {
    //     const { name, description, image, price, quantity } = product

    //     if (!isNull(name)) res.inventoryItem.name = name
    //     if (!isNull(description)) res.inventoryItem.description = description
    //     if (!isNull(image)) res.inventoryItem.image = image
    //     if (!isNull(price)) res.inventoryItem.price = price
    //     if (!isNull(quantity)) res.inventoryItem.quantity = quantity
    // }

    try {
        const updatedInventoryItem = await res.inventoryItem.save()
        res.json(updatedInventoryItem)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router
