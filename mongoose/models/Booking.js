const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { storeCost, retrieveCost } = require("../../helpers/Utils");

const bookingSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    bookingSlot: {
      type: Schema.Types.ObjectId,
      ref: "BookingSlot",
      required: true,
    },
    businessUserPet: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUserPet",
      required: true,
    },
    start_time: {
      type: Date,
      required: false,
    },
    end_time: {
      type: Date,
      required: false,
    },
    cost: {
      type: Number,
      required: true,
      get: retrieveCost,
      set: storeCost,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { getters: true, virtuals: true } }
);

bookingSchema.virtual("confirmed").get(function () {
  return this.status === "CONFIRMED";
});

const Booking = model("Booking", bookingSchema);
module.exports = Booking;
