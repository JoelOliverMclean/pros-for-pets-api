const express = require("express");
const router = express.Router();
const { Business, Service } = require("../../mongoose/models");
const { getBusinesses } = require("../../beans/BusinessBean");
const { isInteger } = require("../../helpers/Utils");
const { validateToken } = require("../../middleware/AuthMiddleware");
const { getBookingSlots } = require("../../beans/BookingSlotBean");

router.get("/", async (req, res) => {
  let { pageSize, page, searchTerm } = req.query;
  if (pageSize) pageSize = isInteger(pageSize) ? parseInt(pageSize) : null;
  if (page) page = isInteger(page) ? parseInt(page) : null;
  const { businesses, pages, results } = await getBusinesses(
    pageSize,
    page,
    searchTerm
  );
  return res.status(200).json({
    businesses,
    pages,
    results,
  });
});

router.get("/for-slug", validateToken, async (req, res) => {
  let { slug } = req.query;
  if (!slug) {
    return res.status(409).json({ error: "Identifier is required" });
  }
  const business = await Business.findOne({
    slug,
  })
    .populate("services")
    .populate({
      path: "businessUsers",
      populate: [
        { path: "user", select: "username" },
        { path: "businessUserPets", populate: "pet" },
      ],
    })
    .lean()
    .exec();
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }
  let { bookingSlots } = await getBookingSlots(
    4,
    0,
    business,
    "future",
    null,
    req.user,
    true
  );
  return res.status(200).json({
    business,
    bookingSlots,
  });
});

router.get("/slots", validateToken, async (req, res) => {
  let { slug, serviceSlug } = req.query;
  if (!slug) {
    return res.status(409).json({ error: "Identifier is required" });
  }
  const business = await Business.findOne({
    slug,
  }).exec();
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }
  let service = await Service.findOne({
    business,
    slug: serviceSlug,
  }).exec();
  let { bookingSlots } = await getBookingSlots(
    4,
    0,
    business,
    "future",
    service,
    req.user,
    true
  );
  return res.status(200).json({
    bookingSlots,
  });
});

module.exports = router;
