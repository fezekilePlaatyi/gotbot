require('../models/user.js')
const express = require('express')
const mongoose = require('mongoose')
const   User = mongoose.model('User')
const router = express.Router()

router.get('/', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users)
    })
})

module.exports = router