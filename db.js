require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = new mongoose.Schema({
    email: String,
    password: String
})

user.methods.authorize = function () {
    const token = jwt.sign({ _id: this._id }, process.env.ACCESS_KEY_SECRET)
    return token
}
const User = mongoose.model("user", user)


module.exports = User