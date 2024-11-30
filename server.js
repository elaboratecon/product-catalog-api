const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const PORT = 9000

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection

db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Product Catalog DB'))

app.use(cors())
app.use(express.json())

app.use('/products', require('./routes/products'))
app.use('/categories', require('./routes/categories'))
app.use('/pet-types', require('./routes/petTypes'))

app.listen(PORT, () => {
    console.log(`CORS-enabled Product Catalog API listening on port ${PORT}...`)
})
