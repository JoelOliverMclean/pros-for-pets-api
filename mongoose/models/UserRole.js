const mongoose = require("mongoose")
const { Schema, model } = mongoose

const userRoleSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    roleId: { 
        type: Schema.Types.ObjectId, 
        ref: "Role", 
        required: true
    }
},{ toJSON: { getters: true, virtuals: true }})

const UserRole = model("UserRole", userRoleSchema)
module.exports = UserRole