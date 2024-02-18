const models = require("./models")
const bcrypt = require("bcryptjs")

const seed = async () => {
    let superpermission = await models.Permission.findOne({
        name: "super"
    }).exec()
    if (!superpermission) {
        superpermission = await models.Permission.create({
            name: "super",
            description: "Permission to do anything"
        })
    }

    let superuser = await models.User.findOne({
        username: "admin"
    }).populate("permissions").exec()
    if (!superuser) {
        let hashedPassword = await bcrypt.hash(process.env.SUPERUSERPASSWORD, 10)
        await models.User.create({
            username: "admin",
            password: hashedPassword,
            firstname: "super",
            lastname: "user"
        })
    }

    let superuserpermission = await models.UserPermission.findOne({
        userId: superuser._id,
        permissionId: superpermission._id
    }).exec()
    if (!superuserpermission) {
        await models.UserPermission.create({
            userId: superuser._id,
            permissionId: superpermission._id
        })
    }
}

module.exports = { seed }