const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { storeCost, retrieveCost } = require("../../helpers/Utils");

const bookingSlotSchema = mongoose.Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      get: retrieveCost,
      set: storeCost,
    },
    spaces_left: {
      type: Number,
      required: true,
    },
    slots: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
    },
    locationLink: {
      type: String,
    },
    info: {
      type: String,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
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

const BookingSlot = model("BookingSlot", bookingSlotSchema);
module.exports = BookingSlot;
