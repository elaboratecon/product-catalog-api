const express = require('express')
const router = express.Router()
const { PetType } = require('../models/Inventory')

// Add a new pet type
router.post('/', async (req, res) => {
    const { petTypeName } = req.body

    if (!petTypeName) {
        return res.status(400).json({ message: 'petTypeName is required' })
    }

    try {
        // Check if the pet type already exists
        const existingPetType = await PetType.findOne({ petTypeName })
        if (existingPetType) {
            return res.status(400).json({ message: `Pet type '${petTypeName}' already exists` })
        }

        const petType = new PetType({ petTypeName })
        const savedPetType = await petType.save()
        res.status(201).json({ message: 'Pet type created successfully', petType: savedPetType })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
