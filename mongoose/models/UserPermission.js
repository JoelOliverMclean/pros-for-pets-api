const mongoose = require("mongoose")
const { Schema, model } = mongoose

const userPermissionSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    permissionId: { 
        type: Schema.Types.ObjectId, 
        ref: "Permission", 
        required: true
    }
},{ toJSON: { getters: true, virtuals: true }})

const UserPermission = model("UserPermission", userPermissionSchema)
module.exports = UserPermission