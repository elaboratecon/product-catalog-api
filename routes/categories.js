const express = require('express')
const router = express.Router()
const { Category, PetType } = require('../models/Inventory')

/*
    We first need to manually add categories before we can look them up.
    We could do this inline in the products code but it's nicer to break it out into a separate file.
*/

// add a category
router.post('/', async (req, res) => {
    const { categoryName, petTypeName } = req.body

    if (!categoryName || !petTypeName) {
        return res.status(400).json({ message: 'Missing required fields: categoryName or petTypeName' })
    }

    try {
        const petType = await PetType.findOne({ petTypeName })
        if (!petType) {
            return res.status(404).json({ message: `Pet type '${petTypeName}' not found` })
        }

        const newCategory = new Category({
            categoryName,
            petTypeId: petType._id,
        })

        const savedCategory = await newCategory.save()
        res.status(201).json({ message: 'Category created successfully', category: savedCategory })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
