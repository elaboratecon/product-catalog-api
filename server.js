const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const PORT = 9000

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection

db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Product Catalog DB'))

app.use(express.json())

app.use('/', require('./routes/products'))
app.use('/', require('./routes/products'))

app.listen(PORT, () => {
    console.log(`CORS-enabled Product Catalog API listening on port ${PORT}...`)
})
