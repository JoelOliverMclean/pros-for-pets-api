const express = require("express");
const {
  Business,
  BusinessUser,
  BusinessUserPet,
  Pet,
} = require("../mongoose/models");
const router = express.Router();

router.post("/apply/:id", async (req, res) => {
  let { id } = req.params;
  if (!id) {
    return res.status(409).json({ error: "Business ID required" });
  }
  let businessUser = await BusinessUser.findOne({
    business: id,
    user: req.user,
  })
    .populate("businessUserPets")
    .exec();
  if (!businessUser) {
    return res.status(409).json({ error: "Must be a client" });
  }
  let pet = await Pet.findOne({
    owner: req.user,
  })
    .populate("businessUserPets")
    .exec();
  let existingBusinessUserPet = await BusinessUserPet.findOne({
    businessUser,
    pet,
  }).exec();
  if (existingBusinessUserPet) {
    return res.status(409).json({ error: "Pet already registered" });
  }
  let businessUserPet = await BusinessUserPet.create({
    businessUser,
    pet,
  });
  businessUser.businessUserPets.push(businessUserPet);
  pet.businessUserPets.push(businessUserPet);
  await businessUser.save();
  await pet.save();
  return res.status(200).json(businessUserPet);
});

module.exports = router;
