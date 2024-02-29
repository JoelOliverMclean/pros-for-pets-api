const express = require("express");
const { Business, BusinessUser } = require("../mongoose/models");
const router = express.Router();

router.post("/apply/:id", async (req, res) => {
  let { id } = req.params;
  if (!id) {
    return res.status(409).json({ error: "Business ID required" });
  }
  let business = await Business.findById(id).populate("businessUsers").exec();
  if (!business) {
    return res.status(404).json({ error: "Cannot find business" });
  }
  let existingBusinessUser = await BusinessUser.findOne({
    business,
    user: req.user,
  });
  if (existingBusinessUser) {
    if (existingBusinessUser.confirmed) {
      return res
        .status(409)
        .json({ error: "You are already a client of this business" });
    } else {
      return res.status(409).json({ error: "Waiting for business approval" });
    }
  }
  let businessUser = await BusinessUser.create({
    business,
    user: req.user,
  });
  business.businessUsers.push(businessUser);
  await business.save();
  return res
    .status(200)
    .json({ error: `${business.name} will now review the request` });
});

router.get("/", async (req, res) => {
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
              populate: {
                path: "pet",
                select: "name slug owner",
                populate: {
                  path: "owner",
                  select: "firstname lastname username",
                },
              },
            },
          ],
        },
      },
    ])
    .exec();

  res.status(200).json({
    pros,
  });
});

module.exports = router;
