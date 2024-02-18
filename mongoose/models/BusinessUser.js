const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const businessUserSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    businessUserPets: [
      {
        type: Schema.Types.ObjectId,
        ref: "BusinessUserPet",
      },
    ],
  },
  { toJSON: { getters: true, virtuals: true } }
);

const BusinessUser = model("BusinessUser", businessUserSchema);
module.exports = BusinessUser;
