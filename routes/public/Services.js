const express = require("express");
const { Service, Business } = require("../../mongoose/models");
const router = express.Router();

router.get("/:business_slug", async (req, res) => {
  let { business_slug } = req.params;
  if (!business_slug) {
    return res.status(409).json({ error: "Business Slug Required" });
  }
  let business = await Business.findOne({ slug: business_slug }).exec();
  if (!business) {
    return res.status(404).json({ error: "Cannot find business" });
  }
  let services = await Service.find({
    business,
  });
  return res.status(200).json(services);
});

module.exports = router;
