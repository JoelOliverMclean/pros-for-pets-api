const express = require("express");
const router = express.Router();
const { User, Pet, Booking } = require("../mongoose/models");
const moment = require("moment");
const slugify = require("slugify");

router.post("/", async (req, res) => {
  let { name, breed, colour, description, dob, id } = req.body;
  if (!name) return res.status(409).json({ error: "Name is required" });
  let slug = slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
  let pet = null;
  if (id) {
    pet = await Pet.findById(id).exec();
  } else {
    let existingPet = await Pet.findOne({
      $and: [
        {
          $or: [{ name: name }, { slug: slug }],
        },
        {
          owner: req.user,
        },
      ],
    });
    if (existingPet) {
      return res
        .status(409)
        .json({ error: "You already have a pet with that name" });
    }
    pet = await Pet.create({
      name,
      slug,
      owner: req.user,
    });
    User.findById(req.user.id)
      .populate("pets")
      .exec()
      .then((user) => {
        user.pets.push(pet);
        user.save();
      });
  }
  if (pet.name !== name) pet.name = name;
  if (pet.slug !== slug) pet.slug = slug;
  if (pet.breed !== breed) pet.breed = breed;
  if (pet.colour !== colour) pet.colour = colour;
  if (pet.description !== description) pet.description = description;
  if (pet.dob !== moment(dob)) pet.dob = moment(dob);
  await pet.save();
  let result = { ...pet };
  res.status(200).json(result);
});

router.get("/", async (req, res) => {
  let { username, id } = req.query;
  let where = {};
  if (username) {
    const owner = await User.findOne({ username }).exec();
    where.owner = owner;
  }
  if (id) {
    where._id = id;
  }
  const pets = await Pet.find(where).populate("owner").exec();
  return res.status(200).json(pets);
});

router.get("/:slug", async (req, res) => {
  let { slug } = req.params;
  if (!slug) {
    return res.status(409).json({ error: "slug required" });
  }
  let pet = await Pet.findOne({ slug })
    .populate([
      {
        path: "businessUserPets",
        populate: [
          {
            path: "businessUser",
            populate: {
              path: "business",
              select: "name slug",
            },
          },
          {
            path: "bookings",
          },
        ],
      },
    ])
    .exec();
  if (!pet) {
    return res.status(404).json({ error: "Pet not found" });
  }
  let upcomingBookings = await Booking.find({
    businessUserPet: {
      $in: pet.businessUserPets,
    },
  }).exec();
  res.status(200).json({ pet, upcomingBookings });
});

module.exports = router;
