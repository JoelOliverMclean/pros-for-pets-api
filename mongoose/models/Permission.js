const mongoose = require("mongoose")
const { Schema, model } = mongoose

const permissionSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    description: {
        type: String,
        required: true,
    }
},{ toJSON: { getters: true, virtuals: true }})

const Permission = model("Permission", permissionSchema)
module.exports = Permission