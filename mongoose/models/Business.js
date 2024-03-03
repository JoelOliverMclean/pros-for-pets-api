const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const businessSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    paymentInstructions: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    businessUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "BusinessUser",
      },
    ],
    bookingSlots: [
      {
        type: Schema.Types.ObjectId,
        ref: "BookingSlot",
      },
    ],
  },
  { toJSON: { getters: true, virtuals: true } }
);

businessSchema.methods.getIsClientOf = async (user) => {
  const businessUser = await mongoose
    .model("BusinessUser")
    .findOne({
      business: this,
      user: user,
      confirmed: true,
    })
    .exec();
  return businessUser !== undefined;
};

const Business = model("Business", businessSchema);
module.exports = Business;
