const express = require("express");
const {
  Business,
  BusinessUser,
  Booking,
  BusinessUserPet,
  Pet,
} = require("../mongoose/models");
const router = express.Router();
const moment = require("moment");

router.get("/dashboard", async (req, res) => {
  let pros = await BusinessUser.find({ user: req.user })
    .populate([
      "business",
      {
        path: "businessUserPets",
        populate: {
          path: "bookings",
          populate: [
            { path: "business", select: "name slug" },
            {
              path: "bookingSlot",
              select:
                "_id start_time end_time cost location info locationLink service",
              populate: { path: "service", select: "name" },
            },
            {
              path: "businessUserPet",
              select: "pet",
              populate: { path: "pet", select: "name slug" },
            },
          ],
        },
      },
    ])
    .exec();

  let bookings = [];
  let limit = 4;
  for (let i = 0; i < pros.length; i++) {
    for (let j = 0; j < pros[i].businessUserPets.length; j++) {
      for (let k = 0; k < pros[i].businessUserPets[j].bookings.length; k++) {
        let booking = pros[i].businessUserPets[j].bookings[k];
        if (
          moment(booking.start_time)
            .startOf("day")
            .isSameOrAfter(moment().startOf("day"))
        ) {
          bookings.push(booking);
        }
        if (bookings.length === limit) break;
      }
      if (bookings.length === limit) break;
    }
    if (bookings.length === limit) break;
  }

  res.status(200).json({
    pros,
    upcomingBookings: bookings.sort((a, b) => {
      moment(a.start_time).diff(b.start_time);
    }),
  });
});

module.exports = router;
