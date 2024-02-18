const express = require("express");
const { Business, Service } = require("../mongoose/models");
const router = express.Router();
const slugify = require("slugify");

router.post("/", async (req, res) => {
  let { name, description, id } = req.body;
  if (!name) return res.status(409).json({ error: "Name is required" });
  let slug = slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
  if (!description)
    return res.status(409).json({ error: "Description is required" });
  let business = await Business.findOne({ owner: req.user })
    .populate("services")
    .exec();
  if (!business) {
    return res
      .status(401)
      .json({ error: "Business required to manage services" });
  }
  let service = null;
  if (id) {
    service = await Service.findById(id).exec();
    if (!service) {
      return res.status(401).json({ error: "Service does not exist" });
    }
    if (!business.services.some((s) => s.id === id)) {
      return res
        .status(401)
        .json({ error: "Service does not belong to this business" });
    }
  } else {
    let existingService = await Service.findOne({
      name,
      business,
    }).exec();
    if (existingService) {
      return res
        .status(409)
        .json({ error: "Your business already has this service name" });
    }
    service = await Service.create({
      name,
      slug,
      description,
      business,
    });
    business.services.push(service._id);
    await business.save();
  }
  if (service.name !== name) service.name = name;
  if (service.slug !== slug) service.slug = slug;
  if (service.description !== description) service.description = description;
  await service.save();
  res.status(200).json(service);
});

router.get("/", async (req, res) => {
  const business = await Business.findOne({
    owner: req.user,
  }).exec();
  if (!business) {
    return req.status(409).json({ error: "You don't have a business" });
  }
  const services = await Service.find({
    business,
  }).exec();
  return res.status(200).json(services);
});

router.get("/:slug", async (req, res) => {
  let { slug } = req.params;
  if (!slug) {
    return res.status(409).json({ error: "Slug required" });
  }
  const business = await Business.findOne({
    owner: req.user,
  }).exec();
  if (!business) {
    return req.status(409).json({ error: "You don't have a business" });
  }
  const service = await Service.findOne({
    business,
    slug,
  }).exec();
  return res.status(200).json(service);
});

module.exports = router;
