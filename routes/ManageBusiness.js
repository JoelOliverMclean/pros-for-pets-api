const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const { Business, User, BusinessUser } = require("../mongoose/models");
const { getBookingRequests } = require("../beans/BookingSlotBean");

router.post("/", async (req, res) => {
  let { name, description, phone, email, website, address, id } = req.body;
  if (!name) return res.status(409).json({ error: "Name is required" });
  let slug = slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
  let business = null;
  if (id) {
    business = await Business.findById(id).exec();
    if (!business) {
      return res.status(401).json({ error: "Business does not exist" });
    }
    if (business.owner !== req.user) {
      return res.status(401).json({ error: "You are not the business owner" });
    }
  } else {
    let existingBusiness = await Business.findOne({
      $or: [{ name: name }, { owner: req.user }, { slug: slug }],
    }).exec();
    if (existingBusiness) {
      let result = {};
      if (existingBusiness.owner === req.user) {
        result.error = "You can only manage one business";
      } else if (existingBusiness.name === name) {
        result.error = "A business with that name already exists";
      } else if (existingBusiness.slug === slug) {
        result.error = "Another business is too similarly named";
      } else {
        result.error = "Cannot create business, please try again later";
      }
      return res.status(409).json(result);
    }
    business = await Business.create({
      name: name,
      slug: slug,
      owner: req.user,
    });
    User.findById(req.user.id)
      .exec()
      .then((user) => {
        user.business = business;
        user.save();
      });
  }
  if (business.name !== name) business.name = name;
  if (business.slug !== slug) business.slug = slug;
  if (business.phone !== phone) business.phone = phone;
  if (business.email !== email) business.email = email;
  if (business.address !== address) business.address = address;
  if (business.website !== website) business.website = website;
  if (business.description !== description) business.description = description;
  await business.save();
  let result = { ...business };
  res.status(200).json(result);
});

router.get("/", async (req, res) => {
  const business = await Business.findOne({
    owner: req.user,
  })
    .populate(["services"])
    .populate({
      path: "businessUsers",
      populate: [
        { path: "user" },
        { path: "businessUserPets", populate: "pet" },
      ],
    })
    .lean()
    .exec();
  let bookingRequests = [];
  if (business) bookingRequests = await getBookingRequests(business, req.user);
  return res.status(200).json({ business, bookingRequests });
});

router.post("/review-user/:id", async (req, res) => {
  let { id } = req.params;
  let { approved } = req.body;
  if (!id) {
    return res.status(409).json({ error: "Parameter 'id' required" });
  }
  if (approved === undefined) {
    return res
      .status(409)
      .json({ error: "Body parameter 'approved' required" });
  }
  let businessUser = await BusinessUser.findById(id).exec();
  if (!businessUser) {
    return res
      .status(404)
      .json({ error: "Cannot find request to approve/deny" });
  }
  if (approved) {
    businessUser.confirmed = true;
    await businessUser.save();
  } else {
    await BusinessUser.deleteOne({ id: businessUser.id });
  }
  return res.status(200).json({ approved });
});

router.post("/payment-instructions", async (req, res) => {
  let { paymentInstructions } = req.body;
  if (paymentInstructions === undefined) {
    return res
      .status(403)
      .json({ error: "Body param 'paymentInstructions' required" });
  }
  let business = await Business.findOne({
    owner: req.user._id,
  }).exec();
  if (!business) {
    return res.status(403).json({
      error: "Couldn't find your business",
    });
  }
  business.paymentInstructions = paymentInstructions;
  await business.save();
  return res.status(200).json({ paymentInstructions });
});

module.exports = router;
