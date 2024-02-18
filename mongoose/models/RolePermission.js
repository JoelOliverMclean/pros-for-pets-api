const mongoose = require("mongoose")
const { Schema, model } = mongoose

const rolePermissionSchema = new Schema({
    roleId: { 
        type: Schema.Types.ObjectId, 
        ref: "Role",
        required: true
    },
    permissionId: { 
        type: Schema.Types.ObjectId, 
        ref: "Permission", 
        required: true
    }
},{ toJSON: { getters: true, virtuals: true }})

const RolePermission = model("RolePermission", rolePermissionSchema)
module.exports = RolePermission