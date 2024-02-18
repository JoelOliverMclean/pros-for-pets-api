const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
  },
  { toJSON: { getters: true, virtuals: true } }
);

userSchema.virtual("permissions", {
  ref: "UserPermission",
  localField: "_id",
  foreignField: "permissionId",
});

const User = model("User", userSchema);
module.exports = User;
