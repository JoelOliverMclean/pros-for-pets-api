const express = require("express");
const router = express.Router();
const {
  Business,
  User,
  BusinessUser,
  BusinessUserPet,
  BookingSlot,
  Service,
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
  let bookingSlot = await BookingSlot.create({
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
  return res.status(200).json(bookingSlot);
});

router.get("/", async (req, res) => {
  let { pageSize, page, tense, service } = req.query;
  console.log(req.query);
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

module.exports = router;
