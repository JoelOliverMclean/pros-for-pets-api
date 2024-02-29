const express = require("express");
const router = express.Router();
const {
  Business,
  User,
  BusinessUser,
  BusinessUserPet,
  BookingSlot,
  Service,
  Booking,
} = require("../mongoose/models");
const { getBookingSlots } = require("../beans/BookingSlotBean");
const moment = require("moment");

router.post("/", async (req, res) => {
  let {
    service,
    cost,
    hours,
    info,
    location,
    locationLink,
    minutes,
    slots,
    startdate,
    starttime,
    id,
  } = req.body;
  let business = await Business.findOne({
    owner: req.user,
  });
  let start_time = moment(`${startdate} ${starttime}`);
  let end_time = moment(start_time).add(hours, "h").add(minutes, "m");
  let bookingSlot = null;
  if (id) {
    bookingSlot = await BookingSlot.findById(id).exec();
    (bookingSlot.start_time = start_time),
      (bookingSlot.end_time = end_time),
      (bookingSlot.cost = cost);
    let bookingCount = bookingSlot.slots - bookingSlot.spaces_left;
    if (bookingCount > slots) {
      return res
        .status(401)
        .json({ error: "Too many bookings to reduce slots by that amount" });
    }
    bookingSlot.slots = slots;
    bookingSlot.spaces_left = slots - bookingCount;
    bookingSlot.location = location;
    bookingSlot.locationLink = locationLink;
    bookingSlot.info = info;
    bookingSlot.service = service;
    await bookingSlot.save();
  } else {
    bookingSlot = await BookingSlot.create({
      business,
      start_time,
      end_time,
      cost,
      slots,
      spaces_left: slots,
      location,
      locationLink,
      info,
      service,
    });
  }
  return res.status(200).json(bookingSlot);
});

router.get("/", async (req, res) => {
  let { pageSize, page, tense, service } = req.query;
  let business = await Business.findOne({
    owner: req.user,
  }).populate("services");
  let { bookingSlots, pages, results } = await getBookingSlots(
    pageSize,
    page,
    business,
    tense,
    await Service.findOne({ slug: service })
  );
  return res
    .status(200)
    .json({ bookingSlots, pages, results, services: business.services });
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;
  let bookingSlot = await BookingSlot.findById(id).populate("service").exec();
  return res.status(200).json({ bookingSlot });
});

router.post("/review-request", async (req, res) => {
  let { booking_id, accepted } = req.body;
  if (booking_id === undefined) {
    return res.status(409).json({ error: "Param 'booking_id' required" });
  }
  if (accepted === undefined) {
    return res.status(409).json({ error: "Param 'accepted' required" });
  }
  let booking = await Booking.findById(booking_id).exec();
  if (!booking) {
    return res.status(404).json({ error: "Cannot find booking" });
  }
  booking.status = accepted ? "CONFIRMED" : "REJECTED";
  await booking.save();
  return res.status(200).json({});
});

module.exports = router;
