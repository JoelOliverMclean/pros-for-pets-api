const mongoose = require("mongoose")
const { Schema, model } = mongoose

const roleSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        required: true,
    }
},{ toJSON: { getters: true, virtuals: true }})

const Role = model("Role", roleSchema)
module.exports = Role