const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const businessUserPetSchema = new Schema(
  {
    businessUser: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUser",
      required: true,
    },
    pet: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  { toJSON: { getters: true, virtuals: true } }
);

const BusinessUserPet = model("BusinessUserPet", businessUserPetSchema);
module.exports = BusinessUserPet;
